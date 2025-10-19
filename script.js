// ========================================
// INFINITE ZOOM SCROLL - Light Waves
// All images stacked, zoom on scroll
// ========================================

class ZoomScroll {
    constructor() {
        // DOM elements
        this.viewport = document.getElementById('viewport');
        this.scrollContainer = document.querySelector('.scroll-container');
        this.overlay = document.getElementById('overlay');
        this.debugInfo = document.getElementById('debugInfo');
        this.layers = document.querySelectorAll('.hero-layer');

        // Scroll settings
        this.scrollHeight = 5000; // Total scrollable height
        this.minZoom = 1; // Starting zoom level
        this.maxZoom = 10; // Maximum zoom level

        this.init();
    }

    init() {
        // Set scroll container height
        this.scrollContainer.style.height = this.scrollHeight + 'px';

        // Listen for scroll events
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });

        // Initial update
        this.onScroll();

        console.log('✅ Zoom Scroll initialized');
        console.log(`   Scroll height: ${this.scrollHeight}px`);
        console.log(`   Zoom range: ${this.minZoom}x - ${this.maxZoom}x`);
        console.log(`   Layers with varying speeds: ${this.layers.length}`);
    }

    onScroll() {
        const scrollY = window.scrollY;
        const scrollProgress = scrollY / this.scrollHeight; // 0 to 1

        // Calculate base zoom level
        const baseZoom = this.minZoom + (scrollProgress * (this.maxZoom - this.minZoom));

        // Apply different zoom speeds to each layer (parallax effect)
        this.layers.forEach(layer => {
            const speed = parseFloat(layer.dataset.speed) || 1;
            const layerZoom = 1 + ((baseZoom - 1) * speed);
            layer.style.transform = `translate(-50%, -50%) scale(${layerZoom})`;

            // Fade out image 9 as we scroll (reveal image 11 behind it)
            if (layer.alt === 'Layer 9') {
                // Quick fade: Start at 60%, fully transparent by 65%
                const fadeStart = 0.6;
                const fadeEnd = 0.65;

                if (scrollProgress < fadeStart) {
                    layer.style.opacity = '1';
                } else if (scrollProgress > fadeEnd) {
                    layer.style.opacity = '0';
                } else {
                    const fadeProgress = (scrollProgress - fadeStart) / (fadeEnd - fadeStart);
                    layer.style.opacity = (1 - fadeProgress).toString();
                }
            }
        });

        // Show overlay when zoomed in significantly
        if (baseZoom > 3) {
            this.overlay.classList.add('visible');
        } else {
            this.overlay.classList.remove('visible');
        }

        // Update debug info
        this.updateDebug(scrollY, baseZoom);
    }

    updateDebug(scrollY, zoom) {
        if (this.debugInfo) {
            document.getElementById('scrollPos').textContent = Math.round(scrollY);
            document.getElementById('zoomLevel').textContent = zoom.toFixed(2);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.zoomScroll = new ZoomScroll();
});

// Fallback for cached pages
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    window.zoomScroll = new ZoomScroll();
}
