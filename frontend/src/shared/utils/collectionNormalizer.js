import { normalizeWastePost } from './wastePostNormalizer';

const normalizeStatus = (status) => {
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

export const normalizeCollection = (collection) => {
  if (!collection || typeof collection !== 'object') {
    return collection;
  }

  const post = normalizeWastePost(collection.post);
  const status = normalizeStatus(collection.status);

  return {
    ...collection,
    status,
    post,
    postId: collection.postId ?? post?.id ?? null,
    pickupDeadline: collection.pickupDeadline ?? post?.pickupDeadline ?? null,
    collectionStatus: collection.collectionStatus ?? post?.collectionStatus ?? null,
    title: collection.title ?? post?.title ?? null,
    wasteType: collection.wasteType ?? post?.wasteType ?? null,
    quantity: collection.quantity ?? post?.quantity ?? null,
    unit: collection.unit ?? post?.unit ?? null,
    condition: collection.condition ?? post?.condition ?? null,
    description: collection.description ?? post?.description ?? null,
    address: collection.address ?? post?.address ?? null,
    city: collection.city ?? post?.city ?? null,
    location: collection.location ?? post?.location ?? null,
    images: collection.images ?? post?.images ?? [],
    imageUrl: collection.imageUrl ?? post?.imageUrl ?? null,
    recyclerName:
      collection.recyclerName ||
      collection.recycler?.companyName ||
      collection.recycler?.businessName ||
      collection.recycler?.email ||
      null,
    recyclerEmail: collection.recyclerEmail || collection.recycler?.email || null,
    postTitle: collection.postTitle || post?.title || null,
    postWasteType: collection.postWasteType || post?.wasteType || null,
    postCondition: collection.postCondition || post?.condition || null,
    postQuantity: collection.postQuantity ?? post?.quantity ?? null,
    postUnit: collection.postUnit || post?.unit || null,
  };
};

export const normalizeCollections = (collections) => {
  if (!Array.isArray(collections)) {
    return [];
  }

  return collections.map((collection) => normalizeCollection(collection));
};

export const normalizeCollectionResponse = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  return {
    ...payload,
    data: normalizeCollection(payload.data),
  };
};

export const normalizeCollectionsResponse = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  return {
    ...payload,
    data: normalizeCollections(payload.data),
  };
};
