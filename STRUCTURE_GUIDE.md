# Cấu trúc tổ chức lại app.js

## Cấu trúc mới:

```
app.js
├── 1. IMPORTS & CONFIGURATIONS
│   ├── Import modules
│   ├── Environment variables
│   ├── Database connection
│   └── App initialization
│
├── 2. MIDDLEWARE SETUP
│   ├── Express middleware
│   ├── Cookie parser
│   ├── Authentication middleware
│   └── Authorization middleware
│
├── 3. HANDLEBARS CONFIGURATION
│   └── Helpers setup
│
├── 4. CLOUDINARY & MULTER CONFIGURATION
│   ├── Cloudinary config
│   ├── Multer storage config
│   └── Upload middleware
│
├── 5. HELPER FUNCTIONS
│   ├── formatTimeAgo()
│   ├── getRoomStatusData()
│   ├── formatDate()
│   ├── deleteOldImage()
│   ├── extractPublicIdFromUrl()
│   └── uploadNewImage()
│
├── 6. ROUTES - AUTHENTICATION & AUTHORIZATION
│   ├── GET  /admin-login - Trang đăng nhập admin
│   ├── POST /api/login - Xử lý đăng nhập
│   └── POST /admin-logout - Đăng xuất
│
├── 7. ROUTES - UPLOAD & IMAGE MANAGEMENT
│   ├── POST   /api/upload/image - Upload ảnh
│   ├── GET    /api/images/unused - Danh sách ảnh không dùng
│   ├── DELETE /api/images/cleanup - Xóa ảnh không dùng
│   ├── DELETE /api/upload/image - Xóa ảnh cụ thể
│   └── PUT    /api/phonghat/:id/image - Cập nhật ảnh phòng
│
├── 8. ROUTES - HOME & PUBLIC PAGES
│   ├── GET / - Trang chủ người dùng
│   ├── GET /about - Giới thiệu
│   └── GET /services - Dịch vụ
│
├── 9. ROUTES - DASHBOARD & STATISTICS
│   ├── GET /admin - Dashboard admin
│   ├── GET /admin/profile - Hồ sơ admin
│   └── GET /api/dashboard/charts - Dữ liệu biểu đồ
│
├── 10. ROUTES - ROOM MANAGEMENT (QUẢN LÝ PHÒNG HÁT)
│   ├── GET    /admin/phonghat - Trang quản lý phòng hát
│   ├── GET    /api/phonghat/:maPhong/gia - Lấy giá phòng theo giờ
│   ├── POST   /api/phonghat - Thêm phòng mới
│   ├── PUT    /api/phonghat/:id - Cập nhật phòng
│   ├── DELETE /api/phonghat/:id - Xóa phòng
│   └── DELETE /api/phonghatt - Xóa nhiều phòng
│
├── 11. ROUTES - PRICE MANAGEMENT (QUẢN LÝ BẢNG GIÁ)
│   ├── GET    /admin/loaiphong - Trang quản lý loại phòng
│   ├── GET    /api/hoadon/banggia/:maPhong - Lấy bảng giá phòng
│   ├── GET    /api/banggia/:loaiPhong - Lấy bảng giá theo loại
│   ├── GET    /api/phong/:maPhong/banggia - Bảng giá + khung giờ
│   ├── GET    /api/loaiphong/check-loai-phong/:loaiPhong - Check loại phòng
│   ├── GET    /api/phonghat/check-loai-phong/:loaiPhong - Check phòng dùng loại
│   ├── POST   /api/banggia/:loaiPhong - Lưu bảng giá
│   ├── POST   /api/loaiphong - Tạo loại phòng mới
│   ├── PUT    /api/banggia/:loaiPhong - Cập nhật bảng giá
│   ├── PUT    /banggia/all - Cập nhật tất cả bảng giá
│   ├── DELETE /api/banggia/:loaiPhong - Xóa loại phòng (logic)
│   └── DELETE /api/banggiaphong/:loaiPhong - Xóa bảng giá
│
├── 12. ROUTES - EQUIPMENT MANAGEMENT (QUẢN LÝ THIẾT BỊ)
│   ├── GET    /admin/thietbi - Trang quản lý thiết bị
│   ├── GET    /api/thietbi/:maTB - Lấy thông tin thiết bị
│   ├── POST   /api/thietbi - Thêm thiết bị mới
│   ├── PUT    /api/thietbi/:maTB - Cập nhật thiết bị
│   ├── PUT    /api/thietbi/:maTB/status - Cập nhật trạng thái
│   └── DELETE /api/thietbi/:maTB - Xóa thiết bị
│
├── 13. ROUTES - EMPLOYEE MANAGEMENT (QUẢN LÝ NHÂN VIÊN)
│   ├── GET    /admin/nhanvien - Trang quản lý nhân viên
│   ├── GET    /api/nhanvien/:maNV - Lấy thông tin nhân viên
│   ├── POST   /api/nhanvien - Thêm nhân viên mới
│   ├── PUT    /api/nhanvien/:maNV - Cập nhật nhân viên
│   └── DELETE /api/nhanvien/:maNV - Xóa nhân viên
│
├── 14. ROUTES - CUSTOMER MANAGEMENT (QUẢN LÝ KHÁCH HÀNG)
│   ├── GET    /api/khachhang - Lấy thông tin khách hàng (query by phone)
│   ├── POST   /api/khachhang - Thêm khách hàng mới
│   ├── PUT    /api/khachhang/:id - Cập nhật khách hàng
│   └── DELETE /api/khachhang/:id - Xóa khách hàng
│
├── 15. ROUTES - BOOKING MANAGEMENT (QUẢN LÝ ĐẶT PHÒNG)
│   ├── GET /admin/datphong - Trang quản lý đặt phòng
│   ├── GET /api/datphong/:maDatPhong - Lấy chi tiết đặt phòng
│   ├── POST /api/datphong - Tạo đặt phòng mới
│   ├── PUT /api/datphong/:maDatPhong - Cập nhật đặt phòng
│   ├── PUT /api/datphong/:maDatPhong/checkin - Check-in và tạo hóa đơn
│   └── PUT /api/datphong/:maDatPhong/huy - Hủy đặt phòng
│
├── 16. ROUTES - PRODUCT MANAGEMENT (QUẢN LÝ MẶT HÀNG)
│   ├── GET    /admin/mathang - Trang quản lý mặt hàng
│   ├── GET    /api/mathang - Lấy danh sách mặt hàng (query by LoaiHang)
│   ├── GET    /api/mathang/tonkho - Lấy tồn kho
│   ├── POST   /api/mathang - Thêm mặt hàng mới
│   ├── POST   /api/sanpham - [Legacy] Thêm sản phẩm
│   ├── PUT    /api/mathang/:maMH - Cập nhật mặt hàng
│   ├── PUT    /api/mathang/:maHang/tonkho - Cập nhật tồn kho
│   ├── DELETE /api/mathang/:mhID - Xóa mặt hàng
│   └── DELETE /api/sanpham/:id - [Legacy] Xóa sản phẩm
│
└── 17. ROUTES - INVOICE MANAGEMENT (QUẢN LÝ HÓA ĐƠN)
    ├── GET    /admin/hoadon - Trang quản lý hóa đơn
    ├── GET    /api/hoadon/phongtrong - Danh sách phòng trống
    ├── GET    /api/hoadon/mathang - Danh sách mặt hàng cho hóa đơn
    ├── GET    /api/hoadon/:maHoaDon - Lấy thông tin hóa đơn
    ├── GET    /api/hoadon/edit/:maHoaDon - Lấy hóa đơn để edit
    ├── GET    /api/chitiethoadon/:maHoaDon - Lấy chi tiết hóa đơn
    ├── POST   /api/hoadon - Tạo hóa đơn mới
    ├── PUT    /api/hoadon/edit/:maHoaDon - Cập nhật hóa đơn
    ├── PUT    /api/hoadon/thanhtoan/:maHoaDon - Thanh toán hóa đơn
    └── DELETE /api/delete/hoadon/:maHoaDon - Xóa hóa đơn

## 18. SERVER START
    └── app.listen(3000)
```

## Ghi chú:
- Mỗi nhóm route được phân theo chức năng rõ ràng
- Có chú thích đầy đủ cho từng API
- Dễ dàng tìm kiếm và bảo trì
- Code đã được sắp xếp logic từ authentication → public pages → admin features
