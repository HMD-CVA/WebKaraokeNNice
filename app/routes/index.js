/**
 * Routes Configuration - Cấu hình routes dựa trên app_backup.js
 */

import express from 'express';
import HomeController from '../controllers/HomeController.js';
import PhongHatController from '../controllers/PhongHatController.js';
import BangGiaPhongController from '../controllers/BangGiaPhongController.js';
import KhachHangController from '../controllers/KhachHangController.js';
import NhanVienController from '../controllers/NhanVienController.js';
import MatHangController from '../controllers/MatHangController.js';
import ThietBiController from '../controllers/ThietBiController.js';
import DatPhongController from '../controllers/DatPhongController.js';
import HoaDonController from '../controllers/HoaDonController.js';
import { requireLogin, requireManager } from '../middlewares/authMiddlewares.js'

const router = express.Router();

// Middlewares
router.use('/admin', requireLogin)

// ==================== PUBLIC PAGES ====================
router.get('/', HomeController.renderHomePage);
router.get('/about', HomeController.renderAboutPage);
router.get('/services', HomeController.renderServicesPage);
router.get('/admin-login', HomeController.renderLoginPage);

// ==================== ADMIN DASHBOARD ====================
router.get('/admin', HomeController.renderDashboard);

// ==================== AUTHENTICATION ====================
router.post('/api/login', NhanVienController.login);
router.post('/api/logout', NhanVienController.logout);

// ==================== ADMIN PROFILE ====================
router.get('/admin/profile', NhanVienController.renderProfilePage);
router.get('/api/profile', requireLogin, NhanVienController.getProfile);
router.put('/api/profile', requireLogin, NhanVienController.updateProfile);
router.put('/api/profile/password', requireLogin, NhanVienController.updatePassword);

// ==================== PHÒNG HÁT ====================
router.get('/admin/phonghat', PhongHatController.renderPhongHatPage);
router.post('/api/phonghat', requireManager, PhongHatController.createPhongHat);
router.put('/api/phonghat/:id', requireManager, PhongHatController.updatePhongHat);
router.put('/api/phonghat/:id/image', requireManager, PhongHatController.updateImagePhongHat);
router.delete('/api/phonghat/:id', requireManager, PhongHatController.deletePhongHat);

// Check loại phòng
router.get('/api/phonghat/check-loai-phong/:loaiPhong', PhongHatController.checkLoaiPhongInUse);

// API lấy giá phòng theo khung giờ
router.get('/api/phonghat/:maPhong/gia', PhongHatController.getGiaPhongTheoKhungGio);

// API lấy bảng giá và khung giờ hoạt động
router.get('/api/phong/:maPhong/banggia', PhongHatController.getBangGiaAndKhungGioHoatDong);

// API lấy danh sách phòng trống với giá
router.get('/api/hoadon/phongtrong', PhongHatController.getPhongTrongWithBangGia);

// Lấy bảng giá
router.get('/api/hoadon/banggia/:maPhong', PhongHatController.getBangGiaByMaPhong);
router.get('/api/banggia/:loaiPhong', PhongHatController.getBangGiaByLoaiPhong);

// ==================== BẢNG GIÁ PHÒNG ====================
router.post('/api/banggia/:loaiPhong', requireManager, BangGiaPhongController.saveBangGia);
router.put('/api/banggia/:loaiPhong', requireManager, BangGiaPhongController.updateBangGia);
router.delete('/api/banggia/:loaiPhong', requireManager, BangGiaPhongController.deleteBangGia);
router.delete('/api/banggiaphong/:loaiPhong', requireManager, BangGiaPhongController.deleteBangGiaPhong);

// Quản lý loại phòng
router.post('/api/loaiphong', BangGiaPhongController.manageLoaiPhong);
router.get('/api/loaiphong/check-loai-phong/:loaiPhong', BangGiaPhongController.checkLoaiPhongInUse);

