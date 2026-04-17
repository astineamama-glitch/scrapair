import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Collection, WastePost, User, Notification } from '../../models';
import {
  normalizeCollectionList,
  normalizeCollectionPayload,
  normalizeCollectionStatus
} from '../../utils/collectionNormalization';
import {
  getRequestBaseUrl,
  normalizeWastePostList
} from '../../utils/wastePostNormalization';

const ACTIVE_REQUEST_STATUSES = ['pending', 'requested', 'approved', 'scheduled'];

const getCollectionIncludes = () => ([
  {
    model: WastePost,
    as: 'post',
    attributes: [
      'id',
      'businessId',
      'title',
      'description',
      'wasteType',
      'quantity',
      'unit',
      'condition',
      'location',
      'city',
      'address',
      'images',
      'status',
      'collectionStatus',
      'pickupDeadline',
      'pickedUpAt',
      'approvedRecyclerId'
    ]
  },
  {
    model: User,
    as: 'business',
    attributes: ['id', 'email', 'businessName', 'companyName', 'phone', 'type']
  },
  {
    model: User,
    as: 'recycler',
    attributes: ['id', 'email', 'businessName', 'companyName', 'phone', 'type']
  }
]);

const generateTransactionCode = (postId: number, recyclerId: number): string => {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = `${postId}${recyclerId}${Date.now()}`.slice(-6);
  return `COLL-${stamp}-${suffix}`;
};

const getNotificationTitle = (type: 'request' | 'approved' | 'rejected' | 'cancelled' | 'confirmed') => {
  switch (type) {
    case 'request':
      return 'New Collection Request';
    case 'approved':
      return 'Collection Approved';
    case 'rejected':
      return 'Collection Rejected';
    case 'cancelled':
      return 'Collection Cancelled';
    case 'confirmed':
      return 'Pickup Confirmed';
    default:
      return 'Collection Update';
  }
};

const resetPostCollectionState = async (post: any | null) => {
  if (!post) {
    return;
  }

  post.collectionStatus = 'ACTIVE';
  post.approvedRecyclerId = null;
  post.pickupDeadline = null;
  post.pickedUpAt = null;
  post.status = 'active';
  await post.save();
};

