import mongoose, { model } from "mongoose";

const PhongHatSchema = new mongoose.Schema({
  MaPhong: { type: String, required: true, unique: true },
  TenPhong: { type: String, required: true },
  LoaiPhong: { type: String, required: true },
  SucChua: { type: Number, required: true },
  TrangThai: { type: String, required: true, default: "Trống" },
  GhiChu: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Data_PhongHat_Model = mongoose.model("phonghats", PhongHatSchema);

const NhanVienSchema = new mongoose.Schema({
  MaNV: { type: String, required: true, unique: true },
  TenNV: { type: String, required: true },
  VaiTro: { type: String, required: true },
  LuongCoBan: { type: Number },
  NgayVaoLam: { type: Date, required: true },
  TrangThai: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Data_NhanVien_Model = mongoose.model("nhanviens", NhanVienSchema);

const KhachHangSchema = new mongoose.Schema({
  MaKH: { type: String, required: true, unique: true },
  TenKH: { type: String, required: true },
  SDT: { type: String, required: true },
  Email: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Data_KhachHang_Model = mongoose.model("khachhangs", KhachHangSchema);

const DatPhongSchema = new mongoose.Schema({
  MaDatPhong: { type: String, required: true, unique: true },
  MaKH: { type: String, required: true },
  MaPhong: { type: String, required: true },
  ThoiGianBatDau: { type: Date, required: true },
  ThoiGianKetThuc: { type: Date },
  TrangThai: { type: String, default: "Đã đặt" },
  createdAt: { type: Date, default: Date.now }
});
const Data_DatPhong_Model = mongoose.model("datphongs", DatPhongSchema);

const HoaDonSchema = new mongoose.Schema({
  MaHoaDon: { type: String, required: true, unique: true },
  MaDatPhong: { type: String, required: true },
  TongTien: { type: Number, required: true },
  ThoiGianTao: { type: Date, default: Date.now },
  TrangThai: { type: String, default: "Chưa thanh toán" },
  createdAt: { type: Date, default: Date.now }
});
const Data_HoaDon_Model = mongoose.model("hoadons", HoaDonSchema);

const MatHangSchema = new mongoose.Schema({
  MaHang: { type: String, required: true, unique: true },
  TenHang: { type: String, required: true },
  DonGia: { type: Number, required: true },
  DonViTinh: { type: String, required: true },
  SoLuongTon: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Data_MatHang_Model = mongoose.model("mathangs", MatHangSchema);

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
const Data_ChiTietHD_Model = mongoose.model("chitiethoadons", ChiTietHoaDonSchema);

const BangGiaPhongSchema = new mongoose.Schema({
  MaGia: { type: String, required: true, unique: true },
  LoaiPhong: { type: String, required: true },
  KhungGio: { type: String, required: true },
  GiaTien: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Data_BangGiaPhong_Model = mongoose.model("banggiaphongs", BangGiaPhongSchema);

const DanhMucLuongSchema = new mongoose.Schema({
  MaMucLuong: { type: String, required: true, unique: true },
  VaiTro: { type: String, required: true },
  CaLam: { type: String, required: true },
  LuongTheoGio: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Data_DanhMucLuong_Model = mongoose.model("danhmucluongs", DanhMucLuongSchema);

const PhanCongSchema = new mongoose.Schema({
  MaPhanCong: { type: String, required: true, unique: true },
  MaNV: { type: String, required: true },
  CaLam: { type: String, required: true },
  NgayLam: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Data_PhanCong_Model = mongoose.model("phancongs", PhanCongSchema);

const YeuCauKyThuatSchema = new mongoose.Schema({
  MaYeuCau: { type: String, required: true, unique: true },
  MaPhong: { type: String, required: true },
  MoTa: { type: String, required: true },
  ThoiGianTao: { type: Date, default: Date.now },
  TrangThai: { type: String, default: "Đang chờ" },
  createdAt: { type: Date, default: Date.now }
});
const Data_YeuCauKyThuat_Model = mongoose.model("yeucaukythuats", YeuCauKyThuatSchema);

const ThietBiSchema = new mongoose.Schema({
  MaThietBi: { type: String, required: true, unique: true },
  MaPhong: { type: String, required: true },
  TenThietBi: { type: String, required: true },
  TinhTrang: { type: String, default: "Tốt" },
  createdAt: { type: Date, default: Date.now }
});
const Data_ThietBi_Model = mongoose.model("thietbis", ThietBiSchema);

const LichSuBaoTriSchema = new mongoose.Schema({
  MaLichSu: { type: String, required: true, unique: true },
  MaThietBi: { type: String, required: true },
  MoTa: { type: String, required: true },
  ChiPhi: { type: Number, required: true },
  ThoiGian: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});
const Data_LichSuBaoTri_Model = mongoose.model("lichsubaotris", LichSuBaoTriSchema);

const NhapHangSchema = new mongoose.Schema({
  MaPhieuNhap: { type: String, required: true, unique: true },
  MaNV: { type: String, required: true },
  NgayNhap: { type: Date, default: Date.now },
  TongChiPhi: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Data_NhapHang_Model = mongoose.model("nhaphangs", NhapHangSchema);

const ChiTietNhapHangSchema = new mongoose.Schema({
  MaCTNH: { type: String, required: true, unique: true },
  MaPhieuNhap: { type: String, required: true },
  MaHang: { type: String, required: true },
  SoLuong: { type: Number, required: true },
  DonGia: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Data_ChiTietNhapHang_Model = mongoose.model("chitietnhaphangs", ChiTietNhapHangSchema);

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Data_Admin_Model = mongoose.model("admins", AdminSchema);


export default { Data_PhongHat_Model, Data_NhanVien_Model, Data_KhachHang_Model, Data_Admin_Model, Data_SanPham_Model };