// ==================== KHÁCH HÀNG ====================
router.get('/admin/khachhang', KhachHangController.renderKhachHangPage);
router.get('/api/khachhang/:maKH', KhachHangController.getKhachHang);
router.get('/api/khachhang', KhachHangController.getAllKhachHangs);
router.post('/api/khachhang', KhachHangController.createKhachHang);
router.put('/api/khachhang/:id', KhachHangController.updateKhachHang);
router.delete('/api/khachhang/:id', KhachHangController.deleteKhachHang);

// ==================== NHÂN VIÊN ====================
router.get('/admin/nhanvien', requireManager, NhanVienController.renderNhanVienPage);
router.get('/api/nhanvien/:maNV', requireManager, NhanVienController.getNhanVien);
router.post('/api/nhanvien', requireManager, NhanVienController.createNhanVien);
router.put('/api/nhanvien/:maNV', requireManager, NhanVienController.updateNhanVien);
router.put('/api/nhanvien/:maNV/permission', requireManager, NhanVienController.updatePermission);
router.delete('/api/nhanvien/:maNV', requireManager, NhanVienController.deleteNhanVien);

// ==================== MẶT HÀNG ====================
router.get('/admin/mathang', MatHangController.renderMatHangPage);
router.get('/api/hoadon/mathang', MatHangController.getMatHangsForHoaDon);
router.get('/api/mathang/tonkho', MatHangController.getMatHangsTonKho);
router.get('/api/mathang', MatHangController.getMatHangs);
router.post('/api/mathang', requireManager, MatHangController.createMatHang);
router.put('/api/mathang/:maMH', requireManager, MatHangController.updateMatHang);
router.put('/api/mathang/:maHang/tonkho', requireManager, MatHangController.updateSoLuongTon);
router.delete('/api/mathang/:mhID', requireManager, MatHangController.deleteMatHang);

// ==================== THIẾT BỊ ====================
// ==================== THIẾT BỊ ====================
router.get('/admin/thietbi', ThietBiController.renderThietBiPage);
router.get('/api/thietbi/:maTB', ThietBiController.getThietBi);
router.post('/api/thietbi', requireManager, ThietBiController.createThietBi);
router.put('/api/thietbi/:maTB', ThietBiController.updateThietBi);
router.put('/api/thietbi/:maTB/status', ThietBiController.updateTrangThaiThietBi);
router.delete('/api/thietbi/:maTB', requireManager, ThietBiController.deleteThietBi);

// ==================== ĐẶT PHÒNG ====================
router.get('/admin/datphong', DatPhongController.renderDatPhongPage);
router.post('/api/datphong', DatPhongController.createDatPhong);
router.get('/api/datphong/:maDatPhong', DatPhongController.getDatPhong);
router.put('/api/datphong/:maDatPhong', DatPhongController.updateDatPhong);
router.put('/api/datphong/:maDatPhong/checkin', DatPhongController.checkInDatPhong);
router.put('/api/datphong/:maDatPhong/huy', DatPhongController.huyDatPhong);
router.delete('/api/datphong/:maDatPhong', DatPhongController.deleteDatPhong);

// ==================== HÓA ĐƠN ====================
router.get('/admin/hoadon', HoaDonController.renderHoaDonPage);

// ⚠️ IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// Put /api/hoadon/edit/:maHoaDon BEFORE /api/hoadon/:maHoaDon
router.get('/api/hoadon/edit/:maHoaDon', HoaDonController.getHoaDonForEdit);
router.get('/api/chitiethoadon/:maHoaDon', HoaDonController.getChiTietHoaDon);
router.get('/api/hoadon/:maHoaDon', HoaDonController.getHoaDon);

router.post('/api/hoadon', HoaDonController.createHoaDon);
router.put('/api/hoadon/edit/:maHoaDon', HoaDonController.updateHoaDon);
router.put('/api/hoadon/thanhtoan/:maHoaDon', HoaDonController.thanhToanHoaDon);
router.delete('/api/delete/hoadon/:maHoaDon', HoaDonController.deleteHoaDon);

export default router;
