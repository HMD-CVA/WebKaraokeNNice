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
        
        prevBtn.replaceWith(prevBtn.cloneNode(true));
        nextBtn.replaceWith(nextBtn.cloneNode(true));
        
        document.getElementById('prevPage').addEventListener('click', () => this.previousPage());
        document.getElementById('nextPage').addEventListener('click', () => this.nextPage());
        
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
        
        // THÊM LẠI SCROLL KHI CHUYỂN TRANG
        if (animate) {
            this.smoothScrollToFirstProduct();
        }
        
        this.isAnimating = false;
    }
    
    // THÊM LẠI METHOD SCROLL
    smoothScrollToFirstProduct() {
        const firstProduct = this.allProducts[(this.currentPage - 1) * this.itemsPerPage];
        if (firstProduct) {
            const productTop = firstProduct.getBoundingClientRect().top + window.pageYOffset;
            const offset = 120; // Offset để không bị che bởi header
            
            window.scrollTo({
                top: productTop - offset,
                behavior: 'smooth'
            });
            
            console.log('🎯 Đang scroll đến sản phẩm đầu tiên');
        }
    }
    
    async smoothPageTransition(oldPage, newPage) {
        const oldStartIndex = (oldPage - 1) * this.itemsPerPage;
        const oldEndIndex = oldStartIndex + this.itemsPerPage;
        const oldProducts = this.allProducts.slice(oldStartIndex, oldEndIndex);
        
        const newStartIndex = (newPage - 1) * this.itemsPerPage;
        const newEndIndex = newStartIndex + this.itemsPerPage;
        const newProducts = this.allProducts.slice(newStartIndex, newEndIndex);
        
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
    
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.showPage(this.currentPage + 1);
        }
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.showPage(this.currentPage - 1);
        }
    }
}

// Filter với pagination động
document.addEventListener('DOMContentLoaded', function() {
    const filterSelect = document.querySelector('.filterRoom select');
    const allProducts = document.querySelectorAll('.cyberpunk-card');
    
    // MẶC ĐỊNH: Lọc theo "Tất cả phòng" khi load trang
    function initializeDefaultFilter() {
        console.log('🚀 Đang khởi tạo mặc định với "Tất cả phòng"...');
        
        // Set giá trị select
        if (filterSelect) {
            filterSelect.value = 'Tất cả phòng';
        }
        
        // Lọc và tạo pagination
        const filteredProducts = Array.from(allProducts).filter(product => {
            return true; // Hiển thị tất cả
        });
        
        console.log('📦 Tổng sản phẩm:', filteredProducts.length);
        
        // Tạo pagination mới
        window.productPagination = new ProductPagination(filteredProducts);
    }
    
    // Gọi ngay khi load trang
    initializeDefaultFilter();
    
    // Xử lý khi thay đổi filter
    if (filterSelect) {
        filterSelect.addEventListener('change', function(e) {
            const selectedValue = e.target.value;
            const allProducts = document.querySelectorAll('.cyberpunk-card');
            
            console.log('🎯 Filter selected:', selectedValue);
            
            // Ẩn tất cả sản phẩm trước
            allProducts.forEach(product => {
                product.style.display = 'none';
            });
            
            // Lọc sản phẩm dựa trên loại phòng
            const filteredProducts = Array.from(allProducts).filter(product => {
                const roomType = product.querySelector('.badge-text')?.textContent || '';
                
                if (selectedValue === '' || selectedValue === 'Tất cả phòng') {
                    return true;
                } else {
                    return roomType.includes(selectedValue);
                }
            });
            
            console.log('📦 Filtered products:', filteredProducts.length);
            
            // Tạo pagination mới dựa trên kết quả lọc
            window.productPagination = new ProductPagination(filteredProducts);
        });
    }
});
// Filter với pagination động
document.addEventListener('DOMContentLoaded', function() {
    const filterSelect = document.querySelector('.filterRoom select');
    
    if (!filterSelect) return;
    
    filterSelect.addEventListener('change', function(e) {
        const selectedValue = e.target.value;
        const allProducts = document.querySelectorAll('.cyberpunk-card');
        
        console.log('🎯 Filter selected:', selectedValue);
        
        // Ẩn tất cả sản phẩm trước
        allProducts.forEach(product => {
            product.style.display = 'none';
        });
        
        // Lọc sản phẩm dựa trên loại phòng
        const filteredProducts = Array.from(allProducts).filter(product => {
            const roomType = product.querySelector('.badge-text')?.textContent || '';
            
            if (selectedValue === '' || selectedValue === 'Tất cả phòng') {
                return true; // Hiển thị tất cả
            } else {
                return roomType.includes(selectedValue);
            }
        });
        
        console.log('📦 Filtered products:', filteredProducts.length);
        
        // Tạo pagination mới dựa trên kết quả lọc
        if (window.productPagination) {
            // Xóa pagination cũ
            window.productPagination = null;
        }
        
        // Tạo pagination mới với danh sách đã lọc
        window.productPagination = new ProductPagination(filteredProducts);
    });
});
// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Đang khởi tạo pagination...');
    
    setTimeout(() => {
        try {
            const productsGrid = document.getElementById('productsGrid');
            if (!productsGrid) {
                console.error('❌ Không tìm thấy products grid');
                return;
            }
            
            const products = productsGrid.querySelectorAll('.cyberpunk-card');
            console.log(`📦 Tìm thấy ${products.length} sản phẩm`);
            
            if (products.length > 6) {
                const pagination = new ProductPagination();
                console.log('✅ Pagination khởi tạo thành công');
                window.productPagination = pagination;
            } else {
                console.log('ℹ️ Không cần pagination');
                const paginationControls = document.querySelector('.pagination-controls');
                if (paginationControls) {
                    paginationControls.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('❌ Lỗi khởi tạo pagination:', error);
        }
    }, 100);
});

