class TripleBannerSlider {
    constructor() {
        this.track = document.querySelector('.banner-track');
        this.items = document.querySelectorAll('.banner-item');
        this.indicatorsContainer = document.querySelector('.indicators');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        
        this.currentPosition = 0;
        this.transitionTime = 6000; // 6 GIÂY
        this.slideInterval = null;
        this.isAnimating = false;
        
        this.baseWidth = 550;
        this.baseHeight = 780;
        this.minWidth = 300;
        this.minHeight = 420;
        
        this.init();
        this.updateLayout();
        
        // Debounce resize event
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateLayout();
            }, 100);
        });
    }
    
    calculateBannerSize() {
        const viewport = document.querySelector('.banner-viewport');
        if (!viewport) return { itemsPerView: 1, targetWidth: this.baseWidth, targetHeight: this.baseHeight };
        
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
        if (!viewport) return;
        
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
        
        console.log(`📐 Banner Layout: ${itemsPerView} items, ${targetWidth}x${targetHeight}px`);
    }
    
    updateTrackWidth(itemWidth, spaceBetween) {
        if (!this.track) return;
        
        const totalWidth = (itemWidth + spaceBetween) * this.items.length + spaceBetween;
        this.track.style.width = totalWidth + 'px';
    }
    
    updateLayout() {
        if (!this.track || !this.items.length) return;
        
        const layout = this.calculateBannerSize();
        this.itemsPerView = layout.itemsPerView;
        this.targetWidth = layout.targetWidth;
        this.targetHeight = layout.targetHeight;
        this.totalPositions = this.calculateTotalPositions(this.itemsPerView);
        
        if (this.currentPosition > this.totalPositions) {
            this.currentPosition = this.totalPositions;
        }
        
        console.log(`🔄 Banner: ${this.itemsPerView} items/view, ${this.totalPositions + 1} slides, ${this.targetWidth}x${this.targetHeight}px`);
        
        this.applyLayout(layout);
        this.createIndicators();
        this.updateSlider();
    }
    
    createIndicators() {
        if (!this.indicatorsContainer) return;
        
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
        // Kiểm tra xem các element có tồn tại không
        if (!this.track || !this.items.length || !this.prevBtn || !this.nextBtn) {
            console.error('❌ Banner elements not found');
            return;
        }
        
        console.log('🚀 Initializing Banner Slider...');
        
        this.updateSlider();
        
        // Event listeners với error handling
        this.prevBtn.addEventListener('click', () => {
            console.log('⬅️ Banner Prev clicked');
            this.prevSlide();
        });
        
        this.nextBtn.addEventListener('click', () => {
            console.log('➡️ Banner Next clicked');
            this.nextSlide();
        });
        
        // TỰ ĐỘNG CHẠY NGAY KHI LOAD TRANG
        setTimeout(() => {
            this.startSlideShow();
        }, 100);
        
        const bannerContainer = document.querySelector('.banner-container');
        if (bannerContainer) {
            bannerContainer.addEventListener('mouseenter', () => {
                this.pauseSlideShow();
            });
            
            bannerContainer.addEventListener('mouseleave', () => {
                this.startSlideShow();
            });
        }
        
        console.log('✅ Banner Slider initialized successfully - Auto slide will start immediately');
    }
    
    startSlideShow() {
        this.isPaused = false;

        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
        
        // Chỉ start slideshow nếu có nhiều hơn 1 slide
        if (this.totalPositions > 0) {
            this.slideInterval = setInterval(() => {
                this.nextSlide();
            }, this.transitionTime);
            
            console.log('🚀 Banner Auto Slide Started - 6s interval');
        } else {
            console.log('ℹ️ Banner: Only one slide, auto slide disabled');
        }
    }
    
    pauseSlideShow() {
        this.isPaused = true;
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
            console.log('⏸️ Banner Auto Slide Paused');
        }
    }
    
    nextSlide() {
        if (this.isAnimating || this.totalPositions === 0) return;
        
        this.isAnimating = true;
        
        if (this.currentPosition < this.totalPositions) {
            this.currentPosition++;
        } else {
            this.currentPosition = 0;
        }
        
        this.updateSlider();
        
        // QUAN TRỌNG: Reset isAnimating sau khi animation hoàn thành
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
    }
    
    prevSlide() {
        if (this.isAnimating || this.totalPositions === 0) return;
        
        this.isAnimating = true;
        
        if (this.currentPosition > 0) {
            this.currentPosition--;
        } else {
            this.currentPosition = this.totalPositions;
        }
        
        this.updateSlider();
        
        // QUAN TRỌNG: Reset isAnimating sau khi animation hoàn thành
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
    }
    
    goToPosition(position) {
        if (this.isAnimating || position === this.currentPosition || this.totalPositions === 0) return;
        
        this.isAnimating = true;
        this.currentPosition = position;
        this.updateSlider();
        
        // QUAN TRỌNG: Reset isAnimating sau khi animation hoàn thành
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
    }
    
    updateSlider() {
        if (!this.track || !this.itemsPerView || !this.targetWidth || this.totalPositions === 0) return;
        
        const viewport = document.querySelector('.banner-viewport');
        if (!viewport) return;
        
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
    }
}
// Khởi tạo Sliders với error handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Page loaded - Starting sliders...');
    
    setTimeout(() => {
        window.bannerSlider = new TripleBannerSlider();
        console.log('🎉 Banner started successfully!');
    }, 500);
});
class FoodBannerSlider {
    constructor() {
        this.track = document.getElementById('foodBannerTrack');
        this.indicatorsContainer = document.querySelector('.food-indicators');
        this.prevBtn = document.querySelector('.food-prev-btn');
        this.nextBtn = document.querySelector('.food-next-btn');
        
        this.currentPosition = 0;
        this.transitionTime = 6000; // 6 GIÂY
        this.slideInterval = null;
        this.isAnimating = false;
        
        // Kích thước base cho food items
        this.baseWidth = 340;
        this.baseHeight = 460;
        this.minWidth = 200;
        this.minHeight = 300;
        
        this.foodItems = [
            {
                id: 1,
                name: "SÒ DIỆP NƯỚNG PHÔ MAI",
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 2,
                name: "XÔI GÀ RÔ TI",
                image: "https://images.unsplash.com/photo-1563379091339-03246963d96f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 3,
                name: "BÒ NƯỚNG SỐT TIÊU ĐEN",
                image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 4,
                name: "GÀ NƯỚNG MUỐI ỚT",
                image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 5,
                name: "CÁ HỒI SỐT CAM",
                image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 6,
                name: "TÔM SỐT XOÀI",
                image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            }
        ];
        
        this.init();
    }
    
