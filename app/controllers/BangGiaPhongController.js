import BangGiaPhongBUS from '../bus/BangGiaPhongBUS.js';

class BangGiaPhongController {
    // POST /api/banggia/:loaiPhong - Lưu bảng giá cho một loại phòng
    async saveBangGia(req, res) {
        try {
            const { loaiPhong, bangGia } = req.body;

            const result = await BangGiaPhongBUS.saveBangGiaForLoaiPhong(loaiPhong, bangGia);

            res.json({
                success: true,
                message: `Cập nhật thành công ${result.soKhungGio} khung giờ cho loại phòng "${loaiPhong}"!`,
                data: result,
            });
        } catch (error) {
            console.error('Lỗi lưu bảng giá:', error);

            if (
                error.message.includes('Dữ liệu không hợp lệ') ||
                error.message.includes('Vui lòng thêm') ||
                error.message.includes('thiếu thông tin') ||
                error.message.includes('không hợp lệ')
            ) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi khi lưu bảng giá: ' + error.message,
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            });
        }
    }

    // PUT /api/banggia/:loaiPhong - Cập nhật bảng giá cho một loại phòng
    async updateBangGia(req, res) {
        try {
            const { loaiPhong, bangGia } = req.body;

            const result = await BangGiaPhongBUS.saveBangGiaForLoaiPhong(loaiPhong, bangGia);

            res.json({
                success: true,
                message: `Cập nhật thành công ${result.soKhungGio} khung giờ cho loại phòng "${loaiPhong}"!`,
                data: result,
            });
        } catch (error) {
            console.error('Lỗi lưu bảng giá:', error);

            if (
                error.message.includes('Dữ liệu không hợp lệ') ||
                error.message.includes('Vui lòng thêm') ||
                error.message.includes('thiếu thông tin') ||
                error.message.includes('không hợp lệ')
            ) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi khi lưu bảng giá: ' + error.message,
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            });
        }
    }

    // POST /api/loaiphong - Quản lý loại phòng (thêm/sửa/xóa)
    async manageLoaiPhong(req, res) {
        try {
            console.log('=== 🚨 API /api/loaiphong ===');
            console.log('Request body:', req.body);

            const { TenLoaiPhong, Action, OldRoomType } = req.body;

            // VALIDATION
            if (!TenLoaiPhong || !Action) {
                return res.status(400).json({
                    error: 'Thiếu thông tin bắt buộc: TenLoaiPhong và Action',
                });
            }

            const result = await BangGiaPhongBUS.manageLoaiPhong(
                Action,
                TenLoaiPhong,
                OldRoomType
            );

            res.json({
                success: true,
                ...result,
            });
        } catch (err) {
            console.error('LỖI SERVER CHI TIẾT:');
            console.error('Message:', err.message);
            console.error('Stack:', err.stack);

            if (
                err.message === 'Loại phòng đã tồn tại!' ||
                err.message === 'Thiếu thông tin loại phòng cũ!' ||
                err.message === 'Tên loại phòng mới đã tồn tại!' ||
                err.message.includes('Không thể xóa!') ||
                err.message === 'Không tìm thấy loại phòng để sửa!' ||
                err.message === 'Không tìm thấy loại phòng để xóa!' ||
                err.message === 'Action không hợp lệ!'
            ) {
                return res.status(400).json({
                    error: err.message,
                });
            }

            if (err.message === 'Không tìm thấy loại phòng để sửa!') {
                return res.status(404).json({
                    error: err.message,
                });
            }

            res.status(500).json({
                error: 'Lỗi server: ' + err.message,
            });
        }
    }

    // DELETE /api/banggia/:loaiPhong - Xóa bảng giá
    async deleteBangGia(req, res) {
        try {
            const { loaiPhong } = req.params;

            const result = await BangGiaPhongBUS.deleteBangGiaByLoaiPhong(loaiPhong);

            res.json({
                success: true,
                ...result,
            });
        } catch (error) {
            console.error('Lỗi xóa bảng giá:', error);

            if (error.message.includes('Không thể xóa loại phòng')) {
                return res.status(400).json({
                    success: false,
                    error: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa bảng giá: ' + error.message,
            });
        }
    }

    // DELETE /api/banggiaphong/:loaiPhong - Xóa bảng giá (phiên bản đơn giản hơn)
    async deleteBangGiaPhong(req, res) {
        try {
            const { loaiPhong } = req.params;

            const deleteResult = await BangGiaPhongDAO.deleteByLoaiPhong(loaiPhong);

            console.log('Đã xóa:', deleteResult.deletedCount, 'khung giờ');

            res.json({
                success: true,
                message: `Đã xóa ${deleteResult.deletedCount} khung giờ`,
                deletedCount: deleteResult.deletedCount,
            });
        } catch (error) {
            console.error('Lỗi xóa bảng giá:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa bảng giá: ' + error.message,
            });
        }
    }

    // GET /api/loaiphong/check-loai-phong/:loaiPhong - Kiểm tra loại phòng có đang được sử dụng
    async checkLoaiPhongInUse(req, res) {
        try {
            const { loaiPhong } = req.params;

            const result = await BangGiaPhongBUS.checkLoaiPhongInUse(loaiPhong);

            res.json(result);
        } catch (err) {
            console.error('Lỗi kiểm tra loại phòng:', err);
            res.status(500).json({ error: err.message });
        }
    }
}

export default new BangGiaPhongController();