// Khởi tạo với hiệu ứng
document.addEventListener('DOMContentLoaded', () => {
    const slider = new TripleBannerSlider();
    console.log('🚀 Banner Slider with Bottom 0px loaded!');

    console.log('🚀 Đang khởi tạo pagination với hiệu ứng...');
    
    setTimeout(() => {
        try {
            const productsGrid = document.getElementById('productsGrid');
            if (!productsGrid) {
                console.error('❌ Không tìm thấy products grid');
                return;
            }
            
            const products = productsGrid.querySelectorAll('.cyberpunk-card');
            console.log(`📦 Tìm thấy ${products.length} sản phẩm`);
            
            if (products.length > 6) {
                const pagination = new ProductPagination();
                console.log(`✅ Pagination với hiệu ứng khởi tạo thành công`);
                
                // Expose để debug
                window.productPagination = pagination;
            } else {
                console.log('ℹ️ Không cần pagination - chỉ có', products.length, 'products');
                const paginationControls = document.querySelector('.pagination-controls');
                if (paginationControls) {
                    paginationControls.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('❌ Lỗi khởi tạo pagination:', error);
        }
    }, 100);
});

class FoodBannerSlider {
    constructor() {
        this.track = document.getElementById('foodBannerTrack');
        this.indicatorsContainer = document.querySelector('.food-indicators');
        this.prevBtn = document.querySelector('.food-prev-btn');
        this.nextBtn = document.querySelector('.food-next-btn');
        this.progressBar = document.querySelector('.food-progress');
        
        this.currentPosition = 0;
        this.transitionTime = 7000;
        this.slideInterval = null;
        this.progressInterval = null;
        this.isAnimating = false;
        
        // KÍCH THƯỚC CƠ SỞ CHO TỪNG BREAKPOINT
        this.breakpoints = {
            '1920+': { baseWidth: 420, itemsPerView: 3 },
            '1440-1919': { baseWidth: 400, itemsPerView: 3 },
            '1200-1439': { baseWidth: 360, itemsPerView: 3 },
            '1024-1199': { baseWidth: 320, itemsPerView: 3 },
            '768-1023': { baseWidth: 300, itemsPerView: 2 },
            '600-767': { baseWidth: 280, itemsPerView: 2 },
            '480-599': { baseWidth: 260, itemsPerView: 1 },
            '375-479': { baseWidth: 240, itemsPerView: 1 },
            '320-374': { baseWidth: 220, itemsPerView: 1 },
            '0-319': { baseWidth: 200, itemsPerView: 1 }
        };
        
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
            },
            {
                id: 7,
                name: "LẨU THÁI CHUA CAY",
                image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 8,
                name: "CƠM CHIÊN HẢI SẢN",
                image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 9,
                name: "BÁNH XÈO TÔM NHẢY",
                image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            }
        ];
        
        this.init();
        this.updateLayout();
        
        // DEBOUNCE RESIZE EVENT
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateLayout();
            }, 100);
        });
    }
    
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width >= 1920) return '1920+';
        if (width >= 1440) return '1440-1919';
        if (width >= 1200) return '1200-1439';
        if (width >= 1024) return '1024-1199';
        if (width >= 768) return '768-1023';
        if (width >= 600) return '600-767';
        if (width >= 480) return '480-599';
        if (width >= 375) return '375-479';
        if (width >= 320) return '320-374';
        return '0-319';
    }
    
    calculateFoodSize() {
        const breakpoint = this.getCurrentBreakpoint();
        const config = this.breakpoints[breakpoint];
        const viewport = document.querySelector('.food-banner-viewport');
        
        if (!viewport) return config;
        
        const viewportWidth = viewport.offsetWidth - 40; // Trừ padding
        let targetWidth = config.baseWidth;
        
        // ĐIỀU CHỈNH KÍCH THƯỚC DỰA TRÊN VIEWPORT THỰC TẾ
        if (config.itemsPerView > 1) {
            const totalNeededWidth = config.baseWidth * config.itemsPerView + 60;
            if (viewportWidth < totalNeededWidth) {
                const scale = (viewportWidth - 80) / (config.baseWidth * config.itemsPerView);
                targetWidth = Math.max(config.baseWidth * scale, 200);
            }
        } else {
            // Mobile - chiếm toàn bộ chiều rộng có sẵn
            targetWidth = Math.min(viewportWidth - 20, config.baseWidth);
        }
        
        return {
            itemsPerView: config.itemsPerView,
            targetWidth: Math.round(targetWidth)
        };
    }
    
    renderFoodItems() {
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
    }
    
    calculateTotalPositions(itemsPerView) {
        return Math.max(0, this.items.length - itemsPerView);
    }
    
    applyLayout(layout) {
        const { itemsPerView, targetWidth } = layout;
        const viewport = document.querySelector('.food-banner-viewport');
        if (!viewport) return;
        
        const viewportWidth = viewport.offsetWidth;
        
        console.log(`🎯 Applying layout: ${itemsPerView} items, ${targetWidth}px width, viewport: ${viewportWidth}px`);
        
        // ÁP DỤNG KÍCH THƯỚC ITEMS
        this.items.forEach((item) => {
            item.style.width = targetWidth + 'px';
            item.style.minWidth = targetWidth + 'px';
            item.style.maxWidth = targetWidth + 'px';
            item.style.flexShrink = '0';
        });
        
        // TÍNH TOÁN KHOẢNG CÁCH CHÍNH XÁC
        let spaceBetween;
        if (itemsPerView > 1) {
            const totalItemsWidth = targetWidth * itemsPerView;
            const totalAvailableSpace = viewportWidth - totalItemsWidth;
            spaceBetween = Math.max(20, totalAvailableSpace / (itemsPerView + 1));
            
            this.track.style.gap = `${spaceBetween}px`;
            this.track.style.justifyContent = 'space-evenly';
            this.track.style.paddingLeft = `${spaceBetween}px`;
            this.track.style.paddingRight = `${spaceBetween}px`;
        } else {
            // Mobile - căn giữa
            this.track.style.justifyContent = 'center';
            this.track.style.gap = '0px';
            this.track.style.paddingLeft = '0px';
            this.track.style.paddingRight = '0px';
            spaceBetween = 0;
        }
        
        // CẬP NHẬT CHIỀU RỘNG TRACK
        this.updateTrackWidth(targetWidth, spaceBetween);
    }
    
    updateTrackWidth(itemWidth, spaceBetween) {
        const totalWidth = (itemWidth + spaceBetween) * this.items.length;
        this.track.style.width = totalWidth + 'px';
    }
    
    updateLayout() {
        const layout = this.calculateFoodSize();
        this.itemsPerView = layout.itemsPerView;
        this.targetWidth = layout.targetWidth;
        this.totalPositions = this.calculateTotalPositions(this.itemsPerView);
        
        // ĐẢM BẢO CURRENT POSITION HỢP LỆ
        if (this.currentPosition > this.totalPositions) {
            this.currentPosition = this.totalPositions;
        }
        
        console.log(`🔄 Food Slider: ${this.itemsPerView} items/view, ${this.totalPositions + 1} slides, ${this.targetWidth}px width`);
        
        this.applyLayout(layout);
        this.createIndicators();
        this.updateSlider();
    }
    
    createIndicators() {
        this.indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i <= this.totalPositions; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'food-indicator';
            indicator.setAttribute('data-slide', i);
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
        this.renderFoodItems();
        this.updateSlider();
        
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.startSlideShow();
        
        const bannerContainer = document.querySelector('.food-banner-container');
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
        
        if (this.totalPositions > 0) {
            this.slideInterval = setInterval(() => {
                this.nextSlide();
            }, this.transitionTime);
            
            this.startProgressBar();
        }
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
        if (this.isAnimating || this.totalPositions === 0) return;
        
        this.isAnimating = true;
        
        if (this.currentPosition < this.totalPositions) {
            this.currentPosition++;
        } else {
            this.currentPosition = 0;
        }
        
        this.updateSlider();
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
    }
    
    goToPosition(position) {
        if (this.isAnimating || position === this.currentPosition || this.totalPositions === 0) return;
        
        this.isAnimating = true;
        this.currentPosition = position;
        this.updateSlider();
    }
    
    updateSlider() {
        if (!this.itemsPerView || !this.targetWidth || this.totalPositions === 0) return;
        
        const viewport = document.querySelector('.food-banner-viewport');
        if (!viewport) return;
        
        const viewportWidth = viewport.offsetWidth;
        
        let spaceBetween;
        if (this.itemsPerView > 1) {
            const totalItemsWidth = this.targetWidth * this.itemsPerView;
            const totalAvailableSpace = viewportWidth - totalItemsWidth;
            spaceBetween = Math.max(20, totalAvailableSpace / (this.itemsPerView + 1));
        } else {
            spaceBetween = 0;
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

// Khởi tạo Food Banner Slider
document.addEventListener('DOMContentLoaded', () => {
    const foodSlider = new FoodBannerSlider();
    console.log('🚀 Food Banner Slider với responsive chi tiết đã loaded!');
});