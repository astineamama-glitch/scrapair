import { Request } from 'express';

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

const parseImageSource = (value: unknown): string[] => {
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

const normalizeImageUrl = (value: string, baseUrl: string): string | null => {
  const trimmed = value.trim();

  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return null;
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmed) || trimmed.startsWith('//')) {
    return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
  }

  if (!baseUrl) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `${baseUrl}${trimmed}`;
  }

  if (trimmed.startsWith('uploads/') || trimmed.startsWith('api/')) {
    return `${baseUrl}/${trimmed}`;
  }

  return trimmed;
};

export const getRequestBaseUrl = (req: Request): string => {
  const configuredBaseUrl = process.env.BACKEND_BASE_URL?.trim().replace(/\/+$/, '');

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  const host = req.get('host');

  if (!host) {
    return '';
  }

  return `${req.protocol}://${host}`;
};

export const normalizeWastePostPayload = <T extends Record<string, any> | null | undefined>(
  post: T,
  baseUrl: string
): T => {
  if (!post || typeof post !== 'object') {
    return post;
  }

  const plainPost = typeof (post as any).get === 'function'
    ? (post as any).get({ plain: true })
    : post;

  const imageCandidates = [
    ...parseImageSource((plainPost as any).images),
    ...parseImageSource((plainPost as any).imageUrls),
    ...parseImageSource((plainPost as any).imageUrl)
  ];

  const images = Array.from(
    new Set(
      imageCandidates
        .map((image) => normalizeImageUrl(image, baseUrl))
        .filter((image): image is string => Boolean(image))
    )
  );

  return {
    ...plainPost,
    images,
    imageUrls: images,
    imageUrl: images[0] || null
  } as T;
};

export const normalizeWastePostList = <T extends Record<string, any>>(
  posts: T[] | null | undefined,
  baseUrl: string
): T[] => {
  if (!Array.isArray(posts)) {
    return [];
  }

  return posts.map((post) => normalizeWastePostPayload(post, baseUrl));
};
