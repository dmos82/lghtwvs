// ========================================
// INFINITE ZOOM SCROLL - Light Waves
// Core scroll handling & zoom calculations
// ========================================

class InfiniteZoomScroll {
    constructor() {
        // Configuration
        this.config = {
            zoomMultiplier: 15, // How fast to zoom (higher = more dramatic)
            transitionThreshold: 0.85, // When to start transitioning sections (0-1)
            maxZoomLevel: 100, // Maximum zoom level before new section
            imageQuality: true, // Load high-quality images
            debug: true, // Show debug info
        };

        // State
        this.state = {
            scrollHeight: 0,
            scrollPosition: 0,
            currentZoomLevel: 1,
            currentSection: 'hero',
            heroProgress: 0, // 0-1
            infoProgress: 0, // 0-1
            isTransitioning: false,
        };

        // DOM Elements
        this.elements = {
            body: document.body,
            scrollContainer: document.querySelector('.scroll-container'),
            heroSection: document.getElementById('heroSection'),
            infoSection: document.getElementById('infoSection'),
            heroLayer: document.getElementById('heroLayer'),
            infoLayer: document.getElementById('infoLayer'),
            heroImage: document.getElementById('heroImage'),
            infoImage: document.getElementById('infoImage'),
            heroOverlay: document.getElementById('heroOverlay'),
            infoOverlay: document.getElementById('infoOverlay'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            debugInfo: document.getElementById('debugInfo'),
        };

        // Image cache
        this.imageCache = {
            hero: {},
            info: {},
        };

        this.init();
    }

    /**
     * Initialize the scroll system
     */
    init() {
        this.preloadImages();
        this.calculateScrollHeight();
        this.bindEvents();
        this.update();

        // Hide loading indicator when images are ready
        setTimeout(() => {
            this.elements.loadingIndicator.classList.add('hidden');
        }, 1000);
    }

    /**
     * Preload all images for smooth transitions
     */
    preloadImages() {
        // Preload HERO images (1-11)
        for (let i = 1; i <= 11; i++) {
            const img = new Image();
            img.src = `HERO/lghtwvs ${i}.JPG`;
            this.imageCache.hero[i] = img.src;
        }

        // Preload INFO images (1-7)
        for (let i = 1; i <= 7; i++) {
            const img = new Image();
            const num = i.toString().padStart(1, '0');
            img.src = `INFO/LGHTWVS INFO ${num}.TIF`;
            this.imageCache.info[i] = img.src;
        }
    }

    /**
     * Calculate total scroll height needed
     * Hero: 11 images, Info: 7 images
     * Total scroll depth determines zoom progression
     */
    calculateScrollHeight() {
        // Each image gets proportional scroll height
        // Total scroll = (11 + 7) * window height
        const imagesCount = 11 + 7; // Hero + Info
        this.state.scrollHeight = window.innerHeight * imagesCount * 2;
        this.elements.scrollContainer.style.height = this.state.scrollHeight + 'px';
    }

    /**
     * Bind scroll and resize events
     */
    bindEvents() {
        window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', () => this.onResize());

        // Touch support
        let touchStart = 0;
        window.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].clientY;
        });
        window.addEventListener('touchmove', (e) => {
            const touchEnd = e.touches[0].clientY;
            const delta = touchEnd - touchStart;
            window.scrollBy(0, -delta * 0.5);
            touchStart = touchEnd;
        }, { passive: false });
    }

    /**
     * Handle mouse wheel - prevent default scroll, use custom zoom
     */
    handleWheel(e) {
        e.preventDefault();

        // Calculate scroll speed based on wheel delta
        const scrollSpeed = 1.5;
        const newScrollPos = window.scrollY + (e.deltaY * scrollSpeed);

        // Clamp to valid range
        const maxScroll = this.state.scrollHeight - window.innerHeight;
        window.scrollY = Math.max(0, Math.min(newScrollPos, maxScroll));
    }

    /**
     * Main scroll event handler
     */
    onScroll() {
        this.state.scrollPosition = window.scrollY;
        this.update();
    }

    /**
     * Handle window resize
     */
    onResize() {
        this.calculateScrollHeight();
    }

    /**
     * Main update loop - recalculate zoom and image position
     */
    update() {
        // Calculate progress (0-1) through entire scroll
        const maxScroll = this.state.scrollHeight - window.innerHeight;
        const totalProgress = Math.min(1, this.state.scrollPosition / maxScroll);

        // Divide progress between Hero (60%) and Info (40%)
        const heroEndProgress = 0.6;

        if (totalProgress < heroEndProgress) {
            // HERO SECTION
            this.state.currentSection = 'hero';
            this.state.heroProgress = totalProgress / heroEndProgress; // 0-1
            this.updateHeroSection(this.state.heroProgress);
        } else {
            // INFO SECTION
            this.state.currentSection = 'info';
            const infoStart = heroEndProgress;
            this.state.infoProgress = (totalProgress - infoStart) / (1 - infoStart); // 0-1
            this.updateInfoSection(this.state.infoProgress);
        }

        // Update debug display
        this.updateDebug(totalProgress);
    }

    /**
     * Update HERO section - zoom and image swapping
     * Progress: 0 (start at image 1) → 1 (end at image 11)
     */
    updateHeroSection(progress) {
        // Make HERO section active
        this.elements.heroSection.classList.add('active');
        this.elements.infoSection.classList.remove('active');

        // Determine which image to display (1-11)
        const imageIndex = Math.min(11, Math.max(1, Math.ceil(progress * 11)));
        const imagePath = `HERO/lghtwvs ${imageIndex}.JPG`;

        if (this.elements.heroImage.src !== imagePath) {
            this.elements.heroImage.src = imagePath;
        }

        // Calculate zoom level
        // Start at 1x, scale up to maxZoom
        const zoomLevel = 1 + (progress * (this.config.maxZoomLevel - 1));
        this.state.currentZoomLevel = zoomLevel;

        // Apply zoom transform with smooth easing
        const scale = Math.pow(zoomLevel, 0.6); // Curved progression for natural feel
        this.applyZoomTransform(this.elements.heroLayer, scale, progress);

        // Show overlay when almost zoomed in
        if (progress > 0.7) {
            this.elements.heroOverlay.classList.add('visible');
        } else {
            this.elements.heroOverlay.classList.remove('visible');
        }
    }

    /**
     * Update INFO section - zoom and image swapping
     * Progress: 0 (start at image 1) → 1 (end at image 7)
     */
    updateInfoSection(progress) {
        // Make INFO section active
        this.elements.infoSection.classList.add('active');
        this.elements.heroSection.classList.remove('active');

        // Determine which image to display (1-7)
        const imageIndex = Math.min(7, Math.max(1, Math.ceil(progress * 7)));
        const infoNum = imageIndex.toString().padStart(1, '0');
        const imagePath = `INFO/LGHTWVS INFO ${infoNum}.TIF`;

        if (this.elements.infoImage.src !== imagePath) {
            this.elements.infoImage.src = imagePath;
        }

        // Calculate zoom level (same as hero for consistency)
        const zoomLevel = 1 + (progress * (this.config.maxZoomLevel - 1));
        this.state.currentZoomLevel = zoomLevel;

        // Apply zoom transform
        const scale = Math.pow(zoomLevel, 0.6);
        this.applyZoomTransform(this.elements.infoLayer, scale, progress);

        // Show overlay when almost zoomed in
        if (progress > 0.7) {
            this.elements.infoOverlay.classList.add('visible');
        } else {
            this.elements.infoOverlay.classList.remove('visible');
        }
    }

    /**
     * Apply zoom transform to zoom layer
     * Creates the infinite zoom effect by scaling and translating
     */
    applyZoomTransform(layer, scale, progress) {
        // Calculate subtle parallax offset based on progress
        const offsetX = Math.sin(progress * Math.PI) * 5; // -5 to +5%
        const offsetY = Math.cos(progress * Math.PI) * 5; // -5 to +5%

        // Apply transform: scale + subtle position shift
        layer.style.transform = `
            translate(-50%, -50%)
            scale(${scale})
            translate(${offsetX}%, ${offsetY}%)
        `;

        // Optional: Add slight rotation for more dynamic feel
        const rotation = Math.sin(progress * Math.PI * 2) * 0.5;
        layer.style.filter = `brightness(${0.9 + progress * 0.1})`;
    }

    /**
     * Update debug info display
     */
    updateDebug(totalProgress) {
        if (!this.config.debug || !this.elements.debugInfo) return;

        document.getElementById('scrollPercent').textContent =
            Math.round(totalProgress * 100);

        document.getElementById('zoomLevel').textContent =
            this.state.currentZoomLevel.toFixed(1);

        document.getElementById('currentSection').textContent =
            this.state.currentSection.toUpperCase();
    }

    /**
     * Disable debug info
     */
    disableDebug() {
        this.config.debug = false;
        if (this.elements.debugInfo) {
            this.elements.debugInfo.style.display = 'none';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.zoomScroll = new InfiniteZoomScroll();
});

// Fallback for if script loads after DOM
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    window.zoomScroll = new InfiniteZoomScroll();
}
