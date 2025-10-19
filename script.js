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

        // Pre-cache layer data for performance
        this.layerData = Array.from(this.allLayers).map(layer => ({
            element: layer,
            section: layer.dataset.section,
            speed: parseFloat(layer.dataset.speed) || 1,
            isLayer9: layer.alt === 'Layer 9'
        }));

        // Scroll settings
        this.scrollHeight = 4000; // Further reduced for quicker HERO scroll
        this.minZoom = 1; // Starting zoom level
        this.maxZoom = 10; // Maximum zoom level

        // Performance flags (simplified)

        this.init();
    }

    init() {
        // Set scroll container height
        this.scrollContainer.style.height = this.scrollHeight + 'px';

        // Detect mobile Safari for specific optimizations
        this.isMobileSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        this.isMobile = window.innerWidth <= 768;

        // Use requestAnimationFrame for smooth 60fps updates
        this.ticking = false;
        this.lastScrollY = 0;
        this.frameCount = 0;

        // Listen for scroll events with RAF throttling
        const scrollHandler = () => {
            this.lastScrollY = window.scrollY;

            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.onScroll();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        };

        // Use passive listener for better scroll performance
        window.addEventListener('scroll', scrollHandler, { passive: true });
        window.addEventListener('touchmove', scrollHandler, { passive: true });

        // Initial update - start mobile at 5% zoom
        if (this.isMobile) {
            // Simulate initial scroll to get 5% zoom on mobile
            this.onScroll();
        } else {
            this.onScroll();
        }

        // Toggle debug info with 'd' key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.debugInfo.classList.toggle('visible');
            }
        });

        console.log('✅ Zoom Scroll initialized');
        console.log(`   Scroll height: ${this.scrollHeight}px (reduced for faster response)`);
        console.log(`   Zoom range: ${this.minZoom}x - 6x (stops at 55% scroll)`);
        console.log(`   Mobile starts at 5% zoom (slight zoom for balance)`);
        console.log(`   HERO layers: ${this.heroLayers.length} (reduced from 8 to 6 with merged images)`);
        console.log(`   INFO layers: ${this.infoLayers.length} (linear growth, balanced with HERO)`);
        console.log(`   Overlay text: Always visible (no fade-in lag)`);
        console.log(`   Info panel & curtain: Appear at 35% scroll`);
        console.log(`   All scrolling stops at 55% (when spinning record fully appears)`);
        console.log(`   Press 'd' to toggle debug info`);
    }

    onScroll() {
        const scrollY = window.scrollY;
        const scrollProgress = scrollY / this.scrollHeight; // 0 to 1

        // Cap zoom at 55% scroll (stop when spinning record fully appears)
        const zoomCutoff = 0.55;
        const cappedScrollProgress = Math.min(scrollProgress, zoomCutoff);

        // Calculate base zoom level - start mobile at 5% progress (zoom ~1.45)
        let effectiveProgress = cappedScrollProgress;
        if (this.isMobile) {
            // Start at 5% zoom on mobile (slightly zoomed for better balance)
            effectiveProgress = 0.05 + (cappedScrollProgress * 0.95);
        }

        // Zoom progresses from 0-55% scroll, then stays constant
        // Scale to make zoom reach ~6x at 55% scroll
        const maxZoomAtCutoff = 6;
        const baseZoom = this.minZoom + (effectiveProgress * 1.82 * (maxZoomAtCutoff - this.minZoom));

        // Show overlay when zoomed in (around 33% scroll is when baseZoom hits ~3)
        const overlayThreshold = 3;
        const overlayVisible = baseZoom > overlayThreshold;

        // Cache transform strings to avoid recreating them
        const transforms = new Map();

        // Process layers in a single pass with optimized loops using cached data
        for (let i = 0; i < this.layerData.length; i++) {
            const { element: layer, section, speed, isLayer9 } = this.layerData[i];
            const layerZoom = 1 + ((baseZoom - 1) * speed);

            // HERO section - always visible, zooms normally
            if (section === 'hero') {
                // Only update transform if it changed
                const transformKey = `${layerZoom.toFixed(3)}`;
                if (!transforms.has(transformKey)) {
                    transforms.set(transformKey, `translate3d(-50%, -50%, 0) scale(${layerZoom})`);
                }

                // Use cached transform
                layer.style.transform = transforms.get(transformKey);

                // Special handling for layer 9 fade
                if (isLayer9) {
                    const fadeStart = 0;
                    const fadeEnd = 0.06;

                    let opacity;
                    if (scrollProgress < fadeStart) {
                        opacity = 1;
                    } else if (scrollProgress > fadeEnd) {
                        opacity = 0;
                    } else {
                        const fadeProgress = (scrollProgress - fadeStart) / (fadeEnd - fadeStart);
                        opacity = 1 - fadeProgress;
                    }

                    // Only update if opacity changed significantly
                    const currentOpacity = parseFloat(layer.style.opacity);
                    if (Math.abs(currentOpacity - opacity) > 0.01) {
                        layer.style.opacity = opacity.toString();
                    }
                } else if (layer.style.opacity !== '1') {
                    layer.style.opacity = '1';
                }
            }

            // INFO section - always visible, starts microscopic and grows
            else if (section === 'info') {
                // INFO starts microscopic and grows linearly with scroll
                // Balanced with HERO zoom for uniform speed

                // Linear growth matching HERO zoom progression
                const infoGrowthStart = 0.001;  // Microscopic start

                // Linear growth that matches HERO zoom rate
                // Capped at 55% like HERO zoom
                const cappedInfoProgress = Math.min(scrollProgress, 0.55);

                // Simple linear scaling - grows from 0.001 to ~1 over 55% scroll
                // This creates uniform movement with HERO layers
                const infoScale = infoGrowthStart + (cappedInfoProgress * 1.8);

                // Apply parallax zoom similar to HERO
                const finalScale = Math.min(layerZoom * infoScale, 50);
                const roundedScale = Math.round(finalScale * 100) / 100;

                // Cache the transform
                const infoTransformKey = `info-${roundedScale}`;
                if (!transforms.has(infoTransformKey)) {
                    transforms.set(infoTransformKey, `translate3d(-50%, -50%, 0) scale(${roundedScale})`);
                }

                layer.style.transform = transforms.get(infoTransformKey);

                // Ensure it's always visible
                if (layer.style.opacity !== '1') {
                    layer.style.opacity = '1';
                }
            }
        }

        // Overlay is now always visible from start - no state changes needed
        // The curtain effect still happens at the right time

        // Show info panel when INFO images have grown significantly (moved 15% earlier)
        const infoPanelThreshold = 0.35; // Moved from 0.50 to 0.35 (15% earlier)
        if (scrollProgress > infoPanelThreshold) {
            this.infoPanel.classList.add('visible');
            // Trigger curtain effect when info panel opens
            this.overlay.classList.add('curtain-open');
        } else {
            this.infoPanel.classList.remove('visible');
            // Reset curtain effect when scrolling back up
            this.overlay.classList.remove('curtain-open');
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
