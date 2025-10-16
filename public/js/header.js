// Xử lý active state và mobile menu
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý active link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Xóa class active khỏi tất cả link khác
            navLinks.forEach(item => item.classList.remove('active', 'show'));
            // Thêm class active cho link được bấm
            this.classList.add('active');
            
            // Đóng offcanvas menu trên mobile sau khi click
            const offcanvas = document.getElementById('offcanvasNavbar');
            if (offcanvas && window.innerWidth < 992) {
                const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
                if (bsOffcanvas) {
                    bsOffcanvas.hide();
                }
            }
        });
    });
    
    // Xử lý sự kiện resize để đảm bảo menu hoạt động đúng
    window.addEventListener('resize', function() {
        const offcanvas = document.getElementById('offcanvasNavbar');
        if (offcanvas && window.innerWidth >= 992) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        }
    });
    
    // Kiểm tra và khởi tạo offcanvas nếu cần
    const offcanvasElement = document.getElementById('offcanvasNavbar');
    if (offcanvasElement) {
        // Đảm bảo offcanvas được khởi tạo
        new bootstrap.Offcanvas(offcanvasElement);
    }
});