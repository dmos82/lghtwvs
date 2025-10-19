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

        // Performance flags
        this.lastBaseZoom = 0;
        this.lastScrollProgress = 0;

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
        console.log(`   Zoom range: ${this.minZoom}x - 6x (stops at 45% scroll)`);
        console.log(`   Mobile starts at 5% zoom (more zoomed out)`);
        console.log(`   HERO layers: ${this.heroLayers.length} (reduced from 8 to 6 with merged images)`);
        console.log(`   INFO layers: ${this.infoLayers.length} (optimized with caching)`);
        console.log(`   Press 'd' to toggle debug info`);
    }

    onScroll() {
        const scrollY = window.scrollY;
        const scrollProgress = scrollY / this.scrollHeight; // 0 to 1

        // Cap zoom at 45% scroll (as DAVID MORIN starts to leave)
        const zoomCutoff = 0.45;
        const cappedScrollProgress = Math.min(scrollProgress, zoomCutoff);

        // Calculate base zoom level - start mobile at 5% progress (zoom ~1.45)
        let effectiveProgress = cappedScrollProgress;
        if (this.isMobile) {
            // Start at 5% zoom on mobile (reduced from 15% to show more images)
            effectiveProgress = 0.05 + (cappedScrollProgress * 0.95);
        }

        // Zoom progresses from 0-45% scroll, then stays constant
        // Scale to make zoom reach ~6x at 45% scroll (instead of 10x at 100%)
        const maxZoomAtCutoff = 6;
        const baseZoom = this.minZoom + (effectiveProgress * 2.22 * (maxZoomAtCutoff - this.minZoom));

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

            // INFO section - appears as tiny dot when overlay shows, then zooms at same speed as HERO
            else if (section === 'info') {
                // Only show INFO after overlay appears (when zoom > 3, around 33% scroll)
                if (overlayVisible) {
                    // Use visibility instead of display to avoid reflows
                    if (layer.style.visibility !== 'visible') {
                        layer.style.visibility = 'visible';
                    }

                    // Calculate how much we've scrolled since overlay appeared
                    const overlayStart = 0.33; // When baseZoom hits 3
                    const progressSinceOverlay = Math.max(0, scrollProgress - overlayStart);

                    // Simplified scaling - linear with slight acceleration, no complex Math.pow
                    const infoScaleStart = 0.01;
                    // Simpler quadratic growth instead of exponential
                    const growthFactor = progressSinceOverlay * 5; // Reduced from 8 to slow down zoom
                    const infoScale = infoScaleStart + (growthFactor * growthFactor * 0.3); // Also reduced multiplier from 0.5 to 0.3

                    // Apply same parallax zoom as HERO, multiplied by INFO's growing scale
                    // Cap maximum scale to prevent excessive rendering
                    const finalScale = Math.min(layerZoom * infoScale, 50);

                    // Round to 2 decimal places to reduce unique transforms
                    const roundedScale = Math.round(finalScale * 100) / 100;

                    // Cache the transform string
                    const infoTransformKey = `info-${roundedScale}`;
                    if (!transforms.has(infoTransformKey)) {
                        transforms.set(infoTransformKey, `translate3d(-50%, -50%, 0) scale(${roundedScale})`);
                    }

                    layer.style.transform = transforms.get(infoTransformKey);

                    if (layer.style.opacity !== '1') {
                        layer.style.opacity = '1';
                    }
                } else {
                    // Use visibility instead of display
                    if (layer.style.visibility !== 'hidden') {
                        layer.style.visibility = 'hidden';
                        layer.style.opacity = '0';
                    }
                }
            }
        }

        // Show overlay when zoomed in significantly
        if (overlayVisible) {
            this.overlay.classList.add('visible');
        } else {
            this.overlay.classList.remove('visible');
        }

        // Show info panel when INFO images have grown significantly (around 50% scroll)
        const infoPanelThreshold = 0.50; // Reduced from 0.60 to show spinning record earlier
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