    renderFoodItems() {
        if (!this.track) {
            console.error('❌ Food banner track not found');
            return;
        }
        
        let html = '';
        this.foodItems.forEach(item => {
            html += `
                <div class="food-banner-item">
                    <div class="food-circle">
                        <div class="food-image" style="background-image: url('${item.image}')"></div>
                        <div class="food-overlay">
                            <i class="fas fa-utensils"></i>
                        </div>
                    </div>
                    <div class="food-name">${item.name}</div>
                </div>
            `;
        });
        
        this.track.innerHTML = html;
        this.items = document.querySelectorAll('.food-banner-item');
        
        console.log(`✅ Rendered ${this.items.length} food items`);
    }
    
    calculateFoodSize() {
        const viewport = document.querySelector('.food-banner-viewport');
        if (!viewport) return { itemsPerView: 1, targetWidth: this.baseWidth, targetHeight: this.baseHeight };
        
        const viewportWidth = viewport.offsetWidth - 40;
        const viewportHeight = viewport.offsetHeight - 40;
        
        let itemsPerView;
        let targetWidth, targetHeight;
        
        if (viewportWidth >= 1400) {
            itemsPerView = 3;
            targetWidth = this.baseWidth;
            targetHeight = this.baseHeight;
        } else if (viewportWidth >= 1200) {
            itemsPerView = 3;
            const scale = Math.min(viewportWidth / (this.baseWidth * 3 + 100), 0.9);
            targetWidth = Math.max(this.baseWidth * scale, this.minWidth);
            targetHeight = Math.max(this.baseHeight * scale, this.minHeight);
        } else if (viewportWidth >= 900) {
            itemsPerView = 2;
            targetWidth = this.baseWidth * 0.9;
            targetHeight = this.baseHeight * 0.9;
        } else if (viewportWidth >= 768) {
            itemsPerView = 2;
            const scale = Math.min(viewportWidth / (this.baseWidth * 2 + 80), 0.8);
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
        const viewport = document.querySelector('.food-banner-viewport');
        if (!viewport) return;
        
        const viewportWidth = viewport.offsetWidth;
        
        // ÁP DỤNG KÍCH THƯỚC ITEMS
        this.items.forEach((item, index) => {
            const foodCircle = item.querySelector('.food-circle');
            const foodName = item.querySelector('.food-name');
            
            item.style.width = targetWidth + 'px';
            item.style.height = targetHeight + 'px';
            item.style.minWidth = targetWidth + 'px';
            item.style.minHeight = targetHeight + 'px';
            item.style.maxWidth = targetWidth + 'px';
            item.style.maxHeight = targetHeight + 'px';
            item.style.flexShrink = '0';
            
            // Tính toán kích thước cho food circle và name dựa trên targetWidth
            const circleSize = Math.round(targetWidth * 0.76); // 76% của item width
            const nameWidth = Math.round(targetWidth * 0.74); // 74% của item width
            const nameHeight = Math.round(targetHeight * 0.17); // 17% của item height
            
            if (foodCircle) {
                foodCircle.style.width = circleSize + 'px';
                foodCircle.style.height = circleSize + 'px';
                foodCircle.style.minWidth = circleSize + 'px';
                foodCircle.style.minHeight = circleSize + 'px';
            }
            
            if (foodName) {
                foodName.style.width = nameWidth + 'px';
                foodName.style.height = nameHeight + 'px';
                foodName.style.minWidth = nameWidth + 'px';
                foodName.style.minHeight = nameHeight + 'px';
                foodName.style.fontSize = Math.max(14, Math.round(targetWidth * 0.044)) + 'px'; // 4.4% của item width
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
        
        console.log(`📐 Food Layout: ${itemsPerView} items, ${targetWidth}x${targetHeight}px`);
    }
    
    updateTrackWidth(itemWidth, spaceBetween) {
        if (!this.track) return;
        
        const totalWidth = (itemWidth + spaceBetween) * this.items.length + spaceBetween;
        this.track.style.width = totalWidth + 'px';
    }
    
    updateLayout() {
        if (!this.track || !this.items.length) return;
        
        const layout = this.calculateFoodSize();
        this.itemsPerView = layout.itemsPerView;
        this.targetWidth = layout.targetWidth;
        this.targetHeight = layout.targetHeight;
        this.totalPositions = this.calculateTotalPositions(this.itemsPerView);
        
        if (this.currentPosition > this.totalPositions) {
            this.currentPosition = this.totalPositions;
        }
        
        console.log(`🔄 Food: ${this.itemsPerView} items/view, ${this.totalPositions + 1} slides, ${this.targetWidth}x${this.targetHeight}px`);
        
        this.applyLayout(layout);
        this.createIndicators();
        this.updateSlider();
    }
    
    createIndicators() {
        if (!this.indicatorsContainer) return;
        
        this.indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i <= this.totalPositions; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'food-indicator';
            if (i === this.currentPosition) {
                indicator.classList.add('active');
            }
            
            indicator.addEventListener('click', () => {
                this.goToPosition(i);
            });
            
            this.indicatorsContainer.appendChild(indicator);
        }
        
        this.indicators = document.querySelectorAll('.food-indicator');
    }
    
    init() {
        // ĐẦU TIÊN: Render food items
        this.renderFoodItems();
        
        // Kiểm tra xem các element có tồn tại không
        if (!this.track || !this.items.length || !this.prevBtn || !this.nextBtn) {
            console.error('❌ Food banner elements not found');
            return;
        }
        
        console.log('🚀 Initializing Food Banner Slider...');
        
        this.updateLayout();
        
        // Event listeners với error handling
        this.prevBtn.addEventListener('click', () => {
            console.log('⬅️ Food Prev clicked');
            this.prevSlide();
        });
        
        this.nextBtn.addEventListener('click', () => {
            console.log('➡️ Food Next clicked');
            this.nextSlide();
        });
        
        // TỰ ĐỘNG CHẠY NGAY KHI LOAD TRANG
        setTimeout(() => {
            this.startSlideShow();
        }, 100);
        
        const foodContainer = document.querySelector('.food-banner-container');
        if (foodContainer) {
            foodContainer.addEventListener('mouseenter', () => {
                this.pauseSlideShow();
            });
            
            foodContainer.addEventListener('mouseleave', () => {
                this.startSlideShow();
            });
        }
        
        // Touch events
        this.setupTouchEvents();
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
        
        // Update on resize với debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateLayout();
            }, 100);
        });
        
