import { BaseDTO } from './BaseDTO.js';

/**
 * BangGiaPhong DTO
 * DTO cho bảng giá phòng
 */
export class BangGiaPhongDTO extends BaseDTO {
    /**
     * Chuyển đổi BangGiaPhong document thành DTO
     * @param {Object} bangGia - BangGiaPhong document từ MongoDB
     * @returns {Object} - BangGiaPhong DTO
     */
    static toDTO(bangGia) {
        if (!bangGia) return null;
        
        const plainObject = bangGia.toObject ? bangGia.toObject() : bangGia;
        
        return {
            _id: plainObject._id,
            MaGia: plainObject.MaGia,
            LoaiPhong: plainObject.LoaiPhong,
            KhungGio: plainObject.KhungGio,
            GiaTien: plainObject.GiaTien,
            createdAt: plainObject.createdAt
        };
    }

    /**
     * DTO nhóm giá theo loại phòng
     */
    static toGroupedDTO(bangGiaList, loaiPhong) {
        if (!Array.isArray(bangGiaList)) return null;
        
        const giaTienList = bangGiaList.map(bg => ({
            KhungGio: bg.KhungGio,
            GiaTien: bg.GiaTien
        }));
        
        const giaList = giaTienList.map(g => g.GiaTien).filter(g => g > 0);
        
        return {
            LoaiPhong: loaiPhong,
            BangGia: giaTienList,
            GiaThapNhat: giaList.length > 0 ? Math.min(...giaList) : 0,
            GiaCaoNhat: giaList.length > 0 ? Math.max(...giaList) : 0,
            SoKhungGio: giaTienList.length
        };
    }

    /**
     * DTO cho hiển thị giá công khai
     */
    static toPublicPriceDTO(bangGiaList, loaiPhong) {
        if (!Array.isArray(bangGiaList)) return null;
        
        const giaList = bangGiaList.map(bg => bg.GiaTien).filter(g => g > 0);
        
        return {
            LoaiPhong: loaiPhong,
            GiaThapNhat: giaList.length > 0 ? Math.min(...giaList) : 0,
            GiaCaoNhat: giaList.length > 0 ? Math.max(...giaList) : 0,
            MoTaGia: giaList.length > 0 ? 
                `${Math.min(...giaList).toLocaleString('vi-VN')} - ${Math.max(...giaList).toLocaleString('vi-VN')} VNĐ/giờ` : 
                'Liên hệ'
        };
    }
}
