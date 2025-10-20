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
        this.layer8 = document.getElementById('layer8'); // Bottom-fixed layer outside viewport
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

        // Initialize persistent transform cache for better performance
        this.transformCache = new Map();
        this.maxCacheSize = 200; // Limit cache size for mobile memory

        // Scroll settings
        this.scrollHeight = 2500; // Short scroll - ends when record fits INFO circle
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
        console.log(`   Zoom range: ${this.minZoom}x - 2.5x (gentle zoom to prevent pixelation)`);
        console.log(`   Mobile & Desktop: Unified zoom behavior`);
        console.log(`   HERO layers: ${this.heroLayers.length} (reduced from 8 to 6 with merged images)`);
        console.log(`   INFO layers: ${this.infoLayers.length} (linear growth, balanced with HERO)`);
        console.log(`   DAVID MORIN: Using custom font image with transparency`);
        console.log(`   Info panel & curtain: Appear at 30% scroll (750px)`);
        console.log(`   Total scroll: 2500px - ends when record fits INFO circle`);
        console.log(`   Press 'd' to toggle debug info`);
    }

    onScroll() {
        const scrollY = window.scrollY;
        const scrollProgress = scrollY / this.scrollHeight; // 0 to 1

        // Mobile optimization: Skip tiny scroll updates
        if (this.isMobile) {
            const scrollDelta = Math.abs(scrollY - (this.lastProcessedScroll || 0));
            if (scrollDelta < 2) return; // Skip if scroll change is less than 2px
            this.lastProcessedScroll = scrollY;
        }

        // No zoom capping - scroll ends naturally when record fits
        const cappedScrollProgress = scrollProgress;

        // Calculate base zoom level - mobile now uses same zoom as desktop
        let effectiveProgress = cappedScrollProgress;
        // Removed mobile-specific zoom start - now identical to desktop

        // Zoom progresses throughout the entire short scroll
        // Scale to make zoom reach ~2.5x at 100% scroll (when record fits INFO circle)
        const maxZoomAtCutoff = 2.5;
        const baseZoom = this.minZoom + (effectiveProgress * (maxZoomAtCutoff - this.minZoom));

        // Show overlay when zoomed in (around 33% scroll is when baseZoom hits ~2)
        const overlayThreshold = 2;
        const overlayVisible = baseZoom > overlayThreshold;

        // Use persistent cache for better backward scroll performance
        const transforms = this.transformCache;

        // Clean cache if it gets too large (mobile memory management)
        if (transforms.size > this.maxCacheSize) {
            const entriesToDelete = transforms.size - this.maxCacheSize + 50;
            let deleted = 0;
            for (let key of transforms.keys()) {
                if (deleted++ >= entriesToDelete) break;
                transforms.delete(key);
            }
        }

        // Process layers in a single pass with optimized loops using cached data
        for (let i = 0; i < this.layerData.length; i++) {
            const { element: layer, section, speed, isLayer9 } = this.layerData[i];
            const layerZoom = 1 + ((baseZoom - 1) * speed);

            // HERO section - always visible, zooms normally
            if (section === 'hero') {
                // Standard layers: Center both X and Y
                const transformKey = `${layerZoom.toFixed(2)}`;
                if (!transforms.has(transformKey)) {
                    transforms.set(transformKey, `translate3d(-50%, -50%, 0) scale(${layerZoom})`);
                }

                // Only update DOM if transform actually changed
                const newTransform = transforms.get(transformKey);
                if (layer.style.transform !== newTransform) {
                    layer.style.transform = newTransform;
                }

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
                // No capping - INFO grows throughout the short scroll
                const cappedInfoProgress = scrollProgress;

                // Simple linear scaling - grows from 0.001 to ~1.0 over full scroll
                // This creates uniform movement with HERO layers - sized to fill circle at end
                const infoScale = infoGrowthStart + (cappedInfoProgress * 1.0);

                // Apply parallax zoom similar to HERO - cap at 5 to prevent pixelation
                const finalScale = Math.min(layerZoom * infoScale, 5);
                const roundedScale = Math.round(finalScale * 100) / 100;

                // Cache the transform
                const infoTransformKey = `info-${roundedScale}`;
                if (!transforms.has(infoTransformKey)) {
                    transforms.set(infoTransformKey, `translate3d(-50%, -50%, 0) scale(${roundedScale})`);
                }

                // Only update DOM if transform actually changed
                const newInfoTransform = transforms.get(infoTransformKey);
                if (layer.style.transform !== newInfoTransform) {
                    layer.style.transform = newInfoTransform;
                }

                // Remove opacity check - it's always 1 after first set
                if (!layer.dataset.opacitySet) {
                    layer.style.opacity = '1';
                    layer.dataset.opacitySet = 'true';
                }
            }
        }

        // Overlay is now always visible from start - no state changes needed
        // The curtain effect still happens at the right time

        // Handle layer 8 (bottom-fixed layer) separately - it's outside viewport
        if (this.layer8) {
            const layer8Zoom = 1 + ((baseZoom - 1) * 1.4); // Match its data-speed of 1.4
            const layer8Scale = layer8Zoom * (this.isMobile ? 2.5 : 1.5);
            const layer8TransformKey = `layer8-${layer8Scale.toFixed(2)}`;
            if (!transforms.has(layer8TransformKey)) {
                transforms.set(layer8TransformKey, `translateX(-50%) scale(${layer8Scale})`);
            }
            const newLayer8Transform = transforms.get(layer8TransformKey);
            if (this.layer8.style.transform !== newLayer8Transform) {
                this.layer8.style.transform = newLayer8Transform;
            }
        }

        // Show info panel when INFO images have grown significantly (appears after HERO zoom)
        const infoPanelThreshold = 0.30; // Moved to 30% for more HERO zoom time (600px of scroll)
        const shouldShowPanel = scrollProgress > infoPanelThreshold;

        // Only toggle classes if state actually changed
        if (shouldShowPanel && !this.infoPanel.classList.contains('visible')) {
            this.infoPanel.classList.add('visible');
            this.overlay.classList.add('curtain-open');
        } else if (!shouldShowPanel && this.infoPanel.classList.contains('visible')) {
            this.infoPanel.classList.remove('visible');
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
