import { BaseDTO } from './BaseDTO.js';

/**
 * NhanVien DTO
 * DTO cho thông tin nhân viên - LOẠI BỎ các trường nhạy cảm như Password, Email
 */
export class NhanVienDTO extends BaseDTO {
    /**
     * Chuyển đổi NhanVien document thành DTO (loại bỏ password)
     * @param {Object} nhanVien - NhanVien document từ MongoDB
     * @returns {Object} - NhanVien DTO
     */
    static toDTO(nhanVien) {
        if (!nhanVien) return null;
        
        const plainObject = nhanVien.toObject ? nhanVien.toObject() : nhanVien;
        
        return {
            _id: plainObject._id,
            MaNV: plainObject.MaNV,
            TenNV: plainObject.TenNV,
            SĐT: plainObject.SĐT,
            VaiTro: plainObject.VaiTro,
            CaTruc: plainObject.CaTruc,
            LuongCoBan: plainObject.LuongCoBan,
            PhuCap: plainObject.PhuCap || 0,
            NgayVaoLam: plainObject.NgayVaoLam,
            TrangThai: plainObject.TrangThai,
            LinkAvatar: plainObject.LinkAvatar || '',
            NgaySinh: plainObject.NgaySinh,
            GioiTinh: plainObject.GioiTinh,
            CCCD: plainObject.CCCD,
            DiaChi: plainObject.DiaChi,
            SoGioLam: plainObject.SoGioLam || 0,
            DoanhSo: plainObject.DoanhSo || 0,
            DanhGia: plainObject.DanhGia,
            GhiChu: plainObject.GhiChu || '',
            createdAt: plainObject.createdAt,
            updatedAt: plainObject.updatedAt
            // Email và Password bị loại bỏ vì lý do bảo mật
        };
    }

    /**
     * DTO cho hiển thị danh sách (thông tin tóm tắt)
     */
    static toListDTO(nhanVien) {
        if (!nhanVien) return null;
        
        const plainObject = nhanVien.toObject ? nhanVien.toObject() : nhanVien;
        
        return {
            _id: plainObject._id,
            MaNV: plainObject.MaNV,
            TenNV: plainObject.TenNV,
            SĐT: plainObject.SĐT,
            VaiTro: plainObject.VaiTro,
            CaTruc: plainObject.CaTruc,
            TrangThai: plainObject.TrangThai,
            LinkAvatar: plainObject.LinkAvatar || '/icon/default-avatar.png'
        };
    }

    /**
     * DTO cho thống kê nhân viên
     */
    static toStatisticsDTO(nhanVien) {
        if (!nhanVien) return null;
        
        const plainObject = nhanVien.toObject ? nhanVien.toObject() : nhanVien;
        
        return {
            MaNV: plainObject.MaNV,
            TenNV: plainObject.TenNV,
            VaiTro: plainObject.VaiTro,
            SoGioLam: plainObject.SoGioLam || 0,
            DoanhSo: plainObject.DoanhSo || 0,
            DanhGia: plainObject.DanhGia,
            TrangThai: plainObject.TrangThai
        };
    }

    /**
     * DTO cho profile cá nhân (có thêm email nhưng không có password)
     */
    static toProfileDTO(nhanVien) {
        if (!nhanVien) return null;
        
        const plainObject = nhanVien.toObject ? nhanVien.toObject() : nhanVien;
        
        return {
            ...this.toDTO(nhanVien),
            Email: plainObject.Email // Chỉ hiển thị email trong profile
        };
    }
}
