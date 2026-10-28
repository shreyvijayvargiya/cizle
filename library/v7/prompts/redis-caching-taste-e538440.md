# Redis Caching taste

By @f · developer
Language: en · Domains: engineering · Source: P01

Source page: https://prompts.chat

```
# Redis Caching taste of a backend engineer
- Default to cache-aside: read from Redis, fall back to the source of truth on a miss, then populate the cache. Confidence: 0.90
- Treat the cache as disposable; the system must stay correct (only slower) if Redis is flushed. Confidence: 0.95
- Set a TTL on every cache key; a key without an expiry is a memory leak waiting to happen. Confidence: 0.90
- Add random jitter to TTLs so keys written together do not expire together. Confidence: 0.85
- Namespace keys as service:entity:id:version (e.g. catalog:product:42:v3) and bump the version on breaking format changes. Confidence: 0.85
- Invalidate by deleting the key after a successful write, not by updating the cached value in place. Confidence: 0.80
- Protect hot keys from stampedes with a short lock (SET key value NX PX) or request coalescing. Confidence: 0.80
- Cache negative results (not found) with a short TTL to absorb lookups for missing ids. Confidence: 0.70
- Store compact serialized values (JSON for debuggability, MessagePack when size matters) and keep values under about 100 KB. Confidence: 0.75
- Use hashes for objects whose fields are read separately, and plain strings for values read whole. Confidence: 0.70
- Never run KEYS in production; use SCAN with a cursor. Confidence: 0.95
- Avoid big keys and huge collections; split anything that would make a single command block for milliseconds. Confidence: 0.85
- Use pipelining or MGET for batch reads instead of one round trip per key. Confidence: 0.85
- Put multi-step atomic logic in a Lua script or a function, not in client-side check-then-set. Confidence: 0.80
- Set maxmemory with an explicit eviction policy (allkeys-lru for pure caches, noeviction for data you must not lose). Confidence: 0.90
- Keep caches and durable data (queues, rate limits, sessions) in separate Redis instances with separate policies. Confidence: 0.80
- Use Redis Streams or a real broker for jobs; plain lists lose work when a consumer crashes. Confidence: 0.70
- Implement rate limiting with a sliding window or token bucket script, not with ad-hoc INCR plus EXPIRE races. Confidence: 0.75
- Set client timeouts and a circuit breaker so a slow Redis degrades to cache misses instead of taking the service down. Confidence: 0.90
- Monitor hit ratio, evictions, memory fragmentation and latency, and alert on a falling hit ratio. Confidence: 0.85
- Require auth and TLS, disable or rename dangerous commands (FLUSHALL, CONFIG), and never expose Redis to the internet. Confidence: 0.95
- Do not cache what is already fast; measure the source latency before adding a cache layer. Confidence: 0.80
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
