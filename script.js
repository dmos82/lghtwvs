// ========================================
// INFINITE ZOOM SCROLL - Light Waves
// Layered images with zoom effect
// ========================================

class InfiniteZoomScroll {
    constructor() {
        // Image configurations
        this.heroImages = [1, 2, 3, 4, 5, 6, 9, 10, 11];
        this.infoImages = [1, 2, 3, 4, 5, 6, 7];

        // State
        this.state = {
            scrollY: 0,
            currentLayer: 0,
            currentSection: 'hero'
        };

        // Scroll settings
        this.pixelsPerLayer = 200; // Scroll distance per layer
        this.maxZoom = 3; // Max zoom scale

        // DOM elements
        this.viewport = document.querySelector('.viewport');
        this.scrollContainer = document.querySelector('.scroll-container');
        this.heroSection = document.getElementById('heroSection');
        this.infoSection = document.getElementById('infoSection');
        this.heroStack = document.getElementById('heroStack');
        this.infoStack = document.getElementById('infoStack');
        this.debugInfo = document.getElementById('debugInfo');

        this.init();
    }

    init() {
        // Set scroll container height to allow scrolling through all layers
        const totalLayers = this.heroImages.length + this.infoImages.length;
        const totalScrollHeight = totalLayers * this.pixelsPerLayer * 4; // Extra room for zoom effect
        this.scrollContainer.style.height = totalScrollHeight + 'px';

        // Initialize first layer as active
        this.setActiveLayer(0, 'hero');

        // Listen for scroll
        window.addEventListener('scroll', () => this.onScroll());

        console.log('✅ Zoom Scroll initialized');
        console.log(`   Hero layers: ${this.heroImages.length}`);
        console.log(`   Info layers: ${this.infoImages.length}`);
        console.log(`   Total scroll height: ${totalScrollHeight}px`);
    }

    onScroll() {
        this.state.scrollY = window.scrollY;
        this.updateDisplay();
    }

    updateDisplay() {
        // Calculate which layer to show and zoom level
        const scrollProgress = this.state.scrollY / this.pixelsPerLayer;
        const layerIndex = Math.floor(scrollProgress);
        const layerProgress = scrollProgress - layerIndex; // 0-1 progress within layer

        // Determine which section we're in
        const heroCount = this.heroImages.length;
        let activeLayer = layerIndex;
        let section = 'hero';

        if (layerIndex >= heroCount) {
            section = 'info';
            activeLayer = layerIndex - heroCount;
        }

        // Update section visibility
        this.updateSectionVisibility(section);

        // Update layer visibility
        this.updateLayers(activeLayer, section);

        // Calculate zoom based on progress within layer
        const zoom = 1 + (layerProgress * (this.maxZoom - 1));
        this.viewport.style.transform = `scale(${zoom})`;

        // Update debug info
        this.updateDebug(layerIndex, activeLayer, section, zoom);
    }

    updateSectionVisibility(section) {
        if (section === 'hero') {
            this.heroSection.classList.remove('hidden');
            this.infoSection.classList.add('hidden');
            this.state.currentSection = 'hero';
        } else {
            this.heroSection.classList.add('hidden');
            this.infoSection.classList.remove('hidden');
            this.state.currentSection = 'info';
        }
    }

    updateLayers(layerIndex, section) {
        const stack = section === 'hero' ? this.heroStack : this.infoStack;
        const layers = stack.querySelectorAll('.layer');

        // Remove active from all layers
        layers.forEach(layer => layer.classList.remove('active'));

        // Add active to current layer
        if (layerIndex < layers.length) {
            layers[layerIndex].classList.add('active');
        }
    }

    setActiveLayer(index, section) {
        this.updateSectionVisibility(section);
        this.updateLayers(index, section);
    }

    updateDebug(totalLayer, sectionLayer, section, zoom) {
        if (this.debugInfo) {
            document.getElementById('scrollPos').textContent = Math.round(this.state.scrollY);
            document.getElementById('layerNum').textContent = sectionLayer + 1;
            document.getElementById('zoomLevel').textContent = zoom.toFixed(2);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.zoomScroll = new InfiniteZoomScroll();
});

// Fallback for cached pages
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    window.zoomScroll = new InfiniteZoomScroll();
}