        console.log('✅ Food Banner Slider initialized successfully - Auto slide will start immediately');
    }
    
    setupTouchEvents() {
        let startX = 0;
        let endX = 0;
        let isDragging = false;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.pauseSlideShow();
        });
        
        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            endX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const diff = startX - endX;
            const threshold = 50;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            isDragging = false;
            this.startSlideShow();
        });
    }
    
    startSlideShow() {
        this.isPaused = false;

        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
        
        // Chỉ start slideshow nếu có nhiều hơn 1 slide
        if (this.totalPositions > 0) {
            this.slideInterval = setInterval(() => {
                this.nextSlide();
            }, this.transitionTime);
            
            console.log('🚀 Food Auto Slide Started - 6s interval');
        } else {
            console.log('ℹ️ Food: Only one slide, auto slide disabled');
        }
    }
    
    pauseSlideShow() {
        this.isPaused = true;
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
            console.log('⏸️ Food Auto Slide Paused');
        }
    }
    
    nextSlide() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        console.log(`➡️ Food Next: current=${this.currentPosition}, max=${this.totalPositions}`);
        
        if (this.currentPosition < this.totalPositions) {
            this.currentPosition++;
            console.log(`📄 Food Moving to position ${this.currentPosition}`);
        } else {
            // QUAN TRỌNG: Roll về đầu khi hết item
            this.currentPosition = 0;
            console.log('🔄 Food Rolling back to start (position 0)');
        }
        
        this.updateSlider();
        
        // QUAN TRỌNG: Reset isAnimating sau khi animation hoàn thành
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
    }
    
    prevSlide() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        console.log(`⬅️ Food Prev: current=${this.currentPosition}, max=${this.totalPositions}`);
        
        if (this.currentPosition > 0) {
            this.currentPosition--;
            console.log(`📄 Food Moving to position ${this.currentPosition}`);
        } else {
            // QUAN TRỌNG: Roll về cuối khi ở đầu
            this.currentPosition = this.totalPositions;
            console.log(`🔄 Food Rolling to end (position ${this.totalPositions})`);
        }
        
        this.updateSlider();
        
        // QUAN TRỌNG: Reset isAnimating sau khi animation hoàn thành
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
    }
    
    goToPosition(position) {
        if (this.isAnimating || position === this.currentPosition) return;
        
        this.isAnimating = true;
        this.currentPosition = position;
        
        console.log(`🎯 Food Going to position ${position}`);
        
        this.updateSlider();
        
        // QUAN TRỌNG: Reset isAnimating sau khi animation hoàn thành
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
    }
    
    updateSlider() {
        if (!this.track || !this.itemsPerView || !this.targetWidth) return;
        
        const viewport = document.querySelector('.food-banner-viewport');
        if (!viewport) return;
        
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
        this.track.style.transition = this.isAnimating ? 'transform 0.8s ease-in-out' : 'none';
        
        if (this.indicators) {
            this.indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === this.currentPosition);
            });
        }
        
        // Update button states - KHÔNG DISABLE NÚT NEXT
        this.updateButtonStates();
        
        console.log(`🎬 Food Slider updated: position ${this.currentPosition}, translateX ${translateValue}px`);
    }
    
    updateButtonStates() {
        if (this.prevBtn) {
            const isDisabled = this.currentPosition === 0;
            this.prevBtn.disabled = false;
            this.prevBtn.style.opacity = '1';
            this.prevBtn.style.cursor = 'pointer';
            
            if (isDisabled) {
                this.prevBtn.title = 'Đã ở slide đầu tiên';
            } else {
                this.prevBtn.title = 'Slide trước';
            }
        }
        
        if (this.nextBtn) {
            // QUAN TRỌNG: KHÔNG BAO GIỜ DISABLE NÚT NEXT
            // Vì khi ở slide cuối, ấn next sẽ rollback về đầu
            this.nextBtn.disabled = false;
            this.nextBtn.style.opacity = '1';
            this.nextBtn.style.cursor = 'pointer';
            
            if (this.currentPosition === this.totalPositions) {
                this.nextBtn.title = 'Đã ở slide cuối - Ấn để về đầu';
            } else {
                this.nextBtn.title = 'Slide tiếp theo';
            }
        }
        
        console.log(`🔘 Food Button states: prev=${this.currentPosition === 0 ? 'disabled' : 'enabled'}, next=ALWAYS_ENABLED`);
    }
}
// Khởi tạo Food Banner với error handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Page loaded - Starting food banner...');
    
    setTimeout(() => {
        try {
            window.foodBannerSlider = new FoodBannerSlider();
            console.log('🎉 Food Banner started successfully!');
            
            // Debug helper
            console.log('🎮 Food Slider controls:');
            console.log('- Click food-control-btn to navigate');
            console.log('- Auto slide every 6 seconds');
            console.log('- Hover to pause auto slide');
            console.log('- Next button is ALWAYS enabled');
            console.log('- Rollback to start when reaching end');
            
        } catch (error) {
            console.error('❌ Food Banner initialization failed:', error);
        }
    }, 500);
});
















