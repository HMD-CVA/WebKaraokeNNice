class TripleBannerSlider {
    constructor() {
        this.track = document.querySelector('.banner-track');
        this.items = document.querySelectorAll('.banner-item');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.progressBar = document.querySelector('.progress');
        
        this.isVertical = false;
        this.currentPosition = 0;
        this.transitionTime = 10000;
        this.slideInterval = null;
        this.progressInterval = null;
        this.isAnimating = false;
        
        this.init();
        this.updateTotalPositions(); // Tính toán ban đầu
        window.addEventListener('resize', () => this.updateTotalPositions()); // Tính toán khi resize
    }
    updateTotalPositions() {
        const screenWidth = window.innerWidth;
        
        if (screenWidth <= 576) {
            // Mobile: 1 banner, 5 slides thực tế
            this.totalPositions = 5; // 5 banner thực + 2 banner loop = 7 items
        } else if (screenWidth <= 992) {
            // Tablet: 1 banner, 5 slides
            this.totalPositions = 5;
        } else if (screenWidth <= 1200) {
            // Tablet lớn: 2 banner, 3 slides (7 items - 2 = 5 positions, nhưng chỉ có 3 slides thực)
            this.totalPositions = 3;
        } else {
            // Desktop: 3 banner, 2 slides (7 items - 3 = 4 positions, nhưng chỉ có 2 slides thực)
            this.totalPositions = 2;
        }
        
        console.log('Screen width:', screenWidth, 'Total positions:', this.totalPositions);
    }
    
    init() {
        this.updateSlider();
        
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const position = parseInt(indicator.getAttribute('data-slide'));
                this.goToPosition(position);
            });
        });
        
        this.startSlideShow();
        
        const bannerContainer = document.querySelector('.banner-container');
        bannerContainer.addEventListener('mouseenter', () => {
            this.pauseSlideShow();
        });
        
        bannerContainer.addEventListener('mouseleave', () => {
            this.startSlideShow();
        });
    }
    checkLayout() {
        // Kiểm tra nếu là mobile và chuyển sang dọc
        this.isVertical = window.innerWidth <= 576;
        this.totalPositions = this.isVertical ? this.items.length - 1 : this.items.length - 3;
        this.updateSlider();
    }
    
    updateSlider() {
        if (this.isVertical) {
        // Chế độ dọc - di chuyển theo chiều dọc
        const translateY = -this.currentPosition * 100;
        this.track.style.transform = `translateY(${translateY}%)`;
    } else {
        // Chế độ ngang - di chuyển theo chiều ngang
        const itemsPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1200 ? 2 : 3;
        const itemWidth = 100 / itemsPerView;
        const translateX = -this.currentPosition * itemWidth;
        this.track.style.transform = `translateX(${translateX}%)`;
    }
        
        // Cập nhật indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentPosition);
        });
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
        
        this.startSlideShow();
    }
    
    init() {
        // Hiển thị ban đầu
        this.updateSlider();
        
        // Thêm sự kiện cho nút điều khiển
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Thêm sự kiện cho indicators
        this.indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const position = parseInt(indicator.getAttribute('data-slide'));
                this.goToPosition(position);
            });
        });
        
        // Bắt đầu trình chiếu tự động
        this.startSlideShow();
        
        // Tạm dừng khi hover, tiếp tục khi rời chuột
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
            this.updateSlider();
        } else {
            // Loop về đầu
            this.currentPosition = 0;
            this.updateSlider();
        }
    }
    
    prevSlide() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        if (this.currentPosition > 0) {
            this.currentPosition--;
            this.updateSlider();
        } else {
            // Loop về cuối
            this.currentPosition = this.totalPositions;
            this.updateSlider();
        }
    }
    
    goToPosition(position) {
        if (this.isAnimating || position === this.currentPosition) return;
        
        this.isAnimating = true;
        this.currentPosition = position;
        this.updateSlider();
    }
    
    updateSlider() {
        const screenWidth = window.innerWidth;
        let translateValue;
        
        if (screenWidth <= 576) {
            // Mobile: 1 banner = 100% mỗi slide
            translateValue = -this.currentPosition * 100;
            this.track.style.transform = `translateX(${translateValue}%)`;
        } else if (screenWidth <= 992) {
            // Tablet: 1 banner = 100% mỗi slide
            translateValue = -this.currentPosition * 100;
            this.track.style.transform = `translateX(${translateValue}%)`;
        } else if (screenWidth <= 1200) {
            // Tablet lớn: 2 banner = 50% mỗi slide
            translateValue = -this.currentPosition * 50;
            this.track.style.transform = `translateX(${translateValue}%)`;
        } else {
            // Desktop: 3 banner = 33.333% mỗi slide
            translateValue = -this.currentPosition * 33.333;
            this.track.style.transform = `translateX(${translateValue}%)`;
        }
        
        // Cập nhật indicators - chỉ hiển thị 5 indicators cho 5 banner thực
        this.indicators.forEach((indicator, index) => {
            if (index === this.currentPosition) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
        
        this.startSlideShow();
    }
    
    updateNavigationButtons() {
        this.prevBtn.style.opacity = '1';
        this.prevBtn.style.cursor = 'pointer';
        this.nextBtn.style.opacity = '1';
        this.nextBtn.style.cursor = 'pointer';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TripleBannerSlider();
});