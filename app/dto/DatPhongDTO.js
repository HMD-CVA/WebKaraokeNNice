import { BaseDTO } from './BaseDTO.js';

/**
 * DatPhong DTO
 * DTO cho thông tin đặt phòng
 */
export class DatPhongDTO extends BaseDTO {
    /**
     * Chuyển đổi DatPhong document thành DTO
     * @param {Object} datPhong - DatPhong document từ MongoDB
     * @returns {Object} - DatPhong DTO
     */
    static toDTO(datPhong) {
        if (!datPhong) return null;
        
        const plainObject = datPhong.toObject ? datPhong.toObject() : datPhong;
        
        return {
            _id: plainObject._id,
            MaDatPhong: plainObject.MaDatPhong,
            MaKH: plainObject.MaKH,
            MaPhong: plainObject.MaPhong,
            ThoiGianBatDau: plainObject.ThoiGianBatDau,
            ThoiGianKetThuc: plainObject.ThoiGianKetThuc,
            SoNguoi: plainObject.SoNguoi,
            TrangThai: plainObject.TrangThai,
            GhiChu: plainObject.GhiChu || '',
            createdAt: plainObject.createdAt
        };
    }

    /**
     * DTO với thông tin khách hàng và phòng (dùng khi populate)
     */
    static toDetailDTO(datPhong, khachHang = null, phongHat = null) {
        if (!datPhong) return null;
        
        const baseDTO = this.toDTO(datPhong);
        
        return {
            ...baseDTO,
            KhachHang: khachHang ? {
                TenKH: khachHang.TenKH,
                SDT: khachHang.SDT,
                Email: khachHang.Email
            } : null,
            PhongHat: phongHat ? {
                TenPhong: phongHat.TenPhong,
                LoaiPhong: phongHat.LoaiPhong,
                SucChua: phongHat.SucChua
            } : null
        };
    }

    /**
     * DTO cho lịch đặt phòng (calendar view)
     */
    static toCalendarDTO(datPhong) {
        if (!datPhong) return null;
        
        const plainObject = datPhong.toObject ? datPhong.toObject() : datPhong;
        
        return {
            id: plainObject.MaDatPhong,
            title: `Phòng ${plainObject.MaPhong}`,
            start: plainObject.ThoiGianBatDau,
            end: plainObject.ThoiGianKetThuc,
            status: plainObject.TrangThai,
            MaKH: plainObject.MaKH,
            MaPhong: plainObject.MaPhong
        };
    }
}
