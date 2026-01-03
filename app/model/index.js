import mongoose from "mongoose";
import { generateCode } from "../utils/codeGenerator.js";
import bcrypt from "bcrypt"

// TẠO SCHEMA TRƯỚC, RỒI THÊM MIDDLEWARE, CUỐI CÙNG MỚI TẠO MODEL

// 1. PhongHat Schema
const PhongHatSchema = new mongoose.Schema({
  MaPhong: { type: String, unique: true },
  TenPhong: { type: String, required: true },
  LoaiPhong: { type: String, required: true },
  SucChua: { type: Number, required: true },
  TrangThai: { type: String, required: true, default: "Trống" },
  GhiChu: { type: String },
  LinkAnh: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 2. NhanVien Schema
const NhanVienSchema = new mongoose.Schema({
  MaNV: { type: String, unique: true, required: true },
  TenNV: { type: String, required: true },
  SĐT: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, require: true, select: false },
  VaiTro: { 
    type: String, 
    required: true,
    enum: ['Lễ tân', 'Phục vụ', 'Kỹ thuật', 'Quản lý', 'Bảo vệ']
  },
  CaTruc: {
    type: String,
    enum: ['Sáng (6h-14h)', 'Chiều (14h-22h)', 'Tối (22h-6h)', 'Full-time']
  },
  LuongCoBan: { type: Number, required: true },
  PhuCap: { type: Number, default: 0 },
  NgayVaoLam: { type: Date, required: true },
  TrangThai: { 
    type: String, 
    enum: ['Đang làm việc', 'Nghỉ phép', 'Đã nghỉ việc'],
    default: 'Đang làm việc'
  },
  LinkAvatar: { type: String },
  // Thông tin cá nhân
  NgaySinh: { type: Date },
  GioiTinh: { type: String, enum: ['Nam', 'Nữ'] },
  CCCD: { type: String },
  DiaChi: { type: String },
  // Thông tin công việc
  SoGioLam: { type: Number, default: 0 }, // Số giờ làm trong tháng
  DoanhSo: { type: Number, default: 0 }, // Doanh số bán đồ uống/thức ăn
  DanhGia: { type: Number, min: 1, max: 5 }, // Đánh giá từ khách hàng
  GhiChu: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 3. KhachHang Schema
const KhachHangSchema = new mongoose.Schema({
  MaKH: { type: String, required: true, unique: true },
  TenKH: { type: String, required: true },
  SDT: { type: String, required: true },
  Email: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 4. DatPhong Schema
const DatPhongSchema = new mongoose.Schema({
  MaDatPhong: { type: String, required: true, unique: true },
  MaKH: { type: String, required: true },
  MaPhong: { type: String, required: true },
  ThoiGianBatDau: { type: Date, required: true },
  ThoiGianKetThuc: { type: Date },
  SoNguoi: {type: Number},
  TrangThai: { type: String, default: "Đã đặt" },
  GhiChu: {type: String},
  createdAt: { type: Date, default: Date.now }
});

// 5. HoaDon Schema
const HoaDonSchema = new mongoose.Schema({
  MaHoaDon: { type: String, required: true, unique: true },
  MaDatPhong: { type: String },
  MaKH: {type: String, require: true},
  MaPhong: {type: String, require: true},
  TongTien: { type: Number, required: true },
  ThoiGianTao: { type: Date, default: Date.now },
  ThoiGianBatDau: {type: Date},
  ThoiGianKetThuc: {type: Date},
  TrangThai: { type: String, default: "Chưa thanh toán" },
  createdAt: { type: Date, default: Date.now }
});

// 6. MatHang Schema
const MatHangSchema = new mongoose.Schema({
  MaHang: { type: String, required: true, unique: true },
  TenHang: { type: String, required: true },
  LoaiHang: {type: String, required: true},
  DonGia: { type: Number, required: true },
  DonViTinh: { type: String, required: true },
  SoLuongTon: { type: Number, default: 0 },
  LinkAnh: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 7. ChiTietHoaDon Schema
const ChiTietHoaDonSchema = new mongoose.Schema({
  MaCTHD: { type: String, required: true, unique: true },
  MaHoaDon: { type: String, required: true },
  MaHang: { type: String },
  SoLuong: { type: Number, required: true },
  DonGia: { type: Number, required: true },
  ThanhTien: { type: Number, required: true },
  LoaiDichVu: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 8. BangGiaPhong Schema
const BangGiaPhongSchema = new mongoose.Schema({
  MaGia: { type: String, required: true, unique: true },
  LoaiPhong: { type: String, required: true },
  KhungGio: { type: String },
  GiaTien: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

// 9. DanhMucLuong Schema
const DanhMucLuongSchema = new mongoose.Schema({
  MaMucLuong: { type: String, required: true, unique: true },
  VaiTro: { type: String, required: true },
  CaLam: { type: String, required: true },
  LuongTheoGio: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 10. PhanCong Schema
const PhanCongSchema = new mongoose.Schema({
  MaPhanCong: { type: String, required: true, unique: true },
  MaNV: { type: String, required: true },
  CaLam: { type: String, required: true },
  NgayLam: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 11. YeuCauKyThuat Schema
const YeuCauKyThuatSchema = new mongoose.Schema({
  MaYeuCau: { type: String, required: true, unique: true },
  MaPhong: { type: String, required: true },
  MoTa: { type: String, required: true },
  ThoiGianTao: { type: Date, default: Date.now },
  TrangThai: { type: String, default: "Đang chờ" },
  createdAt: { type: Date, default: Date.now }
});

// 12. ThietBi Schema
const ThietBiSchema = new mongoose.Schema({
  MaThietBi: { type: String, required: true, unique: true },
  MaPhong: { type: String, required: true },
  TenThietBi: { type: String, required: true },
  LoaiThietBi: {type: String, required: true},
  TinhTrang: { type: String, default: "Tốt" },
  LinkAnh: { type: String },
  NgayNhap: {type: Date},
  createdAt: { type: Date, default: Date.now }
});

// 13. LichSuBaoTri Schema
const LichSuBaoTriSchema = new mongoose.Schema({
  MaLichSu: { type: String, required: true, unique: true },
  MaThietBi: { type: String, required: true },
  MoTa: { type: String, required: true },
  ChiPhi: { type: Number, required: true },
  ThoiGian: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// 14. NhapHang Schema
const NhapHangSchema = new mongoose.Schema({
  MaPhieuNhap: { type: String, required: true, unique: true },
  MaNV: { type: String, required: true },
  NgayNhap: { type: Date, default: Date.now },
  TongChiPhi: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 15. ChiTietNhapHang Schema
const ChiTietNhapHangSchema = new mongoose.Schema({
  MaCTNH: { type: String, required: true, unique: true },
  MaPhieuNhap: { type: String, required: true },
  MaHang: { type: String, required: true },
  SoLuong: { type: Number, required: true },
  DonGia: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 16. Admin Schema
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// THÊM MIDDLEWARE VÀO CÁC SCHEMA TRƯỚC KHI TẠO MODEL

// Middleware cho PhongHat
PhongHatSchema.pre('save', async function(next) {
  if (this.isNew && !this.MaPhong) {
    const PhongHat = mongoose.model('PhongHat', PhongHatSchema);
    this.MaPhong = await generateCode('P', PhongHat, 'MaPhong');
  }
  next();
});

// Middleware cho NhanVien
NhanVienSchema.pre('save', async function(next) {
  if (this.isNew && !this.MaNV) {
    const NhanVien = mongoose.model('NhanVien', NhanVienSchema);
    this.MaNV = await generateCode('NV', NhanVien, 'MaNV');
  }

  try {
    const hash = await bcrypt.hash(this.Password, 10)
    this.Password = hash
  } catch (error) {
    console.log('Có lỗi khi mã hóa mật khẩu:' + error.message);
    throw new Error('Có lỗi khi mã hóa mật khẩu:' + error.message)
  }

  next();
});

// Middleware cho KhachHang
KhachHangSchema.pre('save', async function(next) {
  if (this.isNew && !this.MaKH) {
    const KhachHang = mongoose.model('KhachHang', KhachHangSchema);
    this.MaKH = await generateCode('KH', KhachHang, 'MaKH');
  }
  next();
});

// Middleware cho DatPhong
DatPhongSchema.pre('save', async function(next) {
  if (this.isNew && !this.MaDatPhong) {
    const DatPhong = mongoose.model('DatPhong', DatPhongSchema);
    this.MaDatPhong = await generateCode('DP', DatPhong, 'MaDatPhong');
  }
  next();
});

// Middleware cho HoaDon
HoaDonSchema.pre('save', async function(next) {
  if (this.isNew && !this.MaHoaDon) {
    const HoaDon = mongoose.model('HoaDon', HoaDonSchema);
    this.MaHoaDon = await generateCode('HD', HoaDon, 'MaHoaDon');
  }
  next();
});

// Middleware cho MatHang
MatHangSchema.pre('save', async function(next) {
  if (this.isNew && !this.MaHang) {
    const MatHang = mongoose.model('MatHang', MatHangSchema);
    this.MaHang = await generateCode('MH', MatHang, 'MaHang');
  }
  next();
});

BangGiaPhongSchema.pre('save', async function (next) {
  if (this.isNew && !this.MaGia) {
    const BangGiaPhong = mongoose.model('BangGiaPhong', BangGiaPhongSchema);
    this.MaGia = await generateCode('PG', BangGiaPhong, 'BangGiaPhong');
  }
  next();
});

// TẠO MODEL SAU CÙNG
const Data_PhongHat_Model = mongoose.model("phonghats", PhongHatSchema);
const Data_NhanVien_Model = mongoose.model("nhanviens", NhanVienSchema);
const Data_KhachHang_Model = mongoose.model("khachhangs", KhachHangSchema);
const Data_DatPhong_Model = mongoose.model("datphongs", DatPhongSchema);
const Data_HoaDon_Model = mongoose.model("hoadons", HoaDonSchema);
const Data_MatHang_Model = mongoose.model("mathangs", MatHangSchema);
const Data_ChiTietHD_Model = mongoose.model("chitiethoadons", ChiTietHoaDonSchema);
const Data_BangGiaPhong_Model = mongoose.model("banggiaphongs", BangGiaPhongSchema);
const Data_DanhMucLuong_Model = mongoose.model("danhmucluongs", DanhMucLuongSchema);
const Data_PhanCong_Model = mongoose.model("phancongs", PhanCongSchema);
const Data_YeuCauKyThuat_Model = mongoose.model("yeucaukythuats", YeuCauKyThuatSchema);
const Data_ThietBi_Model = mongoose.model("thietbis", ThietBiSchema);
const Data_LichSuBaoTri_Model = mongoose.model("lichsubaotris", LichSuBaoTriSchema);
const Data_NhapHang_Model = mongoose.model("nhaphangs", NhapHangSchema);
const Data_ChiTietNhapHang_Model = mongoose.model("chitietnhaphangs", ChiTietNhapHangSchema);
const Data_Admin_Model = mongoose.model("admins", AdminSchema);

// Export tất cả models
export default {
  Data_PhongHat_Model,
  Data_NhanVien_Model,
  Data_KhachHang_Model,
  Data_DatPhong_Model,
  Data_HoaDon_Model,
  Data_MatHang_Model,
  Data_ChiTietHD_Model,
  Data_BangGiaPhong_Model,
  Data_DanhMucLuong_Model,
  Data_PhanCong_Model,
  Data_YeuCauKyThuat_Model,
  Data_ThietBi_Model,
  Data_LichSuBaoTri_Model,
  Data_NhapHang_Model,
  Data_ChiTietNhapHang_Model,
  Data_Admin_Model
};