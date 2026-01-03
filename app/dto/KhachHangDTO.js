import { BaseDTO } from './BaseDTO.js';

/**
 * KhachHang DTO
 * DTO cho thông tin khách hàng
 */
export class KhachHangDTO extends BaseDTO {
    /**
     * Chuyển đổi KhachHang document thành DTO
     * @param {Object} khachHang - KhachHang document từ MongoDB
     * @returns {Object} - KhachHang DTO
     */
    static toDTO(khachHang) {
        if (!khachHang) return null;
        
        const plainObject = khachHang.toObject ? khachHang.toObject() : khachHang;
        
        return {
            _id: plainObject._id,
            MaKH: plainObject.MaKH,
            TenKH: plainObject.TenKH,
            SDT: plainObject.SDT,
            Email: plainObject.Email || '',
            createdAt: plainObject.createdAt
        };
    }

    /**
     * DTO cho danh sách khách hàng
     */
    static toListDTO(khachHang) {
        if (!khachHang) return null;
        
        const plainObject = khachHang.toObject ? khachHang.toObject() : khachHang;
        
        return {
            MaKH: plainObject.MaKH,
            TenKH: plainObject.TenKH,
            SDT: plainObject.SDT
        };
    }

    /**
     * DTO cho autocomplete/search
     */
    static toSearchDTO(khachHang) {
        if (!khachHang) return null;
        
        const plainObject = khachHang.toObject ? khachHang.toObject() : khachHang;
        
        return {
            value: plainObject.MaKH,
            label: `${plainObject.TenKH} - ${plainObject.SDT}`,
            MaKH: plainObject.MaKH,
            TenKH: plainObject.TenKH,
            SDT: plainObject.SDT
        };
    }
}
