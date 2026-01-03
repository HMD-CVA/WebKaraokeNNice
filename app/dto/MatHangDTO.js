import { BaseDTO } from './BaseDTO.js';

/**
 * MatHang DTO
 * DTO cho thông tin mặt hàng
 */
export class MatHangDTO extends BaseDTO {
    /**
     * Chuyển đổi MatHang document thành DTO
     * @param {Object} matHang - MatHang document từ MongoDB
     * @returns {Object} - MatHang DTO
     */
    static toDTO(matHang) {
        if (!matHang) return null;
        
        const plainObject = matHang.toObject ? matHang.toObject() : matHang;
        
        return {
            _id: plainObject._id,
            MaHang: plainObject.MaHang,
            TenHang: plainObject.TenHang,
            LoaiHang: plainObject.LoaiHang,
            DonGia: plainObject.DonGia,
            DonViTinh: plainObject.DonViTinh,
            SoLuongTon: plainObject.SoLuongTon || 0,
            LinkAnh: plainObject.LinkAnh || '',
            createdAt: plainObject.createdAt
        };
    }

    /**
     * DTO cho menu (không cần số lượng tồn)
     */
    static toMenuDTO(matHang) {
        if (!matHang) return null;
        
        const plainObject = matHang.toObject ? matHang.toObject() : matHang;
        
        return {
            MaHang: plainObject.MaHang,
            TenHang: plainObject.TenHang,
            LoaiHang: plainObject.LoaiHang,
            DonGia: plainObject.DonGia,
            DonViTinh: plainObject.DonViTinh,
            LinkAnh: plainObject.LinkAnh || '/icon/default-product.png',
            TrangThai: plainObject.SoLuongTon > 0 ? 'Còn hàng' : 'Hết hàng'
        };
    }

    /**
     * DTO cho quản lý kho
     */
    static toInventoryDTO(matHang) {
        if (!matHang) return null;
        
        const plainObject = matHang.toObject ? matHang.toObject() : matHang;
        const soLuong = plainObject.SoLuongTon || 0;
        
        return {
            MaHang: plainObject.MaHang,
            TenHang: plainObject.TenHang,
            LoaiHang: plainObject.LoaiHang,
            DonGia: plainObject.DonGia,
            DonViTinh: plainObject.DonViTinh,
            SoLuongTon: soLuong,
            TrangThaiKho: soLuong === 0 ? 'Hết hàng' : soLuong <= 10 ? 'Sắp hết' : 'Còn hàng',
            MucDoCanNhap: soLuong === 0 ? 'urgent' : soLuong <= 10 ? 'warning' : 'normal'
        };
    }

    /**
     * DTO cho order (thêm thông tin để tính tiền)
     */
    static toOrderDTO(matHang) {
        if (!matHang) return null;
        
        const plainObject = matHang.toObject ? matHang.toObject() : matHang;
        
        return {
            MaHang: plainObject.MaHang,
            TenHang: plainObject.TenHang,
            DonGia: plainObject.DonGia,
            DonViTinh: plainObject.DonViTinh,
            SoLuongTon: plainObject.SoLuongTon || 0,
            CoTheDat: (plainObject.SoLuongTon || 0) > 0
        };
    }
}
