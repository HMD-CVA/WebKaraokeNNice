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
    constructor(foodItems) {
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
        
        this.foodItems = foodItems
        // this.foodItems = [
        //     {
        //         id: 1,
        //         name: "SÒ DIỆP NƯỚNG PHÔ MAI",
        //         image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        //     },
        //     {
        //         id: 2,
        //         name: "XÔI GÀ RÔ TI",
        //         image: "https://images.unsplash.com/photo-1563379091339-03246963d96f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        //     },
        //     {
        //         id: 3,
        //         name: "BÒ NƯỚNG SỐT TIÊU ĐEN",
        //         image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        //     },
        //     {
        //         id: 4,
        //         name: "GÀ NƯỚNG MUỐI ỚT",
        //         image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        //     },
        //     {
        //         id: 5,
        //         name: "CÁ HỒI SỐT CAM",
        //         image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        //     },
        //     {
        //         id: 6,
        //         name: "TÔM SỐT XOÀI",
        //         image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        //     }
        // ];
        
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

    static async create() {
        const loaiHang = 'Đồ ăn'
        const res = await fetch(`/api/mathang?LoaiHang=${loaiHang}`)
        let foodItems = await res.json()

        foodItems = foodItems.map(food => {
            return {
                id: food._id,
                name: food.TenHang,
                image: food.LinkAnh,
            }
        })

        return new FoodBannerSlider(foodItems)
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
    
    setTimeout(async () => {
        try {
            // window.foodBannerSlider = new FoodBannerSlider();
            window.foodBannerSlider = await FoodBannerSlider.create()

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
            this.smoothScrollToFilter();
        }
        
        this.isAnimating = false;
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
        this.renderPageNumbers();
        this.updateButtonStates();
    }
    
    renderPageNumbers() {
        const pageNumbersContainer = document.getElementById('pageNumbers');
        if (!pageNumbersContainer) return;
        
        pageNumbersContainer.innerHTML = '';
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
        
        // Điều chỉnh lại startPage nếu endPage đạt giới hạn
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // Nút trang đầu tiên
        if (startPage > 1) {
            pageNumbersContainer.appendChild(this.createPageButton(1));
            if (startPage > 2) {
                pageNumbersContainer.appendChild(this.createEllipsis());
            }
        }
        
        // Các nút trang chính
        for (let i = startPage; i <= endPage; i++) {
            pageNumbersContainer.appendChild(this.createPageButton(i));
        }
        
        // Nút trang cuối cùng
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                pageNumbersContainer.appendChild(this.createEllipsis());
            }
            pageNumbersContainer.appendChild(this.createPageButton(this.totalPages));
        }
    }
    
    createPageButton(pageNum) {
        const button = document.createElement('button');
        button.className = 'page-number-btn';
        button.textContent = pageNum;
        button.dataset.page = pageNum;
        
        if (pageNum === this.currentPage) {
            button.classList.add('active');
        }
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🔢 Đã click vào trang ${pageNum}`);
            this.showPage(pageNum, true);
        });
        
        return button;
    }
    
    createEllipsis() {
        const span = document.createElement('span');
        span.className = 'page-ellipsis';
        span.textContent = '...';
        return span;
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
    
    smoothScrollToFilter() {
        const filterRoom = document.querySelector('.filterRoom');
        if (filterRoom) {
            filterRoom.style.scrollMarginTop = '150px';

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



// ===== MODAL ĐẶT PHÒNG =====
class BookingModal {
    constructor() {
        this.modal = document.getElementById('bookingModal');
        this.closeBtn = this.modal?.querySelector('.close-btn');
        this.cancelBtn = this.modal?.querySelector('.btn-secondary');
        this.form = document.getElementById('bookingForm');
        this.currentRoom = null;
        this.hourlyPrice = 0;
        this._originalSubmitState = null;

        this.currentRoomPriceTable = null; // Lưu bảng giá phòng
        this.calculatedPrice = 0; // Giá đã tính toán

        this.lastValidDateTime = null;
        this.isDateTimeValid = true;
        
        if (!this.modal) {
            console.error('Không tìm thấy modal booking');
            return;
        }
        
        this.init();
    }
    
    init() {
        // Đóng modal khi click X
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        // Đóng modal khi click nút Hủy
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.close());
        }
        
        // Đóng modal khi click bên ngoài
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Xử lý submit form
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        
        // Khởi tạo dịch vụ
        this.bindDateTimeEvents();
        this.initServices();
    }

    bindDateTimeEvents() {
        const bookingDate = document.getElementById('bookingDate');
        const bookingTime = document.getElementById('bookingTime');

        if (bookingDate && bookingTime) {
            // Lưu giá trị ban đầu
            bookingDate.addEventListener('focus', () => {
                this.lastValidDateTime = {
                    date: bookingDate.value,
                    time: bookingTime.value
                };
            });

            bookingTime.addEventListener('focus', () => {
                this.lastValidDateTime = {
                    date: bookingDate.value,
                    time: bookingTime.value
                };
            });

            // Khi thay đổi, tính toán giá
            bookingDate.addEventListener('change', () => this.calculateRoomPrice());
            bookingTime.addEventListener('change', () => this.calculateRoomPrice());
        }
    }

    async loadRoomPriceTable(maPhong) {
        try {
            console.log(`📊 Đang tải bảng giá cho phòng: ${maPhong}`);
            
            const response = await fetch(`/api/hoadon/banggia/${maPhong}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📦 Kết quả API bảng giá RAW:', result);
            let priceData = null;

            if (Array.isArray(result)) {
                // TRƯỜNG HỢP API TRẢ VỀ MẢNG TRỰC TIẾP
                priceData = result;
                console.log('✅ Định dạng: Array trực tiếp - ĐÃ FIX');
            } else if (result.success && result.data) {
                // TRƯỜNG HỢP CÓ success và data
                priceData = result.data;
                console.log('✅ Định dạng: { success: true, data: array }');
            } else {
                console.warn('❌ Định dạng response không xác định:', result);
                throw new Error('Định dạng response không hợp lệ');
            }

            // KIỂM TRA DỮ LIỆU
            if (!priceData || !Array.isArray(priceData)) {
                throw new Error('Dữ liệu bảng giá không hợp lệ');
            }

            if (priceData.length === 0) {
                console.warn('⚠️ Bảng giá trả về mảng rỗng');
                // KHÔNG throw error, chỉ cảnh báo
            }

            // CHUẨN HÓA DỮ LIỆU
            const validatedData = this.validatePriceData(priceData);
            console.log(`✅ Đã tải ${validatedData.length} mục giá:`, validatedData);

            this.currentRoomPriceTable = validatedData;
            return validatedData;


        } catch (error) {
            console.error('❌ Lỗi khi tải bảng giá:', error);
            this.currentRoomPriceTable = null;
            
            // Fallback: sử dụng giá cơ bản từ roomData
            this.showError('Không thể tải bảng giá', 'Sử dụng giá cơ bản của phòng');
        }
    }

    validatePriceData(priceData) {
    return priceData.map((item, index) => {
            // Đảm bảo có KhungGio và GiaTien với đúng tên thuộc tính
            const khungGio = item.KhungGio || item.khungGio || item.timeSlot || `08:00-12:00`;
            const giaTien = item.GiaTien || item.giaTien || item.price || 100000;
            
            console.log(`🔍 Item ${index}:`, { khungGio, giaTien, original: item });
            
            return {
                KhungGio: khungGio,
                GiaTien: parseInt(giaTien),
                // Giữ các thuộc tính khác nếu có
                ...item
            };
        }).filter(item => item.KhungGio && item.GiaTien); // Lọc các item hợp lệ
    }

    calculateRoomPriceByTime(thoiGianBatDau, bangGia) {
        if (!thoiGianBatDau || !bangGia || !Array.isArray(bangGia)) {
            console.warn('❌ Không có thời gian bắt đầu hoặc bảng giá');
            return { price: 0, isValid: false };
        }

        const thoiGian = new Date(thoiGianBatDau);
        const gioHienTai = thoiGian.getHours();
        const phutHienTai = thoiGian.getMinutes();
        const thoiGianHienTai = gioHienTai * 60 + phutHienTai;

        console.log(`🕒 Thời gian bắt đầu: ${gioHienTai}:${phutHienTai.toString().padStart(2, '0')}`);
        console.log(`📊 Số khung giờ trong bảng giá: ${bangGia.length}`);

        let foundPrice = 0;
        let foundTimeSlot = '';
        let hasValidTimeSlot = false;

        for (const gia of bangGia) {
            if (!gia.KhungGio) continue;

            const [batDauStr, ketThucStr] = gia.KhungGio.split('-');
            if (!batDauStr || !ketThucStr) continue;

            const [gioBatDau, phutBatDau] = batDauStr.split(':').map(Number);
            const [gioKetThuc, phutKetThuc] = ketThucStr.split(':').map(Number);
            
            let thoiGianBatDauPhut = gioBatDau * 60 + phutBatDau;
            let thoiGianKetThucPhut = gioKetThuc * 60 + phutKetThuc;

            console.log(`⏰ Kiểm tra khung giờ: ${gia.KhungGio}, Giá: ${gia.GiaTien}`);

            let isMatch = false;
            const isQuaNgay = thoiGianBatDauPhut >= thoiGianKetThucPhut;

            if (isQuaNgay) {
                thoiGianKetThucPhut += 1440;
                
                const thoiGianHienTaiExtended = thoiGianHienTai < thoiGianBatDauPhut 
                    ? thoiGianHienTai + 1440 
                    : thoiGianHienTai;
                
                isMatch = (thoiGianHienTaiExtended >= thoiGianBatDauPhut && 
                          thoiGianHienTaiExtended < thoiGianKetThucPhut);
                
            } else {
                isMatch = (thoiGianHienTai >= thoiGianBatDauPhut && 
                          thoiGianHienTai < thoiGianKetThucPhut);
            }

            console.log(`   Kết quả: ${isMatch ? '✅ PHÙ HỢP' : '❌ KHÔNG PHÙ HỢP'}`);

            if (isMatch) {
                foundPrice = gia.GiaTien || 0;
                foundTimeSlot = gia.KhungGio;
                hasValidTimeSlot = true;
                break;
            }
        }

        // XỬ LÝ KHI KHÔNG TÌM THẤY KHUNG GIỜ PHÙ HỢP
        if (!hasValidTimeSlot) {
            console.warn('❌ Không tìm thấy khung giờ phù hợp');
            
            const khungGioList = bangGia
                .filter(gia => gia.KhungGio)
                .map(gia => {
                    const [batDau, ketThuc] = gia.KhungGio.split('-');
                    const [gioBatDau, phutBatDau] = batDau.split(':').map(Number);
                    const [gioKetThuc, phutKetThuc] = ketThuc.split(':').map(Number);
                    const thoiGianBatDauPhut = gioBatDau * 60 + phutBatDau;
                    const thoiGianKetThucPhut = gioKetThuc * 60 + phutKetThuc;
                    const isQuaNgay = thoiGianBatDauPhut >= thoiGianKetThucPhut;
                    
                    if (isQuaNgay) {
                        return `${gia.KhungGio} (qua ngày) - ${this.formatNumber(gia.GiaTien)} VND`;
                    }
                    return `${gia.KhungGio} - ${this.formatNumber(gia.GiaTien)} VND`;
                })
                .filter(Boolean)
                .join('<br>');

            // TRẢ VỀ THÔNG TIN KHÔNG HỢP LỆ
            return {
                price: 0,
                isValid: false,
                message: `Thời gian <strong>${this.formatTimeForDisplay(gioHienTai, phutHienTai)}</strong> không nằm trong khung giờ phục vụ.`,
                availableSlots: khungGioList
            };
        }

        console.log(`💰 Áp dụng khung giờ: ${foundTimeSlot}, Giá: ${this.formatNumber(foundPrice)} VND`);
        return {
            price: foundPrice,
            isValid: true,
            timeSlot: foundTimeSlot
        };
    }

    // THÊM PHƯƠNG THỨC MỚI: Tính toán giá phòng
    async calculateRoomPrice() {
        const bookingDate = document.getElementById('bookingDate');
        const bookingTime = document.getElementById('bookingTime');

        if (!bookingDate || !bookingTime || !bookingDate.value || !bookingTime.value) {
            this.updateCalculatedPrice(0);
            return;
        }

        // Tạo datetime string
        const thoiGianBatDau = `${bookingDate.value}T${bookingTime.value}`;
        
        console.log('🕒 Tính giá cho thời gian:', thoiGianBatDau);

        let calculatedPrice = 0;
        let isValidTime = true;
        let alertMessage = '';
        let availableSlots = '';

        // Tính toán giá nếu có bảng giá
        if (this.currentRoomPriceTable && Array.isArray(this.currentRoomPriceTable)) {
            const result = this.calculateRoomPriceByTime(thoiGianBatDau, this.currentRoomPriceTable);
            calculatedPrice = result.price;
            isValidTime = result.isValid;
            alertMessage = result.message;
            availableSlots = result.availableSlots;

            if (!isValidTime) {
                // HIỂN THỊ CẢNH BÁO VÀ RESET VỀ THỜI GIAN TRƯỚC ĐÓ
                this.showTimeSlotAlert(alertMessage, availableSlots);
                this.resetToLastValidDateTime();
                return;
            }
        } else {
            // Fallback: sử dụng giá cơ bản
            calculatedPrice = this.hourlyPrice;
            console.warn('⚠️ Sử dụng giá cơ bản vì không có bảng giá');
        }

        // Nếu thời gian hợp lệ, cập nhật giá và lưu thời gian hiện tại
        if (isValidTime && calculatedPrice > 0) {
            this.calculatedPrice = calculatedPrice;
            this.updateCalculatedPrice(calculatedPrice);
            this.lastValidDateTime = {
                date: bookingDate.value,
                time: bookingTime.value
            };
            this.isDateTimeValid = true;
        }
    }

    // THÊM PHƯƠNG THỨC MỚI: Reset về thời gian trước đó
    resetToLastValidDateTime() {
        const bookingDate = document.getElementById('bookingDate');
        const bookingTime = document.getElementById('bookingTime');
        
        if (this.lastValidDateTime) {
            bookingDate.value = this.lastValidDateTime.date;
            bookingTime.value = this.lastValidDateTime.time;
            console.log('🔄 Đã reset về thời gian trước đó:', this.lastValidDateTime);
        } else {
            // Nếu không có thời gian trước đó, reset về rỗng
            bookingDate.value = '';
            bookingTime.value = '';
            console.log('🔄 Đã reset về thời gian rỗng');
        }
        
        // Reset giá hiển thị
        this.updateCalculatedPrice(0);
        this.isDateTimeValid = false;
    }

    // THÊM PHƯƠNG THỨC MỚI: Hiển thị cảnh báo khung giờ
    showTimeSlotAlert(message, availableSlots) {
        Swal.fire({
            icon: 'warning',
            title: 'Ngoài thời gian phục vụ',
            html: `${message}<br><br>
                  <strong>Các khung giờ hiện có:</strong><br>
                  ${availableSlots}<br><br>
                  Thời gian đã được reset về giá trị trước đó.`,
            confirmButtonText: 'Đã hiểu',
            confirmButtonColor: '#667eea',
            width: '600px'
        });
    }

    // THÊM PHƯƠNG THỨC MỚI: Format number (quan trọng!)
    formatNumber(amount) {
        if (typeof amount === 'string') {
            amount = parseFloat(amount.replace(/[^\d]/g, '')) || 0;
        }
        return new Intl.NumberFormat('vi-VN').format(amount);
    }

    // THÊM PHƯƠNG THỨC MỚI: Format time
    formatTimeForDisplay(hours, minutes) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // THÊM PHƯƠNG THỨC MỚI: Cập nhật hiển thị giá
    updateCalculatedPrice(price) {
        const calculatedPriceElement = document.getElementById('calculatedRoomPrice');
        if (calculatedPriceElement) {
            calculatedPriceElement.textContent = `${this.formatNumber(price)} VND`;
            
            // Thêm hiệu ứng khi giá thay đổi
            if (price > 0) {
                calculatedPriceElement.style.color = 'var(--cyber-yellow)';
                calculatedPriceElement.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    calculatedPriceElement.style.transform = 'scale(1)';
                }, 300);
            }
        }
    }

    // THÊM PHƯƠNG THỨC MỚI: Format thời gian hiển thị
    formatTimeForDisplay(hours, minutes) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    setMinDateTime() {
        const now = new Date();
        const startTime = document.getElementById('startTime');
        const endTime = document.getElementById('endTime');
        
        if (startTime && endTime) {
            const minDateTime = now.toISOString().slice(0, 16);
            startTime.min = minDateTime;
            endTime.min = minDateTime;
        }
    }
    
    extractPrice(priceString) {
        if (!priceString) return 0;
        const numericString = priceString.replace(/[^\d,]/g, '').replace(',', '');
        return parseInt(numericString) || 0;
    }
    
    async open(roomData = {}) {
        console.log('🎯 Opening modal với roomData:', roomData);
        this.currentRoom = roomData;
        this.fillRoomInfo(roomData);
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Reset form và các biến
        if (this.form) {
            this.form.reset();
            this.setMinDateTime();
        }

        // Ẩn field tên và email của khách hàng
        const fieldName = document.querySelector('#customerName').closest('.input-field')
        const fieldEmail = document.querySelector('#customerEmail').closest('.input-field')
        if(fieldName) fieldName.classList.add('d-none')
        if(fieldEmail) fieldEmail.classList.add('d-none')

        // RESET CÁC BIẾN THỜI GIAN
        this.lastValidDateTime = null;
        this.isDateTimeValid = false;
        this.calculatedPrice = 0;
        this.updateCalculatedPrice(0);

        // Load bảng giá phòng
        const maPhong = roomData.roomID || roomData.MaPhong;
        console.log('🔍 Mã phòng để tải bảng giá:', maPhong);
        
        if (maPhong) {
            try {
                console.log('🚀 Bắt đầu tải bảng giá...');
                await this.loadRoomPriceTable(maPhong);
                console.log('✅ Đã tải xong bảng giá, sẵn sàng tính toán');
            } catch (error) {
                console.error('❌ Lỗi trong quá trình tải bảng giá:', error);
            }
        } else {
            console.error('❌ Không có mã phòng để tải bảng giá');
        }
    }
    
    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentRoom = null;
        this.hourlyPrice = 0;
        this._originalSubmitState = null;
    }
    
    // THÊM PHƯƠNG THỨC MỚI ĐỂ XỬ LÝ CAPACITY - CHỈ LẤY SỐ
    extractMaxCapacity(capacityText) {
        if (!capacityText) return 0;
        
        // Xử lý các định dạng khác nhau của capacity
        const text = capacityText.toString().trim();
        
        console.log(`🔍 Original capacity text: "${text}"`);
        
        // Loại bỏ tất cả chữ cái và khoảng trắng, chỉ giữ lại số và dấu -
        const cleanedText = text.replace(/[^\d\-]/g, '');
        console.log(`🔍 After removing non-numeric: "${cleanedText}"`);
        
        // Tách các số
        const numbers = cleanedText.match(/\d+/g);
        console.log(`🔍 Extracted numbers:`, numbers);
        
        if (numbers && numbers.length > 0) {
            // Lấy số lớn nhất (ví dụ: "6-8" -> lấy 8, "10" -> lấy 10)
            const maxCapacity = Math.max(...numbers.map(Number));
            console.log(`🔍 Max capacity: ${maxCapacity}`);
            return maxCapacity;
        }
        
        console.log(`🔍 Using default capacity: 8`);
        return 0; // Mặc định
    }

    fillRoomInfo(roomData) {
        const roomImage = document.getElementById('modalRoomImage');
        const roomName = document.getElementById('modalRoomName');
        const roomType = document.getElementById('modalRoomType');
        const roomPrice = document.getElementById('modalRoomPrice');
        const roomCapacity = document.getElementById('modalRoomCapacity');
        const hourlyRate = document.getElementById('hourlyRate');
        const roomID = document.getElementById('modalRoomID');
        const maxCapacityHint = document.getElementById('maxCapacityHint');

        if (roomImage) roomImage.src = roomData.image || '/image/default-room.jpg';
        if (roomName) roomName.textContent = roomData.name || 'Phòng Karaoke';
        if (roomType) roomType.textContent = roomData.type || 'VIP';

        if (roomID) {
            const maPhong = roomData.roomID;
            console.log('🎯 Setting room ID to:', maPhong); // DEBUG
            roomID.textContent = `Mã: ${maPhong}`;
        }
        
        const priceText = roomData.price || '500,000 VNĐ/H';
        if (roomPrice) roomPrice.textContent = priceText;
        
        this.hourlyPrice = this.extractPrice(priceText);
        
        if (hourlyRate) {
            hourlyRate.textContent = `${this.hourlyPrice.toLocaleString('vi-VN')} VNĐ`;
        }

        const capacityText = this.extractMaxCapacity(roomData.capacity);
        
        if (roomCapacity) roomCapacity.textContent = capacityText;
        if (maxCapacityHint) maxCapacityHint.textContent = capacityText;
    }
    
    initCalculation() {
        const startTime = document.getElementById('startTime');
        const endTime = document.getElementById('endTime');
        
        if (startTime && endTime) {
            startTime.addEventListener('change', () => this.calculateCost());
            endTime.addEventListener('change', () => this.calculateCost());
        }
    }
    
    initServices() {
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.service-toggle')) {
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        });
        
        document.querySelectorAll('input[name="services"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.calculateCost();
                const serviceCard = checkbox.closest('.service-card');
                if (serviceCard) {
                    serviceCard.classList.toggle('active', checkbox.checked);
                }
            });
        });
    }
    
    initCharCounter() {
        const bookingNote = document.getElementById('bookingNote');
        const charCount = document.getElementById('charCount');
        
        if (bookingNote && charCount) {
            bookingNote.addEventListener('input', function() {
                charCount.textContent = this.value.length;
            });
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        console.log('Form submitted - Gửi dữ liệu đặt phòng');

        if (!this.validateForm()) {
            return;
        }

        // THÊM CONFIRMATION - ĐÂY LÀ PHẦN QUAN TRỌNG
        try {
            const result = await Swal.fire({
                title: 'Xác nhận đặt phòng?',
                html: `Bạn có chắc chắn muốn đặt phòng <strong>${this.currentRoom?.name || 'karaoke'}</strong>?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Đặt ngay',
                cancelButtonText: 'Hủy bỏ',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                reverseButtons: true,
                width: '500px'
            });

            // Nếu người dùng không xác nhận, dừng lại
            if (!result.isConfirmed) {
                console.log('User cancelled booking');
                return;
            }

            // Tiếp tục xử lý đặt phòng
            const formData = this.collectFormData();
            this.showLoading();

            const bookingResult = await this.sendBookingData(formData);
            
            this.hideLoading();
            this.close();
            
            // Hiển thị thông báo và chờ người dùng bấm OK
            await this.showSuccess(
                'Đặt phòng thành công!', 
                'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
                bookingResult.data
            );
            
            // Reload trang sau khi người dùng bấm OK
            location.reload();
            
        } catch (error) {
            this.hideLoading();
            console.error('Booking error:', error);
            this.showError(
                'Đặt phòng thất bại', 
                'Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại sau.'
            );
        }
    }

    validateForm() {
        const requiredFields = [
            { id: 'customerName', name: 'Họ và tên' },
            { id: 'customerPhone', name: 'Số điện thoại' },
            { id: 'bookingDate', name: 'Ngày đặt' },
            { id: 'bookingTime', name: 'Thời gian đặt' }
        ];

        for (let field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                this.showError('Thiếu thông tin', `Vui lòng nhập ${field.name.toLowerCase()}`);
                element?.focus();
                return false;
            }
        }

        const phone = document.getElementById('customerPhone').value;
        const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(phone)) {
            this.showError('Số điện thoại không hợp lệ', 'Vui lòng nhập số điện thoại hợp lệ');
            return false;
        }

        // Kiểm tra số người
        const numberOfPeople = parseInt(document.getElementById('numberOfPeople').value);
        const maxCapacityHint = document.getElementById('maxCapacityHint');
        const maxCapacity = maxCapacityHint ? parseInt(maxCapacityHint.textContent) : 8;
        
        if (numberOfPeople < 1) {
            this.showError('Số người không hợp lệ', 'Số người phải lớn hơn 0');
            return false;
        }
        
        if (numberOfPeople > maxCapacity) {
            this.showError('Số người vượt quá giới hạn', `Phòng này chỉ cho phép tối đa ${maxCapacity} người`);
            return false;
        }

        return true;
    }

    collectFormData() {
        const formData = new FormData(this.form);

        const bookingDate = formData.get('bookingDate');
        const bookingTime = formData.get('bookingTime');
        const bookingPeople = formData.get('numberOfPeople');

        const startTime = new Date(`${bookingDate}T${bookingTime}`);
        const endTime = null;

        const maDatPhong = `DP${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
        const maKH = `KH${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

        const giaTienSuDung = this.calculatedPrice > 0 ? this.calculatedPrice : this.hourlyPrice;

        return {
            maKH: maKH,
            tenKH: formData.get('customerName'),
            sdt: formData.get('customerPhone'),
            email: formData.get('customerEmail') || '',

            maDatPhong: maDatPhong,
            maPhong: this.currentRoom?.roomID || this.currentRoom?.MaPhong || this.currentRoom?.id || '001',
            tenPhong: this.currentRoom?.name || 'Phòng Karaoke',
            giaTien: giaTienSuDung,
            loaiPhong: this.currentRoom?.type || 'VIP',

            thoiGianBatDau: startTime,
            thoiGianKetThuc: endTime,
            songuoi: bookingPeople,

            ghiChu: this.generateNote(formData),
            trangThai: 'Đã đặt'
        };
    }

    generateNote(formData) {
        let note = formData.get('bookingNote') || '';
        const services = formData.getAll('services');
        
        if (services.length > 0) {
            const serviceNames = {
                'food': 'Set đồ ăn VIP',
                'drink': 'Combo nước giải khát', 
                'decor': 'Trang trí đặc biệt',
                'photo': 'Chụp ảnh kỷ niệm'
            };
            
            const selectedServices = services.map(service => serviceNames[service]).join(', ');
            note += (note ? '\n' : '') + `Dịch vụ thêm: ${selectedServices}`;
        }
        
        return note;
    }

    async sendBookingData(bookingData) {
        const API_URL = '/api/datphong';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Đặt phòng thất bại');
            }

            return result;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    showLoading() {
        const submitBtn = document.getElementById('submitBookingBtn');
        
        if (!submitBtn) {
            console.error('Không tìm thấy nút submit với ID submitBookingBtn');
            return;
        }
        
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang xử lý...</span>
        `;
        submitBtn.disabled = true;

        this._originalSubmitState = { btn: submitBtn, html: originalText };
    }

    hideLoading() {
        if (this._originalSubmitState && this._originalSubmitState.btn) {
            this._originalSubmitState.btn.innerHTML = this._originalSubmitState.html;
            this._originalSubmitState.btn.disabled = false;
            this._originalSubmitState = null;
        }
    }

    showSuccess(title, message, bookingData = null) {
        let html = `
            <div class="text-center">
                <div class="mb-4">
                    <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
                </div>
                <h4 class="mb-3">${title}</h4>
                <p class="mb-4">${message}</p>
        `;

        if (bookingData) {
            html += `
                <div class="booking-summary p-3 bg-light rounded text-start">
                    <h6 class="mb-3">Thông tin đặt phòng:</h6>
                    <p><strong>Mã đặt phòng:</strong> ${bookingData.maDatPhong}</p>
                    <p><strong>Tên khách hàng:</strong> ${bookingData.tenKH}</p>
                    <p><strong>Số điện thoại:</strong> ${bookingData.sdt}</p>
                    <p><strong>Phòng:</strong> ${bookingData.tenPhong}</p>
                    <p><strong>Thời gian:</strong> ${new Date(bookingData.thoiGianBatDau).toLocaleString('vi-VN')}</p>
                    <p><strong>Số người:</strong> ${bookingData.songuoi}</p>
                    <p><strong>Trạng thái:</strong> <span class="text-warning">Đã đặt thành công</span></p>
                </div>
            `;
        }

        html += `</div>`;

        return Swal.fire({
            title: '',
            html: html,
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
            width: '500px',
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
                popup: 'booking-success-popup'
            }
        });
    }

    showError(title, message) {
        Swal.fire({
            title: title,
            text: message,
            icon: 'error',
            confirmButtonText: 'Đóng',
            confirmButtonColor: '#d33',
            width: '400px'
        });
    }

    // Debouncing
    debounce(func, delay) {
        let timerId
        return function () {
            clearTimeout(timerId)
            timerId = setTimeout(() => func.apply(this, arguments), delay)
        }
    }

    async getInforByPhone(phone) {
        try {
            const res = await fetch(`/api/khachhang?phone=${phone}`)
            const khachHang = await res.json()
            const inputName = document.querySelector('#customerName')
            const inputEmail = document.querySelector('#customerEmail')

            if(khachHang && inputName && inputEmail) {
                inputName.value = khachHang.TenKH
                inputEmail.value = khachHang.Email
            }
            else{
                inputName.value = ''
                inputEmail.value = ''
            }
        } catch (error) {
            console.log({info: 'Lỗi khi lấy thông tin khách hàng', message: error.message});
        }
    }
}

// Khởi tạo modal khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing booking modal');
    
    // Khởi tạo modal
    window.bookingModal = new BookingModal();
    
    // Xử lý click nút "ĐẶT NGAY"
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-book')) {
            const button = e.target.closest('.btn-book');
            const card = button.closest('.cyberpunk-card');
            
            if (card) {
                // Lấy thông tin phòng từ card
                const roomData = {
                    roomID: card.dataset.phongId || '001',
                    id: card.dataset.phongId || '001',
                    name: card.querySelector('.room-name')?.textContent || 'Phòng Karaoke',
                    type: card.querySelector('.badge-text')?.textContent || 'Phòng VIP',
                    price: card.querySelector('.room-info .info-item:nth-child(2) span')?.textContent || '500,000 VNĐ/giờ',
                    capacity: card.querySelector('.room-info .info-item:nth-child(1) span')?.textContent || '6-8 người',
                    image: card.querySelector('.image-container img')?.src || '/image/default-room.jpg'
                };
                
                console.log('Room data:', roomData);
                
                // Mở modal
                if (window.bookingModal) {
                    window.bookingModal.open(roomData);
                } else {
                    console.error('Booking modal not initialized');
                    // Fallback: hiển thị thông báo
                    alert('Hệ thống đặt phòng đang tải. Vui lòng thử lại sau.');
                }
            }
        }
    });

    // Xử lý lấy thông tin khách hàng khi nhập xong số điện thoại
    document.addEventListener('keyup', (e) => {
        if(e.target.closest('#customerPhone')) {
            const phone = document.querySelector('#customerPhone').value.trim()
            const fieldName = document.querySelector('#customerName').closest('.input-field')
            const fieldEmail = document.querySelector('#customerEmail').closest('.input-field')

            if(phone.length < 10) {
                fieldName.classList.add('d-none')
                fieldEmail.classList.add('d-none')
                return
            }

            fieldName.classList.remove('d-none')
            fieldEmail.classList.remove('d-none')

            if(phone.length === 10) {
                const getInforByPhone = window.bookingModal.getInforByPhone
                const delay = 500
                const debouncedHandler = window.bookingModal.debounce(getInforByPhone, delay)
                debouncedHandler(phone)
            }
        }
    })
    
    // TEST: Log để kiểm tra
    console.log('Booking modal handlers initialized');
});

// Hàm để mở modal từ bất kỳ đâu
function showBookingModal(roomData = {}) {
    if (window.bookingModal) {
        window.bookingModal.open(roomData);
    } else {
        console.error('Booking modal chưa được khởi tạo');
    }
}