class ProductPagination {
    constructor(products) {
        this.productsContainer = document.getElementById('productsGrid');
        this.paginationControls = document.querySelector('.pagination-controls');
        this.allProducts = Array.from(products);
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        console.log('🔧 Đang khởi tạo pagination với:', this.allProducts.length, 'sản phẩm');
        
        this.totalPages = Math.ceil(this.allProducts.length / this.itemsPerPage);
        console.log(`📊 Tổng sản phẩm: ${this.allProducts.length}, Tổng trang: ${this.totalPages}`);
        
        if (this.allProducts.length <= this.itemsPerPage) {
            this.paginationControls.style.display = 'none';
            console.log('ℹ️ Ẩn pagination - ít sản phẩm');
            this.showAllProducts();
            return;
        }
        
        this.paginationControls.style.display = 'flex';
        this.updatePaginationUI();
        this.setupEventListeners();
        this.showFirstPageImmediately();
    }
    
    showAllProducts() {
        this.allProducts.forEach(product => {
            product.style.display = 'block';
        });
    }
    
    showFirstPageImmediately() {
        console.log('🚀 Hiển thị trang 1 ngay lập tức...');
        
        const startIndex = 0;
        const endIndex = this.itemsPerPage;
        
        this.allProducts.forEach(product => {
            product.style.display = 'none';
        });
        
        this.allProducts.forEach((product, index) => {
            if (index >= startIndex && index < endIndex) {
                product.style.display = 'block';
            }
        });
        
        console.log(`✅ Đã hiển thị trang 1: sản phẩm 1-${Math.min(endIndex, this.allProducts.length)}`);
    }
    
