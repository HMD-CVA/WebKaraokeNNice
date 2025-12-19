// Xử lý active state và mobile menu
document.addEventListener('DOMContentLoaded', function() {
    // Lấy tất cả nav-links (cả desktop và mobile)
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Hàm set active state dựa trên URL hiện tại
    function setActiveLink() {
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            
            // Xóa active khỏi tất cả
            link.classList.remove('active');
            
            // Bỏ qua các link có hash trong href (như /#rooms-section)
            // Những link này chỉ để scroll, không phải trang riêng
            if (linkHref && linkHref.includes('#')) {
                return; // Không set active cho link này
            }
            
            // Lấy path từ link
            const linkUrl = new URL(link.href);
            const linkPath = linkUrl.pathname;
            
            // Set active cho link có path khớp với current path
            if (linkPath === currentPath) {
                link.classList.add('active');
            }
        });
    }
    
    // Set active link khi trang load
    setActiveLink();
    
    // Xử lý click trên nav-links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const clickedHref = this.getAttribute('href');
            
            // Nếu click vào link có hash (như /#rooms-section)
            if (clickedHref && clickedHref.includes('#') && !clickedHref.startsWith('#')) {
                // Link dạng /#rooms-section - chỉ set active cho TRANG CHỦ
                navLinks.forEach(item => item.classList.remove('active'));
                
                // Set active cho link TRANG CHỦ
                navLinks.forEach(item => {
                    if (item.getAttribute('href') === '/') {
                        item.classList.add('active');
                    }
                });
            } else {
                // Link thông thường - update active state bình thường
                navLinks.forEach(item => item.classList.remove('active'));
                
                // Tìm link tương ứng ở menu kia và cũng set active
                navLinks.forEach(item => {
                    if (item.getAttribute('href') === clickedHref) {
                        item.classList.add('active');
                    }
                });
            }
            
            // Đóng offcanvas menu trên mobile sau khi click
            const offcanvas = document.getElementById('offcanvasNavbar');
            if (offcanvas && window.innerWidth < 992) {
                try {
                    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
                    if (bsOffcanvas) {
                        bsOffcanvas.hide();
                    }
                } catch (error) {
                    console.log('Offcanvas chưa được khởi tạo');
                }
            }
        });
    });
    
    // Xử lý sự kiện resize để đảm bảo menu hoạt động đúng
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const offcanvas = document.getElementById('offcanvasNavbar');
            if (offcanvas && window.innerWidth >= 992) {
                try {
                    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
                    if (bsOffcanvas) {
                        bsOffcanvas.hide();
                    }
                } catch (error) {
                    // Offcanvas không tồn tại hoặc chưa khởi tạo
                }
            }
        }, 100);
    });
    
    // Kiểm tra và khởi tạo offcanvas nếu Bootstrap đã load
    const offcanvasElement = document.getElementById('offcanvasNavbar');
    if (offcanvasElement && typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
        try {
            // Chỉ khởi tạo nếu chưa được khởi tạo
            if (!bootstrap.Offcanvas.getInstance(offcanvasElement)) {
                new bootstrap.Offcanvas(offcanvasElement);
            }
        } catch (error) {
            console.error('Lỗi khởi tạo offcanvas:', error);
        }
    }
});