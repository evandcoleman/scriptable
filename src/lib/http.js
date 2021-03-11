export async function fetchJson({ url, headers, cache, cacheKey, cacheExpiration }) {
  if (cache && cacheKey) {
    const cached = await cache.read(cacheKey, cacheExpiration);
    if (cached) {
      return cached;
    }
  }

  try {
    console.log(`Fetching url: ${url}`);
    const req = new Request(url);
    if (headers) {
      req.headers = headers;
    }
    const resp = await req.loadJSON();
    if (cache && cacheKey) {
      cache.write(cacheKey, resp);
    }
    return resp;
  } catch (error) {
    if (cache && cacheKey) {
      try {
        return cache.read(cacheKey, cacheTimeout || 1);
      } catch (error) {
        console.log(`Couldn't fetch ${url}`);
      }
    } else {
      console.log(error);
    }
  }
}
