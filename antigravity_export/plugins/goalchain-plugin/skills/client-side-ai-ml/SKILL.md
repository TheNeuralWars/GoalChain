---
name: client-side-ai-ml
description: |
  Local client-side AI/ML model execution using WebGPU, WASM, or local models. Trigger when adding local match simulators, commentary generator workers, loading bars, weight caching, or managing memory for web models.
  
  Trigger on:
  - WebGPU, WebAssembly, Web Worker, IndexedDB caching, LLM in browser, commentary generation.
---

# Browser-Based AI/ML Client Integration Skill

Enable safe, responsive client-side model execution (Transformers.js, WebLLM, WASM, WebGPU) without freezing the UI or draining mobile device batteries.

## 💾 Caching & Weights Lifecycle
- Cache all model weights inside IndexedDB via the browser's Cache API. Never force redownloads unless the version tag increments.
- Implement a clear loading progress bar showing downloaded MBs out of the total.

## ⚙️ Background Processing
- Move heavy tactical prediction runs or commentary generation algorithms out of the main thread and into Web Workers.
- Use `requestAnimationFrame` or `requestIdleCallback` to chunk heavy array operations, preventing screen freeze.

## 📝 IndexedDB Model Cache Boilerplate
Ensure model configuration remains cached client-side to prevent high network usage:
```javascript
async function checkModelCached(modelName) {
    const cache = await caches.open('goalchain-ai-models');
    const cachedResponse = await cache.match(modelName);
    return !!cachedResponse;
}
```

---
*Status: Active. Goal: Lightweight, zero-latency local AI features.* 🧠✨🏟️