export const getAvailablePosts = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, wasteType, city } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = { status: 'active', visibility: 'public' };
    if (wasteType) whereClause.wasteType = wasteType;
    if (city) whereClause.city = city;

    const { count, rows } = await WastePost.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'business', attributes: ['id', 'businessName', 'email', 'phone', 'type'] }],
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const baseUrl = getRequestBaseUrl(req);

    res.status(200).json({
      message: 'Available posts retrieved successfully',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: normalizeWastePostList(rows, baseUrl)
    });
  } catch (error: any) {
    console.error('Error fetching available posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getUserCollections = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.type;
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const whereClause: any = {};

    if (userType === 'business') {
      whereClause.businessId = userId;
    } else if (userType === 'recycler') {
      whereClause.recyclerId = userId;
    } else {
      whereClause[Op.or] = [{ businessId: userId }, { recyclerId: userId }];
    }

    if (status) {
      const normalizedStatus = normalizeCollectionStatus(status);
      whereClause.status =
        normalizedStatus === 'pending'
          ? { [Op.in]: ['pending', 'requested'] }
          : normalizedStatus;
    }

    const { count, rows } = await Collection.findAndCountAll({
      where: whereClause,
      include: getCollectionIncludes(),
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    });

    res.status(200).json({
      message: 'Collections retrieved successfully',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: normalizeCollectionList(rows, req)
    });
  } catch (error: any) {
    console.error('Error fetching user collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
};

export const getCollectionById = async (req: Request, res: Response): Promise<any> => {
  try {
    const collectionId = parseInt(req.params.collectionId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const collection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.businessId !== userId && collection.recyclerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this collection' });
    }

    res.status(200).json({
      message: 'Collection retrieved successfully',
      data: normalizeCollectionPayload(collection, req)
    });
  } catch (error: any) {
    console.error('Error fetching collection details:', error);
    res.status(500).json({ error: 'Failed to fetch collection details' });
  }
};

export const requestCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const recyclerId = req.user?.id;
    const userType = req.user?.type;
    const postId = parseInt(req.body.postId, 10);
    const scheduledDate = req.body.proposedDate || req.body.scheduledDate || null;

    if (!recyclerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (userType !== 'recycler') {
      return res.status(403).json({ error: 'Only recyclers can request collections' });
    }

    if (!postId) {
      return res.status(400).json({ error: 'postId is required' });
    }

    const post = await WastePost.findByPk(postId);

    if (!post) {
      return res.status(404).json({ error: 'Waste post not found' });
    }

    if (post.businessId === recyclerId) {
      return res.status(400).json({ error: 'Cannot request collection for your own post' });
    }

    if (post.status === 'collected') {
      return res.status(400).json({ error: 'This waste post has already been collected' });
    }

    if (post.status === 'in-collection' || post.approvedRecyclerId) {
      return res.status(400).json({ error: 'This waste post is already reserved for collection' });
    }

    const existingRequest = await Collection.findOne({
      where: {
        postId,
        recyclerId,
        status: { [Op.in]: ACTIVE_REQUEST_STATUSES }
      }
    });

    if (existingRequest) {
      return res.status(409).json({ error: 'You already have an active request for this post' });
    }

    const collection = await Collection.create({
      postId,
      businessId: post.businessId,
      recyclerId,
      scheduledDate,
      status: 'pending',
      requestDate: new Date().toISOString(),
      transactionCode: generateTransactionCode(postId, recyclerId)
    } as any);

    await Notification.create({
      userId: post.businessId,
      type: 'COLLECTION_REQUEST',
      title: getNotificationTitle('request'),
      message: `A recycler requested to collect "${post.title}".`,
      relatedId: collection.id,
      read: false
    });

    const hydratedCollection = await Collection.findByPk(collection.id, {
      include: getCollectionIncludes()
    });

    res.status(201).json({
      message: 'Collection request created successfully',
      data: normalizeCollectionPayload(hydratedCollection, req)
    });
  } catch (error: any) {
    console.error('Error creating collection request:', error);
    res.status(500).json({ error: 'Failed to create collection request' });
  }
};

export const approveCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const collectionId = parseInt(req.params.collectionId, 10);
    const scheduledDate = req.body.scheduledDate || null;
    const businessId = req.user?.id;
    const userType = req.user?.type;

    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (userType !== 'business') {
      return res.status(403).json({ error: 'Only business users can approve collections' });
    }

    const collection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.businessId !== businessId) {
      return res.status(403).json({ error: 'Only the business owner can approve collections' });
    }

    if (!['pending', 'requested'].includes(collection.status)) {
      return res.status(400).json({ error: `Cannot approve a collection with status '${collection.status}'` });
    }

    const pickupDeadline = new Date();
    pickupDeadline.setHours(pickupDeadline.getHours() + 1);

    const post = (collection as any).post;
    if (post?.approvedRecyclerId && post.approvedRecyclerId !== collection.recyclerId) {
      return res.status(400).json({ error: 'This waste post is already reserved for another recycler' });
    }

    collection.status = 'approved';
    collection.scheduledDate = scheduledDate || collection.scheduledDate || null;
    await collection.save();

    if (post) {
      post.collectionStatus = 'RESERVED';
      post.approvedRecyclerId = collection.recyclerId;
      post.pickupDeadline = pickupDeadline;
      post.status = 'in-collection';
      await post.save();
    }

    await Notification.create({
      userId: collection.recyclerId,
      type: 'COLLECTION_REQUEST',
      title: getNotificationTitle('approved'),
      message: `Your collection request has been approved. You have 1 hour to pick up "${post?.title || 'the material'}".`,
      relatedId: collection.id,
      read: false
    });

    const refreshedCollection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    res.status(200).json({
      message: 'Collection approved successfully. Recycler has 1 hour to pick up.',
      data: normalizeCollectionPayload(refreshedCollection, req)
    });
  } catch (error: any) {
    console.error('Error approving collection:', error);
    res.status(500).json({ error: 'Failed to approve collection' });
  }
};

export const scheduleCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const collectionId = parseInt(req.params.collectionId, 10);
    const scheduledDate = req.body.scheduledDate;
    const businessId = req.user?.id;
    const userType = req.user?.type;

    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (userType !== 'business') {
      return res.status(403).json({ error: 'Only business users can schedule collections' });
    }

    if (!scheduledDate) {
      return res.status(400).json({ error: 'scheduledDate is required' });
    }

    const collection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.businessId !== businessId) {
      return res.status(403).json({ error: 'Only the business owner can schedule collections' });
    }

    if (!['approved', 'scheduled'].includes(collection.status)) {
      return res.status(400).json({ error: `Cannot schedule a collection with status '${collection.status}'` });
    }

    collection.status = 'scheduled';
    collection.scheduledDate = scheduledDate;
    await collection.save();

    await Notification.create({
      userId: collection.recyclerId,
      type: 'COLLECTION_REQUEST',
      title: 'Collection Scheduled',
      message: `Collection for "${(collection as any).post?.title || 'the material'}" was scheduled for ${scheduledDate}.`,
      relatedId: collection.id,
      read: false
    });

    const refreshedCollection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    res.status(200).json({
      message: 'Collection scheduled successfully',
      data: normalizeCollectionPayload(refreshedCollection, req)
    });
  } catch (error: any) {
    console.error('Error scheduling collection:', error);
    res.status(500).json({ error: 'Failed to schedule collection' });
  }
};

