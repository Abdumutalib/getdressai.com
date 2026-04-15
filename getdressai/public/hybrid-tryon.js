/**
 * Hybrid VTON frontend — POST /api/hybrid-vton билан ишлайди.
 *
 * HTML да керак:
 *   <div id="tryon-result"></div>
 *   <div id="layer-timeline"></div>
 *
 * Уланиш: <script src="./public/hybrid-tryon.js"></script>
 * Keyin: window.hybridTryOn.processOutfit(personBase64, garments, accessories)
 */

(function () {
  "use strict";

  /**
   * @param {string} raw
   * @param {string} [mime]
   */
  function toDataUrl(raw, mime) {
    if (!raw) return "";
    const s = String(raw).trim();
    if (s.startsWith("data:")) return s;
    const m = mime || "image/png";
    return `data:${m};base64,${s}`;
  }

  function notifyError(message) {
    if (typeof window.toast === "function") {
      window.toast(message, "error");
    } else {
      console.error(message);
      alert(message);
    }
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  /** @param {HTMLElement} el */
  function cleanupLoading(el) {
    if (el && el._hybridProgressInterval) {
      clearInterval(el._hybridProgressInterval);
      el._hybridProgressInterval = null;
    }
  }

  class HybridVirtualTryOn {
    constructor() {
      /** @type {Array<{ type: string, kind?: string, result: string }>} */
      this.processedLayers = [];
      /** @type {string|null} */
      this.currentPreview = null;
      /** @type {string|null} */
      this._lastPersonDataUrl = null;
      /** @type {string} */
      this.apiUrl = "/api/hybrid-vton";
    }

    /**
     * @param {string} personImage — base64 ёки data URL
     * @param {Array<{ image: string, type: string }>} garments
     * @param {Array<{ image: string, type: string }>} [accessories]
     * @returns {Promise<object|void>}
     */
    async processOutfit(personImage, garments, accessories) {
      const garmentsSafe = Array.isArray(garments) ? garments : [];
      const accessoriesSafe = Array.isArray(accessories) ? accessories : [];

      this._lastPersonDataUrl = toDataUrl(personImage);
      const loadingOverlay = this.showLoading();

      try {
        const body = {
          personImageBase64: personImage,
          garments: garmentsSafe,
          accessories: accessoriesSafe,
          useFastCache: true,
        };

        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.error || response.statusText || "Request failed");
        }

        if (!result.success) {
          throw new Error(result.error || "Hybrid VTON did not return success");
        }

        this.currentPreview = result.resultImage;
        this.processedLayers = Array.isArray(result.layers) ? result.layers : [];
        this.ensurePanel();
        this.showResult(result, this._lastPersonDataUrl);
        this.showLayerTimeline(result.layers || []);
        return result;
      } catch (err) {
        const msg = err && err.message ? err.message : String(err);
        console.error(err);
        this.showError(msg);
      } finally {
        cleanupLoading(loadingOverlay);
        if (loadingOverlay && loadingOverlay.parentNode) {
          loadingOverlay.remove();
        }
      }
    }

    /**
     * @param {Array<{ type: string, kind?: string, result: string }>} layers
     */
    showLayerTimeline(layers) {
      const timeline = document.getElementById("layer-timeline");
      if (!timeline) return;

      timeline.innerHTML = (layers || [])
        .map(
          (layer, idx) => `
      <div class="flex items-center gap-3 animate-fade-in" style="animation-delay: ${idx * 0.1}s">
        <div class="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
          <img src="${toDataUrl(layer.result)}" alt="" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm">${escapeHtml(this.getLayerName(layer.type))}</p>
          <p class="text-xs text-neutral-400">${escapeHtml(this.getProcessorLabel(layer))}</p>
        </div>
        <div class="text-green-600 text-sm shrink-0" aria-hidden="true">✓</div>
      </div>`
        )
        .join("");
    }

    /**
     * @param {{ type: string, kind?: string }} layer
     */
    getProcessorLabel(layer) {
      const type = String(layer.type || "").toLowerCase();
      if (type === "upper" || type === "lower" || type === "dress") {
        return "FASHN VTON";
      }
      return "OmniTry";
    }

    /**
     * @param {string} type
     */
    getLayerName(type) {
      const names = {
        upper: "Upper body",
        lower: "Lower body",
        dress: "Dress",
        watch: "Watch",
        bag: "Bag",
        glasses: "Glasses",
        shoes: "Shoes",
      };
      return names[String(type || "").toLowerCase()] || String(type || "Layer");
    }

    /**
     * @param {object} result
     * @param {string} originalDataUrl
     */
    showResult(result, originalDataUrl) {
      const container = document.getElementById("tryon-result");
      if (!container) return;

      const meta = result.metadata || {};
      const g = meta.garmentsProcessed ?? 0;
      const a = meta.accessoriesProcessed ?? 0;
      const cacheUsed = !!meta.cacheUsed;

      container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl border p-4">
          <p class="text-sm font-medium mb-2">Original</p>
          <img src="${originalDataUrl}" alt="" class="rounded-xl w-full object-cover max-h-[min(80vh,560px)]">
        </div>
        <div class="bg-white rounded-2xl border p-4">
          <p class="text-sm font-medium mb-2">
            Result
            <span class="text-xs text-neutral-400 ms-2">${g + a} layer(s)</span>
          </p>
          <img src="${toDataUrl(result.resultImage)}" alt="" class="rounded-xl w-full object-cover max-h-[min(80vh,560px)]">
        </div>
      </div>
      <div class="mt-4 p-3 bg-neutral-50 rounded-xl text-sm">
        <p><strong>FastFit cache:</strong> ${cacheUsed ? "enabled (server reference cache)" : "disabled"}</p>
      </div>`;
    }

    showLoading() {
      const overlay = document.createElement("div");
      overlay.className = "fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-busy", "true");
      overlay.innerHTML = `
      <div class="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-xl">
        <div class="animate-spin rounded-full h-12 w-12 border-2 border-neutral-200 border-t-neutral-900 mx-auto"></div>
        <p class="mt-4 font-medium">Processing…</p>
        <p class="text-sm text-neutral-500 mt-2">Hybrid VTON (FASHN + OmniTry)</p>
        <div class="mt-4 h-1 bg-neutral-100 rounded-full overflow-hidden">
          <div class="hybrid-progress h-full bg-neutral-900 transition-all duration-300" style="width: 0%"></div>
        </div>
      </div>`;
      document.body.appendChild(overlay);

      let progress = 0;
      overlay._hybridProgressInterval = setInterval(() => {
        progress = Math.min(progress + 8, 92);
        const bar = overlay.querySelector(".hybrid-progress");
        if (bar) bar.style.width = `${progress}%`;
      }, 280);

      return overlay;
    }

    showError(message) {
      notifyError(`Error: ${message}`);
    }

    /**
     * Сервердан олинган натижани кўрсатиш (fetch аллақачон қилинган).
     * @param {object} result — { success, resultImage, layers, metadata }
     * @param {string} originalDataUrl — фойдаланувчи расми (data URL ёки base64)
     */
    displayResult(result, originalDataUrl) {
      this._lastPersonDataUrl = toDataUrl(originalDataUrl);
      this.currentPreview = result.resultImage;
      this.processedLayers = Array.isArray(result.layers) ? result.layers : [];
      this.ensurePanel();
      this.showResult(result, this._lastPersonDataUrl);
      this.showLayerTimeline(result.layers || []);
    }

    /** #tryon-result ва #layer-timeline контейнерларини яратиш */
    ensurePanel() {
      const existing = document.getElementById("hybrid-tryon-root");
      if (existing) existing.remove();
      const root = document.createElement("div");
      root.id = "hybrid-tryon-root";
      root.className =
        "fixed inset-0 z-[150] overflow-y-auto bg-black/50 p-4 flex items-start justify-center";
      root.innerHTML = `
        <div class="bg-white rounded-2xl max-w-4xl w-full shadow-xl border my-4 max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <div class="flex justify-between items-start gap-2 mb-4">
            <h3 class="font-bold text-lg">Virtual try-on</h3>
            <button type="button" class="text-2xl leading-none text-neutral-500 hover:text-neutral-900" data-hybrid-close>&times;</button>
          </div>
          <div id="tryon-result"></div>
          <div class="mt-4">
            <p class="text-xs font-semibold text-neutral-500 mb-2">Layers</p>
            <div id="layer-timeline" class="space-y-2"></div>
          </div>
        </div>`;
      document.body.appendChild(root);
      const close = () => root.remove();
      root.querySelector("[data-hybrid-close]").onclick = close;
      root.addEventListener("click", (e) => {
        if (e.target === root) close();
      });
    }
  }

  window.HybridVirtualTryOn = HybridVirtualTryOn;
  window.hybridTryOn = new HybridVirtualTryOn();

  function applyHybridConfig() {
    const c = window.GETDRESSAI_CONFIG || {};
    const u = c.hybridVtonUrl;
    if (u != null && String(u).trim() !== "") {
      window.hybridTryOn.apiUrl = String(u).trim();
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyHybridConfig);
  } else {
    applyHybridConfig();
  }
})();
