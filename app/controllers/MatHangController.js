import MatHangBUS from '../bus/MatHangBUS.js';

class MatHangController {
    // GET /admin/mathang - Render trang mặt hàng
    async renderMatHangPage(req, res) {
        try {
            const data = await MatHangBUS.getAllMatHangsForPage();

            res.render('mathang', {
                layout: 'AdminMain',
                title: 'Quản lý mặt hàng',
                ...data,
            });
        } catch (err) {
            console.error('Lỗi khi lấy dữ liệu mặt hàng:', err);
            res.status(500).send('Lỗi server!');
        }
    }

    // GET /api/hoadon/mathang - Lấy danh sách mặt hàng cho hóa đơn
    async getMatHangsForHoaDon(req, res) {
        try {
            const result = await MatHangBUS.getAllMatHangsForAPI();

            res.json(result);
        } catch (err) {
            console.error('Lỗi khi lấy dữ liệu mặt hàng:', err);
            res.status(500).send('Lỗi server!');
        }
    }

    // GET /api/mathang/tonkho - Lấy mặt hàng tồn kho
    async getMatHangsTonKho(req, res) {
        try {
            const result = await MatHangBUS.getMatHangsTonKho(req.query);

            res.json(result);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách mặt hàng:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách mặt hàng',
                error: error.message,
            });
        }
    }

    // GET /api/mathang - Lấy mặt hàng theo loại hoặc tất cả
    async getMatHangs(req, res) {
        try {
            const { LoaiHang } = req.query;

            const matHangs = await MatHangBUS.getMatHangsByLoaiOrAll(LoaiHang);

            res.json(matHangs);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // POST /api/mathang - Thêm mặt hàng
    async createMatHang(req, res) {
        try {
            const result = await MatHangBUS.createMatHang(req.body);

            res.status(201).json({
                success: true,
                ...result,
            });
        } catch (error) {
            console.error('Lỗi thêm mặt hàng:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi thêm mặt hàng',
                error: error.message,
            });
        }
    }

    // PUT /api/mathang/:maMH - Cập nhật mặt hàng
    async updateMatHang(req, res) {
        try {
            const { maMH } = req.params;

            const result = await MatHangBUS.updateMatHang(maMH, req.body);

            res.status(201).json({
                success: true,
                ...result,
            });
        } catch (error) {
            console.error('Lỗi cập nhật mặt hàng:', error);

            if (error.message === 'Không tìm thấy mặt hàng') {
                return res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi cập nhật mặt hàng',
                error: error.message,
            });
        }
    }

    // PUT /api/mathang/:maHang/tonkho - Cập nhật số lượng tồn kho
    async updateSoLuongTon(req, res) {
        try {
            const { soLuong } = req.body;
            const { maHang } = req.params;

            const result = await MatHangBUS.updateSoLuongTon(maHang, soLuong);

            res.json(result);
        } catch (error) {
            console.error('Lỗi cập nhật tồn kho:', error);

            if (error.message.includes('Không tìm thấy mặt hàng')) {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi server khi cập nhật tồn kho',
                error: error.message,
            });
        }
    }

    // DELETE /api/mathang/:mhID - Xóa mặt hàng
    async deleteMatHang(req, res) {
        try {
            const { mhID } = req.params;

            const result = await MatHangBUS.deleteMatHang(mhID);

            res.json(result);
        } catch (error) {
            console.error('Lỗi xóa mặt hàng:', error);

            if (error.message === 'Không tìm thấy mặt hàng') {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa mặt hàng',
                error: error.message,
            });
        }
    }
}

export default new MatHangController();
