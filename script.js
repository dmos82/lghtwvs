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
        this.infoPanel = document.getElementById('infoPanel');
        this.debugInfo = document.getElementById('debugInfo');
        this.heroLayers = document.querySelectorAll('.hero-layer');
        this.infoLayers = document.querySelectorAll('.info-layer');
        this.allLayers = document.querySelectorAll('.hero-layer, .info-layer');

        // Scroll settings
        this.scrollHeight = 8000; // Total scrollable height (increased for INFO section)
        this.minZoom = 1; // Starting zoom level
        this.maxZoom = 10; // Maximum zoom level

        this.init();
    }

    init() {
        // Set scroll container height
        this.scrollContainer.style.height = this.scrollHeight + 'px';

        // Listen for scroll events
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });

        // Touch support for mobile/Telegram
        let touchStartY = 0;
        let currentScroll = 0;

        document.body.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            currentScroll = window.scrollY;
        }, { passive: true });

        document.body.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            window.scrollTo(0, currentScroll + deltaY);
        }, { passive: false });

        // Initial update
        this.onScroll();

        // Toggle debug info with 'd' key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.debugInfo.classList.toggle('visible');
            }
        });

        console.log('✅ Zoom Scroll initialized');
        console.log(`   Scroll height: ${this.scrollHeight}px`);
        console.log(`   Zoom range: ${this.minZoom}x - ${this.maxZoom}x`);
        console.log(`   HERO layers: ${this.heroLayers.length}`);
        console.log(`   INFO layers: ${this.infoLayers.length}`);
        console.log(`   Press 'd' to toggle debug info`);
    }

    onScroll() {
        const scrollY = window.scrollY;
        const scrollProgress = scrollY / this.scrollHeight; // 0 to 1

        // Calculate base zoom level
        const baseZoom = this.minZoom + (scrollProgress * (this.maxZoom - this.minZoom));

        // Show overlay when zoomed in (around 33% scroll is when baseZoom hits ~3)
        const overlayThreshold = 3;
        const overlayVisible = baseZoom > overlayThreshold;

        // Apply different zoom speeds to each layer (parallax effect)
        this.allLayers.forEach(layer => {
            const section = layer.dataset.section;
            const speed = parseFloat(layer.dataset.speed) || 1;
            const layerZoom = 1 + ((baseZoom - 1) * speed);

            // HERO section - always visible, zooms normally
            if (section === 'hero') {
                layer.style.display = 'block';
                layer.style.transform = `translate(-50%, -50%) scale(${layerZoom})`;
                layer.style.opacity = '1';

                // Fade out image 9 as we scroll (reveal image 11 behind it)
                if (layer.alt === 'Layer 9') {
                    const fadeStart = 0;
                    const fadeEnd = 0.06;

                    if (scrollProgress < fadeStart) {
                        layer.style.opacity = '1';
                    } else if (scrollProgress > fadeEnd) {
                        layer.style.opacity = '0';
                    } else {
                        const fadeProgress = (scrollProgress - fadeStart) / (fadeEnd - fadeStart);
                        layer.style.opacity = (1 - fadeProgress).toString();
                    }
                }
            }

            // INFO section - appears as tiny dot when overlay shows, then zooms at same speed as HERO
            if (section === 'info') {
                // Only show INFO after overlay appears (when zoom > 3, around 33% scroll)
                if (overlayVisible) {
                    layer.style.display = 'block';

                    // Calculate how much we've scrolled since overlay appeared
                    const overlayStart = 0.33; // When baseZoom hits 3
                    const progressSinceOverlay = Math.max(0, scrollProgress - overlayStart);

                    // INFO starts tiny (0.01x) and accelerates growth as we continue scrolling
                    // Exponential growth so it eventually fills screen and surpasses HERO
                    const infoScaleStart = 0.01;
                    const growthAcceleration = Math.pow(progressSinceOverlay * 10, 1.8); // Exponential acceleration
                    const infoScale = infoScaleStart * (1 + growthAcceleration);

                    // Apply same parallax zoom as HERO, multiplied by INFO's growing scale
                    layer.style.transform = `translate(-50%, -50%) scale(${layerZoom * infoScale})`;
                    layer.style.opacity = '1';
                } else {
                    layer.style.display = 'none';
                }
            }
        });

        // Show overlay when zoomed in significantly
        if (overlayVisible) {
            this.overlay.classList.add('visible');
        } else {
            this.overlay.classList.remove('visible');
        }

        // Show info panel when INFO images have grown significantly (around 60% scroll)
        const infoPanelThreshold = 0.60;
        if (scrollProgress > infoPanelThreshold) {
            this.infoPanel.classList.add('visible');
        } else {
            this.infoPanel.classList.remove('visible');
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
