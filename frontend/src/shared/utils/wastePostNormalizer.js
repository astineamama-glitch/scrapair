const ABSOLUTE_URL_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

const getApiOrigin = () => {
  const apiUrl = process.env.REACT_APP_API_URL;

  if (apiUrl) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      return '';
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return '';
};

const parseImageSource = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => parseImageSource(entry));
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return [];
  }

  if (trimmed.startsWith('[') || trimmed.startsWith('"')) {
    try {
      return parseImageSource(JSON.parse(trimmed));
    } catch {
      return [trimmed];
    }
  }

  return [trimmed];
};

const normalizeImageUrl = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return null;
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    const protocol = typeof window !== 'undefined' && window.location?.protocol
      ? window.location.protocol
      : 'https:';
    return `${protocol}${trimmed}`;
  }

  const apiOrigin = getApiOrigin();

  if (trimmed.startsWith('/')) {
    return apiOrigin ? `${apiOrigin}${trimmed}` : trimmed;
  }

  if (trimmed.startsWith('uploads/') || trimmed.startsWith('api/')) {
    return apiOrigin ? `${apiOrigin}/${trimmed}` : trimmed;
  }

  return trimmed;
};

export const normalizeWastePost = (post) => {
  if (!post || typeof post !== 'object') {
    return post;
  }

  const imageCandidates = [
    ...parseImageSource(post.images),
    ...parseImageSource(post.imageUrls),
    ...parseImageSource(post.imageUrl),
  ];

  const images = Array.from(
    new Set(
      imageCandidates
        .map((image) => normalizeImageUrl(image))
        .filter(Boolean)
    )
  );

  return {
    ...post,
    images,
    imageUrls: images,
    imageUrl: images[0] || null,
  };
};

export const normalizeWastePosts = (posts) => {
  if (!Array.isArray(posts)) {
    return [];
  }

  return posts.map((post) => normalizeWastePost(post));
};

export const normalizeConversation = (conversation) => {
  if (!conversation || typeof conversation !== 'object') {
    return conversation;
  }

  return {
    ...conversation,
    wastePost: normalizeWastePost(conversation.wastePost),
  };
};

export const normalizeConversations = (conversations) => {
  if (!Array.isArray(conversations)) {
    return [];
  }

  return conversations.map((conversation) => normalizeConversation(conversation));
};
