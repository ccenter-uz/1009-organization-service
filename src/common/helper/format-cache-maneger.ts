export const formatCacheKey = (params) => {
  return Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Ensure consistent ordering
    .map(([key, value]) => {
      if (typeof value === 'boolean')
        return `${key}=${value ? 'true' : 'false'}`;
      if (typeof value === 'string' || typeof value === 'number')
        return `${key}=${value}`;
      if (value instanceof Date) return `${key}=${value.toISOString()}`;
      return `${key}=null`;
    })
    .join('-');
};