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
        this.scrollHeight = 8000; // Total scrollable height (increased for INFO section)
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
                    this.frameCount++;
                    // On mobile Safari, skip frames for better performance
                    if (this.isMobileSafari) {
                        // Only update every 3rd frame on mobile Safari
                        if (this.frameCount % 3 === 0) {
                            this.onScroll();
                        }
                    } else if (this.isMobile) {
                        // Update every other frame on other mobile browsers
                        if (this.frameCount % 2 === 0) {
                            this.onScroll();
                        }
                    } else {
                        // Desktop gets every frame
                        this.onScroll();
                    }
                    this.ticking = false;
                });
                this.ticking = true;
            }
        };

        // Use passive listener for better scroll performance
        window.addEventListener('scroll', scrollHandler, { passive: true, capture: false });
        window.addEventListener('touchmove', scrollHandler, { passive: true });

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

        // Calculate base zoom level (reduce range on mobile for performance)
        const maxZoomMobile = this.isMobile ? 5 : this.maxZoom;
        const baseZoom = this.minZoom + (scrollProgress * (maxZoomMobile - this.minZoom));

        // Show overlay when zoomed in (around 33% scroll is when baseZoom hits ~3)
        const overlayThreshold = 3;
        const overlayVisible = baseZoom > overlayThreshold;

        // Cache transform strings to avoid recreating them
        const transforms = new Map();

        // Process layers in a single pass with optimized loops using cached data
        for (let i = 0; i < this.layerData.length; i++) {
            const { element: layer, section, speed, isLayer9 } = this.layerData[i];

            // Skip hidden layers on mobile
            if (this.isMobile && layer.style.display === 'none') continue;

            // Simplified zoom calculation for mobile Safari
            let layerZoom;
            if (this.isMobileSafari) {
                // Round values to reduce transform recalculations
                const roundedBaseZoom = Math.round(baseZoom * 10) / 10;
                layerZoom = 1 + ((roundedBaseZoom - 1) * speed);
                layerZoom = Math.round(layerZoom * 100) / 100; // Round to 2 decimals
            } else {
                layerZoom = 1 + ((baseZoom - 1) * speed);
            }

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
                    if (layer.style.display !== 'block') {
                        layer.style.display = 'block';
                    }

                    // Calculate how much we've scrolled since overlay appeared
                    const overlayStart = 0.33; // When baseZoom hits 3
                    const progressSinceOverlay = Math.max(0, scrollProgress - overlayStart);

                    // INFO starts tiny (0.01x) and accelerates growth as we continue scrolling
                    const infoScaleStart = 0.01;
                    const growthAcceleration = Math.pow(progressSinceOverlay * 10, 1.8);
                    const infoScale = infoScaleStart * (1 + growthAcceleration);

                    // Apply same parallax zoom as HERO, multiplied by INFO's growing scale
                    const finalScale = layerZoom * infoScale;
                    layer.style.transform = `translate3d(-50%, -50%, 0) scale(${finalScale})`;

                    if (layer.style.opacity !== '1') {
                        layer.style.opacity = '1';
                    }
                } else if (layer.style.display !== 'none') {
                    layer.style.display = 'none';
                }
            }
        }

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
