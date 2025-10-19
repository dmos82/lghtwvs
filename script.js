// ========================================
// INFINITE ZOOM SCROLL - Light Waves
// Simplified implementation
// ========================================

class InfiniteZoomScroll {
    constructor() {
        this.heroImageIndices = [1, 2, 3, 4, 5, 6, 9, 10, 11]; // Actual hero images
        this.infoImageIndices = [1, 2, 3, 4, 5, 6, 7]; // All info images

        this.state = {
            scrollPosition: 0,
            currentImageIndex: 0,
            isHeroSection: true,
        };

        this.elements = {
            heroImage: document.getElementById('heroImage'),
            infoImage: document.getElementById('infoImage'),
            heroSection: document.getElementById('heroSection'),
            infoSection: document.getElementById('infoSection'),
            heroLayer: document.getElementById('heroLayer'),
            infoLayer: document.getElementById('infoLayer'),
            scrollContainer: document.querySelector('.scroll-container'),
            debugInfo: document.getElementById('debugInfo'),
        };

        this.init();
    }

    init() {
        // Set scroll container height
        const totalImages = this.heroImageIndices.length + this.infoImageIndices.length;
        const pixelsPerImage = 150; // Scroll distance per image
        this.elements.scrollContainer.style.height = (totalImages * pixelsPerImage * 2) + 'px';

        // Show first image
        this.updateDisplay();

        // Bind scroll event
        window.addEventListener('scroll', () => this.onScroll());
    }

    onScroll() {
        this.state.scrollPosition = window.scrollY;
        this.updateDisplay();
    }

    updateDisplay() {
        const pixelsPerImage = 150;
        const scrollProgress = this.state.scrollPosition / pixelsPerImage;

        // Total hero images
        const heroCount = this.heroImageIndices.length;

        if (scrollProgress < heroCount) {
            // Show HERO section
            this.state.isHeroSection = true;
            this.elements.heroSection.classList.add('active');
            this.elements.infoSection.classList.remove('active');

            const imageIndex = Math.floor(scrollProgress);
            const clamped = Math.min(imageIndex, heroCount - 1);
            const actualImageNum = this.heroImageIndices[clamped];

            this.elements.heroImage.src = `HERO/lghtwvs ${actualImageNum}.JPG`;

            // Calculate zoom based on scroll within this image
            const zoomProgress = scrollProgress - imageIndex;
            const scale = 1 + (zoomProgress * 5); // Zoom from 1x to 6x per image
            this.elements.heroLayer.style.transform = `scale(${scale})`;

            this.updateDebug(`HERO ${clamped + 1}/${heroCount}`, scrollProgress.toFixed(2), scale.toFixed(2));
        } else {
            // Show INFO section
            this.state.isHeroSection = false;
            this.elements.infoSection.classList.add('active');
            this.elements.heroSection.classList.remove('active');

            const infoScroll = scrollProgress - heroCount;
            const infoCount = this.infoImageIndices.length;
            const imageIndex = Math.floor(infoScroll);
            const clamped = Math.min(imageIndex, infoCount - 1);
            const actualImageNum = this.infoImageIndices[clamped];

            this.elements.infoImage.src = `INFO/LGHTWVS INFO ${actualImageNum}.TIF`;

            // Calculate zoom
            const zoomProgress = infoScroll - imageIndex;
            const scale = 1 + (zoomProgress * 5);
            this.elements.infoLayer.style.transform = `scale(${scale})`;

            this.updateDebug(`INFO ${clamped + 1}/${infoCount}`, infoScroll.toFixed(2), scale.toFixed(2));
        }
    }

    updateDebug(section, progress, zoom) {
        if (this.elements.debugInfo) {
            document.getElementById('scrollPercent').textContent = Math.round(this.state.scrollPosition);
            document.getElementById('zoomLevel').textContent = zoom;
            document.getElementById('currentSection').textContent = section;
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.zoomScroll = new InfiniteZoomScroll();
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
    window.zoomScroll = new InfiniteZoomScroll();
}
