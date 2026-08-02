import {
  imageUrl,
  imageVariants,
  IMAGE_URL_CACHE_LIMIT,
  __imageUrlCacheSize,
  __resetImageUrlCache,
} from './imageUrl';

describe('imageUrl', () => {
  beforeEach(() => {
    __resetImageUrlCache();
    delete process.env.IMAGE_URL_CACHE_MODE;
  });

  it('derives a local placeholder variant URL from a bare photo key', () => {
    expect(imageUrl('abc/1.jpg', 'hero', 2)).toBe('/images/placeholder/abc/1.jpg?s=hero&dpr=2');
  });

  it('normalizes an absolute provider URL to a stable placeholder slug', () => {
    expect(imageUrl('https://cdn.example/abcd/0.jpg', 'tile', 1)).toBe(
      '/images/placeholder/cdn.example/abcd/0.jpg?s=tile&dpr=1',
    );
  });

  it('memoizes repeated lookups (one cache entry per distinct key)', () => {
    imageUrl('k', 'tile', 1);
    imageUrl('k', 'tile', 1);
    expect(__imageUrlCacheSize()).toBe(1);
  });

  it('produces every size x dpr variant', () => {
    const variants = imageVariants('k');
    expect(Object.keys(variants)).toEqual(
      expect.arrayContaining(['thumb@1x', 'thumb@2x', 'tile@1x', 'hero@2x', 'gallery@1x']),
    );
  });

  it('bounded mode caps the cache at the limit (evicts)', () => {
    process.env.IMAGE_URL_CACHE_MODE = 'bounded';
    for (let i = 0; i < IMAGE_URL_CACHE_LIMIT + 500; i += 1) {
      imageUrl(`photo-${i}`, 'tile', 1);
    }
    expect(__imageUrlCacheSize()).toBeLessThanOrEqual(IMAGE_URL_CACHE_LIMIT);
  });

  it('unbounded mode never evicts (grows past the limit — the leak surface)', () => {
    process.env.IMAGE_URL_CACHE_MODE = 'unbounded';
    for (let i = 0; i < IMAGE_URL_CACHE_LIMIT + 500; i += 1) {
      imageUrl(`photo-${i}`, 'tile', 1);
    }
    expect(__imageUrlCacheSize()).toBeGreaterThan(IMAGE_URL_CACHE_LIMIT);
  });
});
