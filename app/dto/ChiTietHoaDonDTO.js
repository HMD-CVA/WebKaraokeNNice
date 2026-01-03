import { BaseDTO } from './BaseDTO.js';

/**
 * ChiTietHoaDon DTO
 * DTO cho chi tiết hóa đơn
 */
export class ChiTietHoaDonDTO extends BaseDTO {
    /**
     * Chuyển đổi ChiTietHoaDon document thành DTO
     * @param {Object} chiTiet - ChiTietHoaDon document từ MongoDB
     * @returns {Object} - ChiTietHoaDon DTO
     */
    static toDTO(chiTiet) {
        if (!chiTiet) return null;
        
        const plainObject = chiTiet.toObject ? chiTiet.toObject() : chiTiet;
        
        return {
            _id: plainObject._id,
            MaCTHD: plainObject.MaCTHD,
            MaHoaDon: plainObject.MaHoaDon,
            MaHang: plainObject.MaHang,
            SoLuong: plainObject.SoLuong,
            DonGia: plainObject.DonGia,
            ThanhTien: plainObject.ThanhTien,
            LoaiDichVu: plainObject.LoaiDichVu,
            createdAt: plainObject.createdAt
        };
    }

    /**
     * DTO với thông tin mặt hàng (khi populate)
     */
    static toDetailDTO(chiTiet, matHang = null) {
        if (!chiTiet) return null;
        
        const baseDTO = this.toDTO(chiTiet);
        
        return {
            ...baseDTO,
            MatHang: matHang ? {
                TenHang: matHang.TenHang,
                DonViTinh: matHang.DonViTinh,
                LoaiHang: matHang.LoaiHang
            } : null
        };
    }

    /**
     * DTO cho in hóa đơn
     */
    static toPrintDTO(chiTiet, tenHang = '') {
        if (!chiTiet) return null;
        
        const plainObject = chiTiet.toObject ? chiTiet.toObject() : chiTiet;
        
        return {
            TenHang: tenHang,
            SoLuong: plainObject.SoLuong,
            DonGia: plainObject.DonGia,
            ThanhTien: plainObject.ThanhTien,
            LoaiDichVu: plainObject.LoaiDichVu
        };
    }
}
