import { Request } from 'express';
import {
  getRequestBaseUrl,
  normalizeWastePostPayload
} from './wastePostNormalization';

export const normalizeCollectionStatus = (status: unknown): string => {
  if (typeof status !== 'string') {
    return 'pending';
  }

  const normalized = status.trim().toLowerCase();

  if (!normalized) {
    return 'pending';
  }

  if (normalized === 'requested') {
    return 'pending';
  }

  return normalized;
};

export const normalizeCollectionPayload = <T extends Record<string, any> | null | undefined>(
  collection: T,
  reqOrBaseUrl: Request | string
): T => {
  if (!collection || typeof collection !== 'object') {
    return collection;
  }

  const baseUrl = typeof reqOrBaseUrl === 'string' ? reqOrBaseUrl : getRequestBaseUrl(reqOrBaseUrl);
  const plainCollection = typeof (collection as any).get === 'function'
    ? (collection as any).get({ plain: true })
    : collection;
  const post = plainCollection.post
    ? normalizeWastePostPayload(plainCollection.post, baseUrl)
    : null;
  const status = normalizeCollectionStatus(plainCollection.status);

  return {
    ...plainCollection,
    status,
    post,
    postId: plainCollection.postId ?? post?.id ?? null,
    recyclerId: plainCollection.recyclerId ?? plainCollection.recycler?.id ?? null,
    businessId: plainCollection.businessId ?? plainCollection.business?.id ?? null,
    pickupDeadline: plainCollection.pickupDeadline ?? post?.pickupDeadline ?? null,
    collectionStatus: plainCollection.collectionStatus ?? post?.collectionStatus ?? null,
    title: plainCollection.title ?? post?.title ?? null,
    wasteType: plainCollection.wasteType ?? post?.wasteType ?? null,
    quantity: plainCollection.quantity ?? post?.quantity ?? null,
    unit: plainCollection.unit ?? post?.unit ?? null,
    condition: plainCollection.condition ?? post?.condition ?? null,
    description: plainCollection.description ?? post?.description ?? null,
    address: plainCollection.address ?? post?.address ?? null,
    city: plainCollection.city ?? post?.city ?? null,
    location: plainCollection.location ?? post?.location ?? null,
    images: plainCollection.images ?? post?.images ?? [],
    imageUrl: plainCollection.imageUrl ?? post?.imageUrl ?? null,
    recyclerName:
      plainCollection.recyclerName ||
      plainCollection.recycler?.companyName ||
      plainCollection.recycler?.businessName ||
      plainCollection.recycler?.email ||
      null,
    recyclerEmail: plainCollection.recyclerEmail || plainCollection.recycler?.email || null,
    postTitle: plainCollection.postTitle || post?.title || null,
    postWasteType: plainCollection.postWasteType || post?.wasteType || null,
    postCondition: plainCollection.postCondition || post?.condition || null,
    postQuantity: plainCollection.postQuantity ?? post?.quantity ?? null,
    postUnit: plainCollection.postUnit || post?.unit || null
  } as T;
};

export const normalizeCollectionList = <T extends Record<string, any>>(
  collections: T[] | null | undefined,
  reqOrBaseUrl: Request | string
): T[] => {
  if (!Array.isArray(collections)) {
    return [];
  }

  const baseUrl = typeof reqOrBaseUrl === 'string' ? reqOrBaseUrl : getRequestBaseUrl(reqOrBaseUrl);

  return collections.map((collection) => normalizeCollectionPayload(collection, baseUrl));
};
