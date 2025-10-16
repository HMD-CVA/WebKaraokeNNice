class TripleBannerSlider {
    constructor() {
        this.track = document.querySelector('.banner-track');
        this.items = document.querySelectorAll('.banner-item');
        this.indicatorsContainer = document.querySelector('.indicators');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.progressBar = document.querySelector('.progress-bar');
        
        this.currentPosition = 0;
        this.transitionTime = 8000;
        this.slideInterval = null;
        this.progressInterval = null;
        this.isAnimating = false;
        
        this.baseWidth = 550;
        this.baseHeight = 780;
        this.minWidth = 300;
        this.minHeight = 420;
        
        this.init();
        this.updateLayout();
        window.addEventListener('resize', () => {
            this.updateLayout();
        });
    }
    
    calculateBannerSize() {
        const viewport = document.querySelector('.banner-viewport');
        const viewportWidth = viewport.offsetWidth - 40;
        const viewportHeight = viewport.offsetHeight - 40;
        
        let itemsPerView;
        let targetWidth, targetHeight;
        
        if (viewportWidth >= 1800) {
            itemsPerView = 3;
            targetWidth = this.baseWidth;
            targetHeight = this.baseHeight;
        } else if (viewportWidth >= 1400) {
            itemsPerView = 3;
            const scale = Math.min(viewportWidth / (this.baseWidth * 3 + 100), 0.9);
            targetWidth = Math.max(this.baseWidth * scale, this.minWidth);
            targetHeight = Math.max(this.baseHeight * scale, this.minHeight);
        } else if (viewportWidth >= 1100) {
            itemsPerView = 3;
            const scale = Math.min(viewportWidth / (this.baseWidth * 3 + 80), 0.8);
            targetWidth = Math.max(this.baseWidth * scale, this.minWidth);
            targetHeight = Math.max(this.baseHeight * scale, this.minHeight);
        } else if (viewportWidth >= 900) {
            itemsPerView = 2;
            targetWidth = this.baseWidth * 0.9;
            targetHeight = this.baseHeight * 0.9;
        } else if (viewportWidth >= 700) {
            itemsPerView = 2;
            const scale = Math.min(viewportWidth / (this.baseWidth * 2 + 60), 0.8);
            targetWidth = Math.max(this.baseWidth * scale, this.minWidth);
            targetHeight = Math.max(this.baseHeight * scale, this.minHeight);
        } else if (viewportWidth >= 500) {
            itemsPerView = 1;
            targetWidth = Math.min(viewportWidth - 40, this.baseWidth);
            targetHeight = (targetWidth / this.baseWidth) * this.baseHeight;
        } else {
            itemsPerView = 1;
            targetWidth = Math.max(viewportWidth - 20, this.minWidth);
            targetHeight = (targetWidth / this.baseWidth) * this.baseHeight;
        }
        
        if (targetHeight > viewportHeight) {
            targetHeight = viewportHeight;
            targetWidth = (targetHeight / this.baseHeight) * this.baseWidth;
        }
        
        return {
            itemsPerView,
            targetWidth: Math.round(targetWidth),
            targetHeight: Math.round(targetHeight)
        };
    }
    
    calculateTotalPositions(itemsPerView) {
        return Math.max(0, this.items.length - itemsPerView);
    }
    
    applyLayout(layout) {
        const { itemsPerView, targetWidth, targetHeight } = layout;
        const viewport = document.querySelector('.banner-viewport');
        const viewportWidth = viewport.offsetWidth;
        
        // ÁP DỤNG KÍCH THƯỚC ITEMS
        this.items.forEach((item, index) => {
            const img = item.querySelector('img');
            
            item.style.width = targetWidth + 'px';
            item.style.height = targetHeight + 'px';
            item.style.minWidth = targetWidth + 'px';
            item.style.minHeight = targetHeight + 'px';
            item.style.maxWidth = targetWidth + 'px';
            item.style.maxHeight = targetHeight + 'px';
            item.style.flexShrink = '0';
            
            if (img) {
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.objectPosition = 'center';
                img.style.display = 'block';
                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                img.style.minWidth = '100%';
                img.style.minHeight = '100%';
            }
        });
        
        // ÁP DỤNG SPACE EVENLY
        if (itemsPerView > 1) {
            const totalItemsWidth = targetWidth * itemsPerView;
            const totalAvailableSpace = viewportWidth - totalItemsWidth;
            const spaceBetween = Math.max(20, totalAvailableSpace / (itemsPerView + 1));
            
            this.track.style.gap = `${spaceBetween}px`;
            this.track.style.justifyContent = 'space-evenly';
            this.track.style.paddingLeft = `${spaceBetween}px`;
            this.track.style.paddingRight = `${spaceBetween}px`;
            
            this.updateTrackWidth(targetWidth, spaceBetween);
        } else {
            this.track.style.justifyContent = 'center';
            this.track.style.gap = '20px';
            this.track.style.paddingLeft = '0px';
            this.track.style.paddingRight = '0px';
            this.updateTrackWidth(targetWidth, 20);
        }
        
        console.log(`📐 Layout: ${itemsPerView} items, ${targetWidth}x${targetHeight}px`);
    }
    
    updateTrackWidth(itemWidth, spaceBetween) {
        const totalWidth = (itemWidth + spaceBetween) * this.items.length + spaceBetween;
        this.track.style.width = totalWidth + 'px';
    }
    
    updateLayout() {
        const layout = this.calculateBannerSize();
        this.itemsPerView = layout.itemsPerView;
        this.targetWidth = layout.targetWidth;
        this.targetHeight = layout.targetHeight;
        this.totalPositions = this.calculateTotalPositions(this.itemsPerView);
        
        if (this.currentPosition > this.totalPositions) {
            this.currentPosition = this.totalPositions;
        }
        
        console.log(`🔄 Layout: ${this.itemsPerView} items/view, ${this.totalPositions + 1} slides, ${this.targetWidth}x${this.targetHeight}px`);
        
        this.applyLayout(layout);
        this.createIndicators();
        this.updateSlider();
    }
    
    createIndicators() {
        this.indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i <= this.totalPositions; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            indicator.setAttribute('data-slide', i);
            if (i === this.currentPosition) {
                indicator.classList.add('active');
            }
            
            indicator.addEventListener('click', () => {
                this.goToPosition(i);
            });
            
            this.indicatorsContainer.appendChild(indicator);
        }
        
        this.indicators = document.querySelectorAll('.indicator');
    }
    
    init() {
        this.updateSlider();
        
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.startSlideShow();
        
        const bannerContainer = document.querySelector('.banner-container');
        bannerContainer.addEventListener('mouseenter', () => {
            this.pauseSlideShow();
        });
        
        bannerContainer.addEventListener('mouseleave', () => {
            this.startSlideShow();
        });
    }
    
    startSlideShow() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
        
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, this.transitionTime);
        
        this.startProgressBar();
    }
    
    startProgressBar() {
        this.progressBar.style.width = '0%';
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        let width = 0;
        const increment = 100 / (this.transitionTime / 100);
        
        this.progressInterval = setInterval(() => {
            if (width >= 100) {
                clearInterval(this.progressInterval);
            } else {
                width += increment;
                this.progressBar.style.width = width + '%';
            }
        }, 100);
    }
    
    pauseSlideShow() {
        clearInterval(this.slideInterval);
        clearInterval(this.progressInterval);
    }
    
    nextSlide() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        if (this.currentPosition < this.totalPositions) {
            this.currentPosition++;
        } else {
            this.currentPosition = 0;
        }
        
        this.updateSlider();
    }
    
    prevSlide() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        if (this.currentPosition > 0) {
            this.currentPosition--;
        } else {
            this.currentPosition = this.totalPositions;
        }
        
        this.updateSlider();
    }
    
    goToPosition(position) {
        if (this.isAnimating || position === this.currentPosition) return;
        
        this.isAnimating = true;
        this.currentPosition = position;
        this.updateSlider();
    }
    
    updateSlider() {
        if (!this.itemsPerView || !this.targetWidth) return;
        
        const viewport = document.querySelector('.banner-viewport');
        const viewportWidth = viewport.offsetWidth;
        
        let spaceBetween;
        if (this.itemsPerView > 1) {
            const totalItemsWidth = this.targetWidth * this.itemsPerView;
            const totalAvailableSpace = viewportWidth - totalItemsWidth;
            spaceBetween = Math.max(20, totalAvailableSpace / (this.itemsPerView + 1));
        } else {
            spaceBetween = 20;
        }
        
        const itemWidthWithSpace = this.targetWidth + spaceBetween;
        const translateValue = -this.currentPosition * itemWidthWithSpace;
        
        this.track.style.transform = `translateX(${translateValue}px)`;
        this.track.style.transition = 'transform 0.8s ease-in-out';
        
        if (this.indicators) {
            this.indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === this.currentPosition);
            });
        }
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
        
        this.startSlideShow();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const slider = new TripleBannerSlider();
    console.log('🚀 Banner Slider with Bottom 0px loaded!');
});