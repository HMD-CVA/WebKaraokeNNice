import { BaseDTO } from './BaseDTO.js';

/**
 * ThietBi DTO
 * DTO cho thông tin thiết bị
 */
export class ThietBiDTO extends BaseDTO {
    /**
     * Chuyển đổi ThietBi document thành DTO
     * @param {Object} thietBi - ThietBi document từ MongoDB
     * @returns {Object} - ThietBi DTO
     */
    static toDTO(thietBi) {
        if (!thietBi) return null;
        
        const plainObject = thietBi.toObject ? thietBi.toObject() : thietBi;
        
        return {
            _id: plainObject._id,
            MaThietBi: plainObject.MaThietBi,
            MaPhong: plainObject.MaPhong,
            TenThietBi: plainObject.TenThietBi,
            LoaiThietBi: plainObject.LoaiThietBi,
            TinhTrang: plainObject.TinhTrang,
            LinkAnh: plainObject.LinkAnh || '',
            NgayNhap: plainObject.NgayNhap,
            createdAt: plainObject.createdAt
        };
    }

    /**
     * DTO cho danh sách thiết bị theo phòng
     */
    static toRoomEquipmentDTO(thietBi, phongHat = null) {
        if (!thietBi) return null;
        
        const baseDTO = this.toDTO(thietBi);
        
        return {
            ...baseDTO,
            PhongHat: phongHat ? {
                TenPhong: phongHat.TenPhong,
                LoaiPhong: phongHat.LoaiPhong
            } : null
        };
    }

    /**
     * DTO cho báo cáo bảo trì
     */
    static toMaintenanceDTO(thietBi) {
        if (!thietBi) return null;
        
        const plainObject = thietBi.toObject ? thietBi.toObject() : thietBi;
        
        return {
            MaThietBi: plainObject.MaThietBi,
            TenThietBi: plainObject.TenThietBi,
            LoaiThietBi: plainObject.LoaiThietBi,
            MaPhong: plainObject.MaPhong,
            TinhTrang: plainObject.TinhTrang,
            NgayNhap: plainObject.NgayNhap,
            CanBaoTri: plainObject.TinhTrang !== 'Tốt',
            MucDoUuTien: plainObject.TinhTrang === 'Hỏng' ? 'high' : 
                        plainObject.TinhTrang === 'Cần bảo trì' ? 'medium' : 'low'
        };
    }
}
