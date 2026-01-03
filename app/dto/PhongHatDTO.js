import { BaseDTO } from './BaseDTO.js';

/**
 * PhongHat DTO
 * DTO cho thông tin phòng hát
 */
export class PhongHatDTO extends BaseDTO {
    /**
     * Chuyển đổi PhongHat document thành DTO
     * @param {Object} phongHat - PhongHat document từ MongoDB
     * @returns {Object} - PhongHat DTO
     */
    static toDTO(phongHat) {
        if (!phongHat) return null;
        
        const plainObject = phongHat.toObject ? phongHat.toObject() : phongHat;
        
        return {
            _id: plainObject._id,
            MaPhong: plainObject.MaPhong,
            TenPhong: plainObject.TenPhong,
            LoaiPhong: plainObject.LoaiPhong,
            SucChua: plainObject.SucChua,
            TrangThai: plainObject.TrangThai,
            GhiChu: plainObject.GhiChu || '',
            LinkAnh: plainObject.LinkAnh || '',
            createdAt: plainObject.createdAt
        };
    }

    /**
     * Chuyển đổi cho trang chủ (thông tin cơ bản)
     */
    static toPublicDTO(phongHat) {
        if (!phongHat) return null;
        
        const plainObject = phongHat.toObject ? phongHat.toObject() : phongHat;
        
        return {
            _id: plainObject._id,
            MaPhong: plainObject.MaPhong,
            TenPhong: plainObject.TenPhong,
            LoaiPhong: plainObject.LoaiPhong,
            SucChua: plainObject.SucChua,
            TrangThai: plainObject.TrangThai,
            LinkAnh: plainObject.LinkAnh || '/icon/default-room.png'
        };
    }

    /**
     * Chuyển đổi cho admin (đầy đủ thông tin)
     */
    static toAdminDTO(phongHat) {
        return this.toDTO(phongHat);
    }
}
