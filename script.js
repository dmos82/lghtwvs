// ========================================
// INFINITE ZOOM SCROLL - Light Waves
// Fixed scroll-to-zoom implementation
// ========================================

class InfiniteZoomScroll {
    constructor() {
        // Configuration
        this.config = {
            heroImages: 11,
            infoImages: 7,
            scrollPixelsPerImage: 200, // pixels of scroll per image transition
            debug: true,
        };

        // State
        this.state = {
            scrollPosition: 0,
            currentSection: 'hero',
            heroImageIndex: 1,
            infoImageIndex: 1,
            heroProgress: 0,
            infoProgress: 0,
        };

        // DOM Elements
        this.elements = {
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

        this.init();
    }

    init() {
        this.calculateScrollHeight();
        this.preloadImages();
        this.bindEvents();

        // Hide loading indicator
        setTimeout(() => {
            if (this.elements.loadingIndicator) {
                this.elements.loadingIndicator.classList.add('hidden');
            }
        }, 500);
    }

    /**
     * Calculate total scroll height
     * Each image gets scrollPixelsPerImage to transition
     */
    calculateScrollHeight() {
        const totalImages = this.config.heroImages + this.config.infoImages;
        const scrollHeight = totalImages * this.config.scrollPixelsPerImage * 3;
        this.elements.scrollContainer.style.height = scrollHeight + 'px';
    }

    /**
     * Preload all images
     */
    preloadImages() {
        // Preload HERO images
        for (let i = 1; i <= this.config.heroImages; i++) {
            const img = new Image();
            img.src = `HERO/lghtwvs ${i}.JPG`;
        }

        // Preload INFO images
        for (let i = 1; i <= this.config.infoImages; i++) {
            const img = new Image();
            img.src = `INFO/LGHTWVS INFO ${i}.TIF`;
        }
    }

    /**
     * Bind events
     */
    bindEvents() {
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', () => this.calculateScrollHeight());
    }

    /**
     * Main scroll handler
     */
    onScroll() {
        this.state.scrollPosition = window.scrollY;
        this.update();
    }

    /**
     * Update zoom and images based on scroll
     */
    update() {
        const scrollPerImage = this.config.scrollPixelsPerImage;

        // Calculate which image we're on
        const heroTotalScroll = this.config.heroImages * scrollPerImage;

        if (this.state.scrollPosition < heroTotalScroll) {
            // HERO SECTION
            this.state.currentSection = 'hero';
            const heroScroll = this.state.scrollPosition;
            const heroImageProgress = heroScroll / scrollPerImage;

            this.state.heroImageIndex = Math.min(
                this.config.heroImages,
                Math.max(1, Math.ceil(heroImageProgress))
            );
            this.state.heroProgress = heroImageProgress;

            this.updateHeroSection(heroImageProgress);
        } else {
            // INFO SECTION
            this.state.currentSection = 'info';
            const infoScroll = this.state.scrollPosition - heroTotalScroll;
            const infoImageProgress = infoScroll / scrollPerImage;

            this.state.infoImageIndex = Math.min(
                this.config.infoImages,
                Math.max(1, Math.ceil(infoImageProgress))
            );
            this.state.infoProgress = infoImageProgress;

            this.updateInfoSection(infoImageProgress);
        }

        this.updateDebug();
    }

    /**
     * Update HERO section
     */
    updateHeroSection(progress) {
        // Show hero, hide info
        this.elements.heroSection.classList.add('active');
        this.elements.infoSection.classList.remove('active');

        // Update image
        const imageIndex = this.state.heroImageIndex;
        this.elements.heroImage.src = `HERO/lghtwvs ${imageIndex}.JPG`;

        // Calculate zoom: 1x at image 1, scales up to image 11
        const zoomScale = 1 + (progress * 8); // Exponential zoom

        // Apply transform
        this.applyZoom(this.elements.heroLayer, zoomScale, progress);

        // Show overlay when zoomed
        if (progress > 0.7) {
            this.elements.heroOverlay.classList.add('visible');
        } else {
            this.elements.heroOverlay.classList.remove('visible');
        }
    }

    /**
     * Update INFO section
     */
    updateInfoSection(progress) {
        // Show info, hide hero
        this.elements.infoSection.classList.add('active');
        this.elements.heroSection.classList.remove('active');

        // Update image
        const imageIndex = this.state.infoImageIndex;
        this.elements.infoImage.src = `INFO/LGHTWVS INFO ${imageIndex}.TIF`;

        // Calculate zoom
        const zoomScale = 1 + (progress * 8);

        // Apply transform
        this.applyZoom(this.elements.infoLayer, zoomScale, progress);

        // Show overlay when zoomed
        if (progress > 0.7) {
            this.elements.infoOverlay.classList.add('visible');
        } else {
            this.elements.infoOverlay.classList.remove('visible');
        }
    }

    /**
     * Apply zoom transform
     */
    applyZoom(layer, scale, progress) {
        // Smooth easing
        const easedScale = Math.pow(scale, 0.85);

        layer.style.transform = `scale(${easedScale})`;
        layer.style.filter = `brightness(${0.85 + progress * 0.15})`;
    }

    /**
     * Update debug display
     */
    updateDebug() {
        if (!this.config.debug || !this.elements.debugInfo) return;

        const scrollPercent = Math.round((this.state.scrollPosition / document.querySelector('.scroll-container').offsetHeight) * 100);

        document.getElementById('scrollPercent').textContent = scrollPercent;
        document.getElementById('zoomLevel').textContent = (this.state.currentSection === 'hero' ? this.state.heroProgress : this.state.infoProgress).toFixed(2);
        document.getElementById('currentSection').textContent = this.state.currentSection === 'hero' ? `HERO (${this.state.heroImageIndex}/11)` : `INFO (${this.state.infoImageIndex}/7)`;
    }

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

if (document.readyState === 'interactive' || document.readyState === 'complete') {
    window.zoomScroll = new InfiniteZoomScroll();
}
