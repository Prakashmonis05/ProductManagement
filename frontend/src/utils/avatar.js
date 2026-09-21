export const DEFAULT_AVATAR = '/default-avatar.svg';

export const getAvatarUrl = (url) => {
  if (!url || typeof url !== 'string' || url.includes('api.dicebear.com')) {
    return DEFAULT_AVATAR;
  }
  return url;
};
