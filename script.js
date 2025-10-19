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
    }

    onScroll() {
        const scrollY = window.scrollY;
        const scrollProgress = scrollY / this.scrollHeight; // 0 to 1

        // Calculate zoom level based on scroll position
        const zoom = this.minZoom + (scrollProgress * (this.maxZoom - this.minZoom));

        // Apply zoom transform to viewport (all images zoom together)
        this.viewport.style.transform = `scale(${zoom})`;

        // Show overlay when zoomed in significantly
        if (zoom > 3) {
            this.overlay.classList.add('visible');
        } else {
            this.overlay.classList.remove('visible');
        }

        // Update debug info
        this.updateDebug(scrollY, zoom);
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
