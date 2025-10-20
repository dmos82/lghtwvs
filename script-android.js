// ========================================
// CANVAS-BASED PARALLAX ZOOM ENGINE
// Using game rendering techniques for smooth performance
// ========================================

class CanvasParallax {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', {
            alpha: false,
            desynchronized: true,
            willReadFrequently: false // Hint that we won't read pixels
        });

        // ANDROID: Disable image smoothing for better performance
        this.ctx.imageSmoothingEnabled = false;
        this.loading = document.getElementById('loading');
        this.debug = document.getElementById('debug');
        this.infoPanel = document.getElementById('infoPanel');

        // Performance tracking
        this.fps = 0;
        this.frameTime = 0;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.renderFrameCount = 0; // Track rendered frames for skip logic

        // Scroll and zoom state
        this.scrollY = 0;
        this.targetScrollY = 0;
        this.currentZoom = 1;
        this.targetZoom = 1;
        this.scrollHeight = 2500;

        // Layer configuration - OPTIMIZED COMPRESSED IMAGES for Android
        // Only 4 total layers with compressed versions
        this.layers = [
            // HERO layers - using optimized compressed images
            { src: 'HERO/optimized/lghtwvs-11-optimized.jpg', speed: 1.8, type: 'hero', scale: 1 },
            { src: 'HERO/optimized/lghtwvs-8-optimized.png', speed: 1.4, type: 'hero', scale: 1, isBottom: true },
            { src: 'HERO/optimized/lghtwvs-1-optimized.png', speed: 0.5, type: 'hero', scale: 1 },

            // INFO layer - compressed
            { src: 'INFO/optimized/center-image-circle-optimized.png', speed: 1.0, type: 'info', scale: 0.001 }
        ];

        this.images = new Map();
        this.isLoading = true;
        this.isMobile = window.innerWidth <= 768;

        // Animation state
        this.animationFrame = null;
        this.isAnimating = false;

        // Text overlay state
        this.davidMorinSpread = 0;

        // Smooth opacity interpolation for info panel
        this.infoPanelOpacity = 0.001; // Start pre-warmed
        this.targetInfoPanelOpacity = 0.001;

        this.init();
    }

    async init() {
        // Setup canvas size
        this.resize();

        // Load all images
        await this.loadImages();

        // Setup event listeners
        this.setupEventListeners();

        // Hide loading screen
        this.loading.style.display = 'none';
        this.isLoading = false;

        // Start animation loop
        this.startAnimation();

        console.log('✅ Canvas Parallax Engine initialized');
        console.log(`   Layers: ${this.layers.length}`);
        console.log(`   Mobile: ${this.isMobile}`);
    }

    async loadImages() {
        const loadPromises = this.layers.map(layer => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.images.set(layer.src, img);
                    resolve();
                };
                img.onerror = reject;
                img.src = layer.src;
            });
        });

        await Promise.all(loadPromises);
        console.log(`✅ Loaded ${this.images.size} images`);
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.resize());

        // Scroll handling with smoothing
        window.addEventListener('scroll', (e) => {
            this.targetScrollY = window.scrollY;
        }, { passive: true });

        // Touch events for mobile
        if (this.isMobile) {
            window.addEventListener('touchmove', (e) => {
                this.targetScrollY = window.scrollY;
            }, { passive: true });
        }

        // Debug toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.debug.classList.toggle('visible');
            }
        });
    }

    resize() {
        // ANDROID OPTIMIZATION: Cap DPR at 1.0 for maximum performance
        // Even 1.5x DPR is too heavy for lower-end Android devices
        const nativeDpr = window.devicePixelRatio || 1;
        const dpr = 1.0; // Force 1.0 DPR for best performance

        // Get display size
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;

        // Set actual canvas size scaled for capped device pixel ratio
        this.canvas.width = Math.floor(displayWidth * dpr); // Round to avoid sub-pixel
        this.canvas.height = Math.floor(displayHeight * dpr);

        // Scale canvas back down using CSS
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';

        // Store the DPR for use in drawing
        this.dpr = dpr;

        // Update center points for actual canvas size - use integers
        this.centerX = Math.floor(this.canvas.width / 2);
        this.centerY = Math.floor(this.canvas.height / 2);

        console.log(`Android Optimization: Native DPR ${nativeDpr} capped to ${dpr}`);
        console.log(`Canvas size: ${this.canvas.width}x${this.canvas.height}`);
    }

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.animate();
    }

    animate() {
        // Calculate FPS
        const now = performance.now();
        const delta = now - this.lastTime;
        this.frameTime = delta;

        // ANDROID OPTIMIZATION: Aggressive throttle to 20fps
        // 50ms = 20fps - further reduces GPU load
        if (delta < 50) { // 50ms = 20fps (was 33ms/30fps)
            this.animationFrame = requestAnimationFrame(() => this.animate());
            return;
        }

        this.lastTime = now;
        this.frameCount++;
        this.renderFrameCount++;

        // SKIP EVERY 3RD FRAME for even more performance
        // Render 2, skip 1 = effective ~13fps but still smooth
        if (this.renderFrameCount % 3 === 0) {
            // Skip this render frame, just update logic
            this.scrollY += (this.targetScrollY - this.scrollY) * 0.2;
            this.animationFrame = requestAnimationFrame(() => this.animate());
            return;
        }

        if (this.frameCount % 10 === 0) {
            this.fps = Math.round(1000 / delta);
            this.updateDebug();
        }

        // Smooth scroll interpolation - more aggressive for responsiveness
        const scrollSpeed = 0.2; // Increased from 0.15
        this.scrollY += (this.targetScrollY - this.scrollY) * scrollSpeed;

        // Calculate scroll progress
        const scrollProgress = Math.max(0, Math.min(1, this.scrollY / this.scrollHeight));

        // Calculate zoom with easing - match original's 2.5x max
        const targetZoom = 1 + (scrollProgress * 1.5); // Max 2.5x zoom
        const zoomSpeed = 0.1;
        this.currentZoom += (targetZoom - this.currentZoom) * zoomSpeed;

        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context state
        this.ctx.save();

        // Apply global zoom transformation - zoom out by 10% to prevent truncation
        const globalScale = (1 + ((this.currentZoom - 1) * 0.5)) * 0.90; // Zoom out by 10%
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.scale(globalScale, globalScale);
        this.ctx.translate(-this.centerX, -this.centerY);

        // Draw all layers
        let layersDrawn = 0;
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const img = this.images.get(layer.src);
            if (!img) continue;

            // Calculate layer-specific zoom
            // For background layer, reduce zoom effect to maintain viewport coverage
            const layerZoom = layer.src.includes('lghtwvs 11')
                ? 1 + ((this.currentZoom - 1) * layer.speed * 0.5) // Less zoom for background
                : 1 + ((this.currentZoom - 1) * layer.speed);

            // Handle different layer types
            if (layer.type === 'hero') {
                this.drawHeroLayer(img, layer, layerZoom, scrollProgress);
                layersDrawn++;
            } else if (layer.type === 'info') {
                // INFO layers ALWAYS drawn - starts microscopic for GPU pre-warming
                // This eliminates stutter when they first appear
                const infoScale = 0.001 + (scrollProgress * 1.0);
                const finalScale = layerZoom * infoScale;

                // Always draw, even at tiny scale - keeps GPU layer active
                this.drawInfoLayer(img, layer, finalScale);
                layersDrawn++;
            }
        }

        // Restore context
        this.ctx.restore();

        // Draw text overlay (DAVID MORIN)
        this.drawTextOverlay(scrollProgress);

        // SMOOTH info panel appearance - no classList toggling to prevent stutter
        const infoPanelThreshold = 0.12; // 12% scroll - record appears
        if (scrollProgress > infoPanelThreshold) {
            // Gradually increase opacity over 5% scroll range for smooth fade-in
            const fadeRange = 0.05;
            const fadeProgress = Math.min(1, (scrollProgress - infoPanelThreshold) / fadeRange);
            this.targetInfoPanelOpacity = fadeProgress;
            this.davidMorinSpread = Math.min(1, fadeProgress);
        } else {
            this.targetInfoPanelOpacity = 0.001; // Keep pre-warmed, not fully 0
            this.davidMorinSpread = 0;
        }

        // Smooth interpolation of info panel opacity
        const opacitySpeed = 0.1; // Smooth easing
        this.infoPanelOpacity += (this.targetInfoPanelOpacity - this.infoPanelOpacity) * opacitySpeed;

        // Apply smooth opacity directly without class changes
        this.infoPanel.style.opacity = this.infoPanelOpacity.toFixed(3);
        this.infoPanel.style.pointerEvents = this.infoPanelOpacity > 0.5 ? 'auto' : 'none';

        // Store for debug
        this.layersDrawn = layersDrawn;

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    drawHeroLayer(img, layer, zoom, scrollProgress) {
        // Scale images to fit viewport better
        const aspectRatio = img.width / img.height;
        let width, height;

        // Special handling for background layer (lghtwvs 11) - make it fill viewport
        if (layer.src.includes('lghtwvs 11')) {
            // Make background fill entire viewport to eliminate black borders
            // Always cover the entire viewport, even when zoomed out
            if (aspectRatio > this.canvas.width / this.canvas.height) {
                height = this.canvas.height * 1.6; // Extra large to ensure coverage
                width = height * aspectRatio;
            } else {
                width = this.canvas.width * 1.6; // Extra large to ensure coverage
                height = width / aspectRatio;
            }
        } else {
            // Base size on viewport - reduced by 15% to prevent truncation
            if (aspectRatio > this.canvas.width / this.canvas.height) {
                // Image is wider - fit to width
                width = this.canvas.width * 1.05; // Reduced from 1.2 to zoom out more
                height = width / aspectRatio;
            } else {
                // Image is taller - fit to height
                height = this.canvas.height * 1.05; // Reduced from 1.2 to zoom out more
                width = height * aspectRatio;
            }
        }

        // Calculate position - ANDROID: Round to integers to avoid sub-pixel rendering
        let x = Math.floor(this.centerX - (width * zoom) / 2);
        let y = Math.floor(this.centerY - (height * zoom) / 2);

        // Special positioning for bottom layer (figure)
        if (layer.isBottom) {
            const scale = this.isMobile ? 2.5 : 1.5;
            const bottomOffset = this.isMobile ? -0.3 : -0.2;
            y = Math.floor(this.canvas.height - (height * zoom * scale * (1 + bottomOffset)));
            x = Math.floor(this.centerX - (width * zoom * scale) / 2);

            this.ctx.save();
            this.ctx.globalAlpha = 1;
            // ANDROID: Round dimensions to avoid sub-pixel rendering
            this.ctx.drawImage(img,
                Math.floor(x),
                Math.floor(y),
                Math.floor(width * zoom * scale),
                Math.floor(height * zoom * scale)
            );
            this.ctx.restore();
            return;
        }

        // Handle fade out for layer 9
        let alpha = 1;
        if (layer.fadeOut) {
            if (scrollProgress < 0.06) {
                alpha = 1 - (scrollProgress / 0.06);
            } else {
                alpha = 0;
            }
        }

        // Draw with alpha - ANDROID: Round all coordinates and dimensions
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(img,
            Math.floor(x),
            Math.floor(y),
            Math.floor(width * zoom),
            Math.floor(height * zoom)
        );
        this.ctx.restore();
    }

    drawInfoLayer(img, layer, scale) {
        // Scale images to fit viewport better like HERO layers
        const aspectRatio = img.width / img.height;
        let width, height;

        if (aspectRatio > this.canvas.width / this.canvas.height) {
            width = this.canvas.width * 1.2; // Match HERO sizing
            height = width / aspectRatio;
        } else {
            height = this.canvas.height * 1.2; // Match HERO sizing
            width = height * aspectRatio;
        }

        // Cap scale to prevent pixelation
        const cappedScale = Math.min(scale, 5);

        // ANDROID: Round all coordinates and dimensions
        const x = Math.floor(this.centerX - (width * cappedScale) / 2);
        const y = Math.floor(this.centerY - (height * cappedScale) / 2);

        this.ctx.save();
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(img,
            x,
            y,
            Math.floor(width * cappedScale),
            Math.floor(height * cappedScale)
        );
        this.ctx.restore();
    }

    drawTextOverlay(scrollProgress) {
        // DAVID MORIN text with curtain effect
        const spread = this.davidMorinSpread;

        if (scrollProgress < 0.35 || spread < 0.1) {
            this.ctx.save();

            // Scale based on viewport - use pixel values for crisp text
            const fontSize = Math.min(120, this.canvas.width * 0.12);
            this.ctx.font = `bold ${fontSize}px Orbitron`;
            this.ctx.fillStyle = this.isMobile ? '#fff' : '#0f0';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            this.ctx.shadowBlur = 20;

            // Draw DAVID (moving left) - extra wide spacing to prevent overlap
            const spacing = this.canvas.width * 0.25; // Increased from 0.15 to 0.25
            const textY = this.centerY - 30;
            const davidX = this.centerX - spacing - (spread * 500);
            this.ctx.fillText('DAVID', davidX, textY);

            // Draw MORIN (moving right) - extra wide spacing to prevent overlap
            const morinX = this.centerX + spacing + (spread * 500);
            this.ctx.fillText('MORIN', morinX, textY);

            this.ctx.restore();
        }
    }

    updateDebug() {
        if (this.debug.classList.contains('visible')) {
            document.getElementById('fps').textContent = this.fps;
            document.getElementById('scrollPos').textContent = Math.round(this.scrollY);
            document.getElementById('zoomLevel').textContent = this.currentZoom.toFixed(2);
            document.getElementById('layersDrawn').textContent = this.layersDrawn;
        }
    }

    destroy() {
        this.isAnimating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const parallax = new CanvasParallax();

    // Expose to window for debugging
    window.parallax = parallax;
});