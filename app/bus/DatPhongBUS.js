import DatPhongDAO from '../dao/DatPhongDAO.js';
import KhachHangDAO from '../dao/KhachHangDAO.js';
import PhongHatDAO from '../dao/PhongHatDAO.js';
import { generateCode } from '../utils/codeGenerator.js';
import DataModel from '../model/index.js';

class DatPhongBUS {
    // Tạo đơn đặt phòng mới (từ trang chủ)
    async createDatPhong(datPhongData) {
        const {
            tenKH,
            sdt,
            email,
            maPhong,
            tenPhong,
            giaTien,
            loaiPhong,
            thoiGianBatDau,
            thoiGianKetThuc,
            songuoi,
            ghiChu,
            trangThai,
        } = datPhongData;

        // 1. Kiểm tra xem khách hàng đã tồn tại chưa (dựa vào SDT)
        let khachHang = await KhachHangDAO.findByPhone(sdt);

        // Tạo mã khách hàng mới nếu chưa tồn tại
        if (!khachHang) {
            const maKHs = await generateCode(
                'KH',
                DataModel.Data_KhachHang_Model,
                'MaKH'
            );

            khachHang = await KhachHangDAO.create({
                MaKH: maKHs,
                TenKH: tenKH,
                SDT: sdt,
                Email: email || '',
                createdAt: new Date(),
            });
        } else {
            // Cập nhật thông tin khách hàng nếu đã tồn tại
            await DataModel.Data_KhachHang_Model.findOneAndUpdate(
                { SDT: sdt },
                {
                    TenKH: tenKH,
                    Email: email,
                    updatedAt: new Date(),
                }
            );
        }

        // 2. Tạo mã đặt phòng mới
        const maDatPhongs = await generateCode(
            'DP',
            DataModel.Data_DatPhong_Model,
            'MaDatPhong'
        );

        // 3. Validate và parse datetime
        const parsedThoiGianBatDau = new Date(thoiGianBatDau);
        if (isNaN(parsedThoiGianBatDau.getTime())) {
            throw new Error('Thời gian bắt đầu không hợp lệ');
        }

        // 4. Tạo đơn đặt phòng
        const datPhong = await DatPhongDAO.create({
            MaDatPhong: maDatPhongs,
            MaKH: khachHang.MaKH,
            MaPhong: maPhong,
            ThoiGianBatDau: parsedThoiGianBatDau,
            ThoiGianKetThuc: null, // Auto set null khi đặt phòng
            SoNguoi: songuoi,
            TrangThai: trangThai || 'Đã đặt',
            GhiChu: ghiChu || '',
            createdAt: new Date(),
        });

        // 4. Cập nhật trạng thái phòng thành "Đã đặt trước"
        const phongCapNhat = await PhongHatDAO.updateTrangThai(maPhong, 'Đã đặt trước');

        if (!phongCapNhat) {
            console.warn(`⚠️ Không tìm thấy phòng với mã: ${maPhong}`);
        } else {
            console.log(`✅ Đã cập nhật trạng thái phòng ${maPhong} thành "Đã đặt trước"`);
        }

        return {
            success: true,
            message: 'Đặt phòng thành công',
            data: {
                maDatPhong: datPhong.MaDatPhong,
                maKH: khachHang.MaKH,
                tenKH: khachHang.TenKH,
                sdt: khachHang.SDT,
                tenPhong: tenPhong,
                loaiPhong: loaiPhong,
                giaTien: giaTien,
                thoiGianBatDau: datPhong.ThoiGianBatDau,
                thoiGianKetThuc: datPhong.ThoiGianKetThuc,
                songuoi: datPhong.SoNguoi,
                trangThai: datPhong.TrangThai,
                phongDaCapNhat: !!phongCapNhat,
            },
        };
    }

    // Lấy tất cả đơn đặt phòng
    async getAllDatPhongs() {
        return await DatPhongDAO.findAll();
    }

