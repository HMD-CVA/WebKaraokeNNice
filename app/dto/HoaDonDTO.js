import { BaseDTO } from './BaseDTO.js';

/**
 * HoaDon DTO
 * DTO cho thông tin hóa đơn
 */
export class HoaDonDTO extends BaseDTO {
    /**
     * Chuyển đổi HoaDon document thành DTO
     * @param {Object} hoaDon - HoaDon document từ MongoDB
     * @returns {Object} - HoaDon DTO
     */
    static toDTO(hoaDon) {
        if (!hoaDon) return null;
        
        const plainObject = hoaDon.toObject ? hoaDon.toObject() : hoaDon;
        
        return {
            _id: plainObject._id,
            MaHoaDon: plainObject.MaHoaDon,
            MaDatPhong: plainObject.MaDatPhong,
            MaKH: plainObject.MaKH,
            MaPhong: plainObject.MaPhong,
            TongTien: plainObject.TongTien,
            ThoiGianTao: plainObject.ThoiGianTao,
            ThoiGianBatDau: plainObject.ThoiGianBatDau,
            ThoiGianKetThuc: plainObject.ThoiGianKetThuc,
            TrangThai: plainObject.TrangThai,
            createdAt: plainObject.createdAt
        };
    }

    /**
     * DTO cho danh sách hóa đơn (có thông tin khách hàng và phòng)
     */
    static toDetailDTO(hoaDon, khachHang = null, phongHat = null, chiTiet = null) {
        if (!hoaDon) return null;
        
        const baseDTO = this.toDTO(hoaDon);
        
        return {
            ...baseDTO,
            KhachHang: khachHang ? {
                MaKH: khachHang.MaKH,
                TenKH: khachHang.TenKH,
                SDT: khachHang.SDT
            } : null,
            PhongHat: phongHat ? {
                MaPhong: phongHat.MaPhong,
                TenPhong: phongHat.TenPhong,
                LoaiPhong: phongHat.LoaiPhong
            } : null,
            ChiTiet: chiTiet || []
        };
    }

    /**
     * DTO cho in hóa đơn
     */
    static toPrintDTO(hoaDon, khachHang, phongHat, chiTiet) {
        if (!hoaDon) return null;
        
        const plainObject = hoaDon.toObject ? hoaDon.toObject() : hoaDon;
        
        return {
            MaHoaDon: plainObject.MaHoaDon,
            ThoiGianTao: plainObject.ThoiGianTao,
            ThoiGianBatDau: plainObject.ThoiGianBatDau,
            ThoiGianKetThuc: plainObject.ThoiGianKetThuc,
            KhachHang: {
                TenKH: khachHang?.TenKH || 'Khách lẻ',
                SDT: khachHang?.SDT || ''
            },
            PhongHat: {
                TenPhong: phongHat?.TenPhong || '',
                LoaiPhong: phongHat?.LoaiPhong || ''
            },
            ChiTiet: chiTiet || [],
            TongTien: plainObject.TongTien,
            TrangThai: plainObject.TrangThai
        };
    }

    /**
     * DTO cho thống kê doanh thu
     */
    static toStatisticsDTO(hoaDon) {
        if (!hoaDon) return null;
        
        const plainObject = hoaDon.toObject ? hoaDon.toObject() : hoaDon;
        
        return {
            MaHoaDon: plainObject.MaHoaDon,
            TongTien: plainObject.TongTien,
            ThoiGianTao: plainObject.ThoiGianTao,
            TrangThai: plainObject.TrangThai
        };
    }
}