export const rejectCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const collectionId = parseInt(req.params.collectionId, 10);
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
    const businessId = req.user?.id;
    const userType = req.user?.type;

    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (userType !== 'business') {
      return res.status(403).json({ error: 'Only business users can reject collections' });
    }

    const collection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.businessId !== businessId) {
      return res.status(403).json({ error: 'Only the business owner can reject collections' });
    }

    if (!ACTIVE_REQUEST_STATUSES.includes(collection.status)) {
      return res.status(400).json({ error: `Cannot reject a collection with status '${collection.status}'` });
    }

    collection.status = 'rejected';
    collection.rejectionCount = (collection.rejectionCount || 0) + 1;
    await collection.save();

    await resetPostCollectionState((collection as any).post);

    await Notification.create({
      userId: collection.recyclerId,
      type: 'COLLECTION_REQUEST',
      title: getNotificationTitle('rejected'),
      message: reason
        ? `Your collection request was rejected. Reason: ${reason}`
        : 'Your collection request was rejected.',
      relatedId: collection.id,
      read: false
    });

    const refreshedCollection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    res.status(200).json({
      message: 'Collection rejected successfully',
      data: normalizeCollectionPayload(refreshedCollection, req)
    });
  } catch (error: any) {
    console.error('Error rejecting collection:', error);
    res.status(500).json({ error: 'Failed to reject collection' });
  }
};

export const confirmPickup = async (req: Request, res: Response): Promise<any> => {
  try {
    const collectionId = parseInt(req.params.collectionId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const collection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.recyclerId !== userId && collection.businessId !== userId) {
      return res.status(403).json({ error: 'Not authorized to confirm this pickup' });
    }

    if (!['approved', 'scheduled'].includes(collection.status)) {
      return res.status(400).json({ error: 'Collection must be approved or scheduled to confirm pickup' });
    }

    collection.status = 'completed';
    collection.completedAt = new Date();
    collection.confirmedBy = collection.recyclerId === userId ? 'recycler' : 'business';
    await collection.save();

    const post = (collection as any).post;
    if (post) {
      post.collectionStatus = 'PICKED_UP';
      post.pickedUpAt = new Date();
      post.status = 'collected';
      post.approvedRecyclerId = null;
      post.pickupDeadline = null;
      await post.save();
    }

    const otherUserId = collection.recyclerId === userId ? collection.businessId : collection.recyclerId;
    await Notification.create({
      userId: otherUserId,
      type: 'COLLECTION_REQUEST',
      title: getNotificationTitle('confirmed'),
      message: `Pickup for "${post?.title || 'the material'}" has been confirmed.`,
      relatedId: collection.id,
      read: false
    });

    const refreshedCollection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    res.status(200).json({
      message: 'Pickup confirmed successfully',
      data: normalizeCollectionPayload(refreshedCollection, req)
    });
  } catch (error: any) {
    console.error('Error confirming pickup:', error);
    res.status(500).json({ error: 'Failed to confirm pickup' });
  }
};

export const acceptMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const collectionId = parseInt(req.params.collectionId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const collection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.recyclerId !== userId) {
      return res.status(403).json({ error: 'Only the recycler can accept materials' });
    }

    if (collection.status !== 'completed') {
      return res.status(400).json({ error: `Cannot accept materials for a collection with status '${collection.status}'` });
    }

    collection.status = 'confirmed';
    await collection.save();

    const post = (collection as any).post;
    if (post) {
      post.collectionStatus = 'COMPLETED';
      await post.save();
    }

    await Notification.create({
      userId: collection.businessId,
      type: 'COLLECTION_REQUEST',
      title: 'Materials Accepted',
      message: `The recycler accepted materials for "${post?.title || 'the material'}".`,
      relatedId: collection.id,
      read: false
    });

    const refreshedCollection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    res.status(200).json({
      message: 'Materials accepted successfully',
      data: normalizeCollectionPayload(refreshedCollection, req)
    });
  } catch (error: any) {
    console.error('Error accepting materials:', error);
    res.status(500).json({ error: 'Failed to accept materials' });
  }
};

export const cancelCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const collectionId = parseInt(req.params.collectionId, 10);
    const userId = req.user?.id;
    const cancellationReason =
      typeof req.body.cancellationReason === 'string' ? req.body.cancellationReason : null;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const collection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.recyclerId !== userId && collection.businessId !== userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this collection' });
    }

    if (!ACTIVE_REQUEST_STATUSES.includes(collection.status)) {
      return res.status(400).json({ error: `Cannot cancel a collection with status '${collection.status}'` });
    }

    collection.status = 'cancelled';
    collection.cancellationReason = cancellationReason as any;

    if (collection.recyclerId === userId) {
      collection.cancellationCount = (collection.cancellationCount || 0) + 1;
    }

    await collection.save();
    await resetPostCollectionState((collection as any).post);

    const otherUserId = collection.recyclerId === userId ? collection.businessId : collection.recyclerId;
    await Notification.create({
      userId: otherUserId,
      type: 'COLLECTION_REQUEST',
      title: getNotificationTitle('cancelled'),
      message: `Collection for "${(collection as any).post?.title || 'the material'}" was cancelled.`,
      relatedId: collection.id,
      read: false
    });

    const refreshedCollection = await Collection.findByPk(collectionId, {
      include: getCollectionIncludes()
    });

    res.status(200).json({
      message: 'Collection cancelled successfully',
      data: normalizeCollectionPayload(refreshedCollection, req)
    });
  } catch (error: any) {
    console.error('Error cancelling collection:', error);
    res.status(500).json({ error: 'Failed to cancel collection' });
  }
};