    // Lấy đơn đặt phòng theo MaDatPhong (kèm thông tin khách hàng và phòng)
    async getDatPhongByMaDatPhong(maDatPhong) {
        const datPhong = await DatPhongDAO.findByMaDatPhong(maDatPhong);

        if (!datPhong) {
            throw new Error('Không tìm thấy đơn đặt phòng');
        }

        // Tìm khách hàng tương ứng
        const khachHang = await KhachHangDAO.findByMaKH(datPhong.MaKH);

        // Tìm thông tin phòng
        const phong = await PhongHatDAO.findByMaPhong(datPhong.MaPhong);

        // Kết hợp dữ liệu
        const result = {
            ...datPhong,
            KhachHang: khachHang || null, // Thêm thông tin khách hàng
            Phong: phong ? {
                MaPhong: phong.MaPhong,
                TenPhong: phong.TenPhong,
                LoaiPhong: phong.LoaiPhong,
                SucChua: phong.SucChua,
                TrangThai: phong.TrangThai
            } : null, // Thêm thông tin phòng
        };

        console.log('📊 Tìm thấy đặt phòng, khách hàng và thông tin phòng');
        
        return result;
    }

    // Cập nhật đơn đặt phòng
    async updateDatPhong(maDatPhong, datPhongData) {
        const { MaPhong, SoNguoi, ThoiGianBatDau, GhiChu } = datPhongData;

        console.log('Cập nhật đặt phòng:', { maDatPhong, MaPhong, SoNguoi, ThoiGianBatDau });

        // 1. Tìm đơn đặt phòng hiện tại
        const datPhong = await DatPhongDAO.findByMaDatPhong(maDatPhong);

        if (!datPhong) {
            throw new Error('Không tìm thấy đơn đặt phòng');
        }

        // 2. Lưu phòng cũ để cập nhật trạng thái
        const maPhongCu = datPhong.MaPhong;

        // 3. Nếu đổi phòng, cập nhật trạng thái phòng cũ về "Trống" và phòng mới thành "Đã đặt trước"
        if (maPhongCu !== MaPhong) {
            console.log(`🔄 Đổi phòng từ ${maPhongCu} sang ${MaPhong}`);

            // Cập nhật phòng cũ về "Trống"
            await PhongHatDAO.updateTrangThai(maPhongCu, 'Trống');
            console.log(`✅ Đã cập nhật phòng cũ ${maPhongCu} về "Trống"`);

            // Cập nhật phòng mới thành "Đã đặt trước"
            await PhongHatDAO.updateTrangThai(MaPhong, 'Đã đặt trước');
            console.log(`✅ Đã cập nhật phòng mới ${MaPhong} thành "Đã đặt trước"`);
        }

        // 4. Validate và parse datetime
        const parsedThoiGianBatDau = new Date(ThoiGianBatDau);
        if (isNaN(parsedThoiGianBatDau.getTime())) {
            throw new Error('Thời gian bắt đầu không hợp lệ');
        }

        // 5. Cập nhật đơn đặt phòng
        const updatedDatPhong = await DatPhongDAO.updateByMaDatPhong(maDatPhong, {
            MaPhong,
            SoNguoi,
            ThoiGianBatDau: parsedThoiGianBatDau,
            GhiChu: GhiChu || datPhong.GhiChu,
            updatedAt: new Date(),
        });

        console.log('Đã cập nhật đơn đặt phòng:', updatedDatPhong.MaDatPhong);

        return {
            success: true,
            message: 'Cập nhật đặt phòng thành công',
            data: {
                maDatPhong: updatedDatPhong.MaDatPhong,
                maPhong: updatedDatPhong.MaPhong,
                maPhongCu: maPhongCu,
                doiPhong: maPhongCu !== MaPhong,
            },
        };
    }