    setupEventListeners() {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        // Clone và replace để tránh duplicate event listeners
        const newPrevBtn = prevBtn.cloneNode(true);
        const newNextBtn = nextBtn.cloneNode(true);
        prevBtn.replaceWith(newPrevBtn);
        nextBtn.replaceWith(newNextBtn);
        
        document.getElementById('prevPage').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('⬅️ Prev button clicked');
            this.previousPage();
        });
        
        document.getElementById('nextPage').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('➡️ Next button clicked');
            this.nextPage();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousPage();
            if (e.key === 'ArrowRight') this.nextPage();
        });
    }
    
    async showPage(page, animate = true) {
        if (this.isAnimating || page === this.currentPage) return;
        
        this.isAnimating = true;
        const oldPage = this.currentPage;
        this.currentPage = page;
        
        const startIndex = (page - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        console.log(`📄 Chuyển trang ${oldPage} → ${page}: sản phẩm ${startIndex + 1}-${Math.min(endIndex, this.allProducts.length)}`);
        
        if (animate && oldPage) {
            await this.smoothPageTransition(oldPage, page);
        } else {
            this.updateProductVisibility(startIndex, endIndex);
        }
        
        this.updatePaginationUI();
        
        // AUTO SCROLL ĐẾN SẢN PHẨM ĐẦU TIÊN CỦA TRANG MỚI
        if (animate) {
            setTimeout(() => {
                this.smoothScrollToFirstProduct();
            }, 400);
        }
        
        this.isAnimating = false;
    }
    
    // PHƯƠNG THỨC SCROLL ĐẾN SẢN PHẨM ĐẦU TIÊN
    smoothScrollToFirstProduct() {
        const firstProductIndex = (this.currentPage - 1) * this.itemsPerPage;
        const firstProduct = this.allProducts[firstProductIndex];
        
        if (firstProduct) {
            // Sử dụng getBoundingClientRect để lấy vị trí chính xác
            const productRect = firstProduct.getBoundingClientRect();
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            const productTop = productRect.top + currentScroll;
            const offset = 120; // Offset để không bị che bởi header
            
            const scrollTarget = Math.max(0, productTop - offset);
            
            console.log(`🎯 Đang scroll đến sản phẩm đầu tiên (index ${firstProductIndex + 1}), vị trí: ${scrollTarget}px`);
            
            window.scrollTo({
                top: scrollTarget,
                behavior: 'auto'
            });
        } else {
            console.warn('⚠️ Không tìm thấy sản phẩm đầu tiên để scroll');
        }
    }
    
    async smoothPageTransition(oldPage, newPage) {
        console.log('🎬 Bắt đầu chuyển cảnh...');
        
        const oldStartIndex = (oldPage - 1) * this.itemsPerPage;
        const oldEndIndex = oldStartIndex + this.itemsPerPage;
        const oldProducts = this.allProducts.slice(oldStartIndex, oldEndIndex);
        
        const newStartIndex = (newPage - 1) * this.itemsPerPage;
        const newEndIndex = newStartIndex + this.itemsPerPage;
        const newProducts = this.allProducts.slice(newStartIndex, newEndIndex);
        
        // Ẩn sản phẩm cũ với hiệu ứng
        oldProducts.forEach((product, index) => {
            product.style.transitionDelay = `${index * 0.08}s`;
            product.classList.add('fade-out');
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        oldProducts.forEach(product => {
            product.style.display = 'none';
            product.classList.remove('fade-out', 'active');
            product.style.transitionDelay = '0s';
        });
        
        // Hiển thị sản phẩm mới với hiệu ứng
        newProducts.forEach(product => {
            product.style.display = 'block';
            product.classList.add('fade-in');
        });
        
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        newProducts.forEach((product, index) => {
            product.style.transitionDelay = `${index * 0.08}s`;
            product.classList.remove('fade-in');
            product.classList.add('active');
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        newProducts.forEach(product => {
            product.style.transitionDelay = '0s';
        });
    }
    
    updateProductVisibility(startIndex, endIndex) {
        this.allProducts.forEach((product, index) => {
            if (index >= startIndex && index < endIndex) {
                product.style.display = 'block';
                product.classList.add('active');
            } else {
                product.style.display = 'none';
                product.classList.remove('active', 'fade-out', 'fade-in');
            }
        });
    }
    
    updatePaginationUI() {
        const currentPageEl = document.getElementById('currentPage');
        const totalPagesEl = document.getElementById('totalPages');
        
        if (currentPageEl) currentPageEl.textContent = this.currentPage;
        if (totalPagesEl) totalPagesEl.textContent = this.totalPages;
        
        this.updateButtonStates();
    }
    
    updateButtonStates() {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (prevBtn) {
            const isDisabled = this.currentPage === 1;
            prevBtn.disabled = isDisabled;
            prevBtn.style.opacity = isDisabled ? '0.5' : '1';
            prevBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
        }
        
        if (nextBtn) {
            const isDisabled = this.currentPage === this.totalPages;
            nextBtn.disabled = isDisabled;
            nextBtn.style.opacity = isDisabled ? '0.5' : '1';
            nextBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
        }
    }
    // PHƯƠNG THỨC SCROLL ĐÃ SỬA - CHẮC CHẮN HOẠT ĐỘNG
smoothScrollToFirstProduct() {
    const firstProductIndex = (this.currentPage - 1) * this.itemsPerPage;
    const firstProduct = this.allProducts[firstProductIndex];
    
    if (firstProduct) {
        console.log('🎯 Tìm thấy sản phẩm đầu tiên, đang scroll...');
        
        // Phương pháp 1: scrollIntoView - đơn giản và hiệu quả nhất
        firstProduct.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
        
        console.log('✅ Đã kích hoạt scrollIntoView');
        
    } else {
        console.warn('⚠️ Không tìm thấy sản phẩm đầu tiên');
        
        // Fallback: Scroll đến filter
        this.smoothScrollToFilter();
    }
}

// PHƯƠNG THỨC SCROLL ĐẾN FILTER - DỰ PHÒNG
    smoothScrollToFilter() {
        const filterRoom = document.querySelector('.filterRoom');
        if (filterRoom) {
            filterRoom.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
            console.log('🎯 Đã scroll đến filter');
            return;
        }
        
        // Fallback cuối cùng: Scroll đến products section
        const productsSection = document.querySelector('.products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
            console.log('🔄 Đã scroll đến products section');
        } else {
            // Fallback cuối cùng
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            console.log('🔄 Scroll về đầu trang');
        }
    }
    nextPage() {
        console.log('➡️ Next page called, current:', this.currentPage, 'total:', this.totalPages);
        if (this.currentPage < this.totalPages) {
            this.showPage(this.currentPage + 1);
        }
    }
    
    previousPage() {
        console.log('⬅️ Previous page called, current:', this.currentPage, 'total:', this.totalPages);
        if (this.currentPage > 1) {
            this.showPage(this.currentPage - 1);
        }
    }
}

// Khởi tạo hệ thống pagination
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded - initializing pagination system...');
    
    const filterSelect = document.querySelector('.filterRoom select');
    let allProducts = document.querySelectorAll('.cyberpunk-card');
    
    // Hàm khởi tạo filter mặc định
    function initializeDefaultFilter() {
        console.log('🎯 Đang khởi tạo mặc định với "Tất cả phòng"...');
        
        if (filterSelect) {
            filterSelect.value = 'Tất cả phòng';
        }
        
        const filteredProducts = Array.from(allProducts).filter(product => {
            return true; // Hiển thị tất cả sản phẩm
        });
        
        console.log('📦 Tổng sản phẩm:', filteredProducts.length);
        
        if (filteredProducts.length > 0) {
            window.productPagination = new ProductPagination(filteredProducts);
            console.log('✅ Pagination khởi tạo thành công');
        } else {
            console.log('ℹ️ Không có sản phẩm để hiển thị');
            const paginationControls = document.querySelector('.pagination-controls');
            if (paginationControls) {
                paginationControls.style.display = 'none';
            }
        }
    }
    
    // Gọi ngay khi load trang
    initializeDefaultFilter();
    
    // Xử lý khi thay đổi filter
    if (filterSelect) {
        filterSelect.addEventListener('change', function(e) {
            const selectedValue = e.target.value;
            console.log('🎯 Filter selected:', selectedValue);
            
            allProducts = document.querySelectorAll('.cyberpunk-card');
            
            // Ẩn tất cả sản phẩm trước
            allProducts.forEach(product => {
                product.style.display = 'none';
            });
            
            // Lọc sản phẩm
            const filteredProducts = Array.from(allProducts).filter(product => {
                const roomType = product.querySelector('.badge-text')?.textContent || '';
                
                if (selectedValue === '' || selectedValue === 'Tất cả phòng') {
                    return true;
                } else {
                    return roomType.includes(selectedValue);
                }
            });
            
            console.log('📦 Filtered products:', filteredProducts.length);
            
            if (filteredProducts.length > 0) {
                window.productPagination = new ProductPagination(filteredProducts);
            } else {
                console.log('ℹ️ Không có sản phẩm phù hợp');
                const paginationControls = document.querySelector('.pagination-controls');
                if (paginationControls) {
                    paginationControls.style.display = 'none';
                }
            }
        });
    }
});