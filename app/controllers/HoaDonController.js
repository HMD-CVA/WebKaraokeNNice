import HoaDonBUS from '../bus/HoaDonBUS.js';
import DataModel from '../model/index.js';

class HoaDonController {
    // GET /admin/hoadon - Render trang quản lý hóa đơn
    async renderHoaDonPage(req, res) {
        try {
            const [hoadons, chitiethoadons, khachhangs] = await Promise.all([
                DataModel.Data_HoaDon_Model.find({}).lean().exec(),
                DataModel.Data_ChiTietHD_Model.find({}).lean().exec(),
                DataModel.Data_KhachHang_Model.find({}).lean().exec(),
            ]);

            // Tạo map để tra cứu nhanh
            const khachhangMap = {};
            khachhangs.forEach((kh) => {
                khachhangMap[kh.MaKH] = kh;
            });

            const hoadonsWithDetails = hoadons.map((hoadon) => {
                const chitietCuaHoadon = chitiethoadons.filter(
                    (ct) => ct.MaHoaDon.toString() === hoadon.MaHoaDon.toString()
                );

                // Lấy thông tin khách hàng
                const khachhang = khachhangMap[hoadon.MaKH];

                return {
                    ...hoadon,
                    ChiTiet: chitietCuaHoadon,
                    KH: khachhang || {}, // Đảm bảo KH luôn là object
                };
            });

            res.render('hoadon', {
                layout: 'AdminMain',
                title: 'Quản lý hoá đơn',
                hoadons: hoadonsWithDetails,
            });
        } catch (err) {
            console.error('Lỗi server:', err);
            res.status(500).send('Lỗi server!');
        }
    }

    // GET /api/hoadon/:maHoaDon - Lấy thông tin hóa đơn
    async getHoaDon(req, res) {
        try {
            const { maHoaDon } = req.params;
            console.log('Tìm hóa đơn với mã:', maHoaDon);

            const result = await HoaDonBUS.getHoaDonByMa(maHoaDon);
            
            if (!result.success) {
                return res.status(404).json(result);
            }

            console.log(`📊 Tìm thấy hóa đơn`);
            res.json(result.data);
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi server!',
                error: err.message
            });
        }
    }

    // GET /api/hoadon/edit/:maHoaDon - Lấy dữ liệu hóa đơn để chỉnh sửa
    async getHoaDonForEdit(req, res) {
        try {
            const { maHoaDon } = req.params;
            console.log('Tìm hóa đơn để chỉnh sửa với mã:', maHoaDon);

            const result = await HoaDonBUS.getHoaDonForEdit(maHoaDon);
            
            if (!result.success) {
                return res.status(404).json(result);
            }

            console.log(`✅ Tìm thấy hóa đơn:`, result.data.MaHoaDon);
            console.log(`📊 Chi tiết dịch vụ:`, result.data.ChiTietHoaDon?.length || 0);

            res.json(result.data);
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi server!',
                error: err.message,
            });
        }
    }

    // GET /api/chitiethoadon/:maHoaDon - Lấy chi tiết hóa đơn
    async getChiTietHoaDon(req, res) {
        try {
            const { maHoaDon } = req.params;
            console.log('Tìm chi tiết hóa đơn với mã:', maHoaDon);

            const result = await HoaDonBUS.getChiTietHoaDon(maHoaDon);
            
            if (!result.success) {
                return res.status(404).json(result);
            }

            console.log(`📊 Tìm thấy ${result.data.length} chi tiết`);
            res.json(result.data);
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi server!',
                error: err.message
            });
        }
    }

    // POST /api/hoadon - Tạo hóa đơn mới
    async createHoaDon(req, res) {
        try {
            const hoaDonData = req.body;
            console.log('Nhận dữ liệu hóa đơn:', {
                tenKH: hoaDonData.tenKH,
                sdtKH: hoaDonData.sdtKH,
                maPhong: hoaDonData.maPhong,
                soDichVu: hoaDonData.dichVu?.length || 0,
            });

            const result = await HoaDonBUS.createHoaDon(hoaDonData);
            
            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);
        } catch (err) {
            console.error('Lỗi thêm hóa đơn:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi server!',
                error: err.message,
            });
        }
    }

    // PUT /api/hoadon/edit/:maHoaDon - Cập nhật hóa đơn
    async updateHoaDon(req, res) {
        try {
            const { maHoaDon } = req.params;
            const updateData = req.body;
            
            console.log('Nhận dữ liệu cập nhật hóa đơn:', {
                maHoaDon,
                maPhong: updateData.maPhong,
                tongTien: updateData.tongTien,
                soDichVu: updateData.dichVu?.length || 0,
            });

            const result = await HoaDonBUS.updateHoaDon(maHoaDon, updateData);
            
            if (!result.success) {
                return res.status(404).json(result);
            }

            console.log('Cập nhật hóa đơn thành công');
            res.status(200).json(result);
        } catch (error) {
            console.error('Lỗi cập nhật hóa đơn:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi cập nhật hóa đơn',
                error: error.message,
            });
        }
    }

    // PUT /api/hoadon/thanhtoan/:maHoaDon - Thanh toán hóa đơn
    async thanhToanHoaDon(req, res) {
        try {
            const { maHoaDon } = req.params;
            const thanhToanData = req.body;

            console.log('Nhận yêu cầu thanh toán:', {
                maHoaDon,
                thoiGianKetThuc: thanhToanData.thoiGianKetThuc,
                tongTien: thanhToanData.tongTien,
                trangThai: thanhToanData.trangThai,
            });

            const result = await HoaDonBUS.thanhToanHoaDon(maHoaDon, thanhToanData);
            
            if (!result.success) {
                return res.status(404).json(result);
            }

            console.log(`✅ Đã thanh toán hóa đơn ${maHoaDon}`);
            res.json(result);
        } catch (error) {
            console.error('Lỗi khi thanh toán hóa đơn:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi thanh toán hóa đơn',
                error: error.message,
            });
        }
    }

    // DELETE /api/delete/hoadon/:maHoaDon - Xóa hóa đơn
    async deleteHoaDon(req, res) {
        try {
            const { maHoaDon } = req.params;
            console.log(`🗑️ Nhận yêu cầu xóa hóa đơn: ${maHoaDon}`);

            const result = await HoaDonBUS.deleteHoaDon(maHoaDon);
            
            if (!result.success) {
                return res.status(404).json(result);
            }

            console.log(`✅ Đã xóa hóa đơn ${maHoaDon}`);
            res.json(result);
        } catch (error) {
            console.error('Lỗi khi xóa hóa đơn:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa hóa đơn',
                error: error.message,
            });
        }
    }
}

export default new HoaDonController();