    // Hủy đơn đặt phòng
    async huyDatPhong(maDatPhong) {
        const datPhong = await DatPhongDAO.findByMaDatPhong(maDatPhong);

        if (!datPhong) {
            throw new Error('Không tìm thấy đơn đặt phòng');
        }

        // Cập nhật trạng thái đơn đặt phòng
        await DatPhongDAO.updateByMaDatPhong(maDatPhong, {
            TrangThai: 'Đã hủy',
            updatedAt: new Date(),
        });

        // Cập nhật trạng thái phòng về "Trống"
        await PhongHatDAO.updateTrangThai(datPhong.MaPhong, 'Trống');

        return {
            success: true,
            message: 'Hủy đặt phòng thành công',
            data: {
                maDatPhong: datPhong.MaDatPhong,
                maPhong: datPhong.MaPhong,
                trangThaiPhong: 'Trống'
            }
        };
    }

    // Xóa đơn đặt phòng
    async deleteDatPhong(maDatPhong) {
        const datPhong = await DatPhongDAO.deleteByMaDatPhong(maDatPhong);

        if (!datPhong) {
            throw new Error('Không tìm thấy đơn đặt phòng');
        }

        return { message: 'Xóa đơn đặt phòng thành công' };
    }

    // Check-in: Chuyển đặt phòng thành hóa đơn
    async checkInDatPhong(maDatPhong) {
        const datPhong = await DatPhongDAO.findByMaDatPhong(maDatPhong);

        if (!datPhong) {
            throw new Error('Không tìm thấy đặt phòng');
        }

        // Kiểm tra trạng thái
        if (datPhong.TrangThai !== 'Đã đặt' && datPhong.TrangThai !== 'Sắp tới') {
            throw new Error('Chỉ có thể check-in đặt phòng có trạng thái "Đã đặt" hoặc "Sắp tới"');
        }

        // Tạo mã hoá đơn tự động
        const maHD = await generateCode('HD', DataModel.Data_HoaDon_Model, 'MaHoaDon');
        console.log('Mã hoá đơn mới:', maHD);

        // Tạo hóa đơn mới với trạng thái "Chưa thanh toán"
        const hoaDon = await DataModel.Data_HoaDon_Model.create({
            MaHoaDon: maHD,
            MaDatPhong: maDatPhong,
            MaKH: datPhong.MaKH,
            MaPhong: datPhong.MaPhong,
            ThoiGianBatDau: new Date(), // Bắt đầu từ thời điểm check-in
            ThoiGianKetThuc: null,
            TrangThai: 'Chưa thanh toán',
            TongTien: 0, // Sẽ tính toán khi check-out
        });

        // Tạo mã chi tiết hoá đơn
        const maCTHD = await generateCode('CTHD', DataModel.Data_ChiTietHD_Model, 'MaCTHD');

        // Tạo chi tiết hóa đơn cho dịch vụ thuê phòng
        await DataModel.Data_ChiTietHD_Model.create({
            MaCTHD: maCTHD,
            MaHoaDon: maHD,
            MaHang: datPhong.MaPhong,
            SoLuong: 1,
            DonGia: 10000, // Giá tạm
            ThanhTien: 0, // Sẽ tính khi check-out
            LoaiDichVu: 'Thuê phòng',
        });

        // Cập nhật trạng thái đặt phòng thành "Hoàn thành"
        await DatPhongDAO.updateByMaDatPhong(maDatPhong, {
            TrangThai: 'Hoàn thành',
            GhiChu: `Đã check-in và chuyển thành hóa đơn ${hoaDon.MaHoaDon}`,
        });

        return {
            success: true,
            message: 'Check-in thành công và đã tạo hóa đơn',
            data: {
                hoaDon: {
                    MaHoaDon: hoaDon.MaHoaDon,
                    MaPhong: hoaDon.MaPhong,
                    MaKH: hoaDon.MaKH,
                    ThoiGianBatDau: hoaDon.ThoiGianBatDau,
                    TrangThai: hoaDon.TrangThai
                }
            }
        };
    }
}

export default new DatPhongBUS();
