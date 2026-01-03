import ThietBiBUS from '../bus/ThietBiBUS.js';

class ThietBiController {
    // GET /admin/thietbi - Render trang thiết bị
    async renderThietBiPage(req, res) {
        try {
            const data = await ThietBiBUS.getAllThietBisForPage();

            res.render('thietbi', {
                layout: 'AdminMain',
                title: 'Quản lý thiết bị',
                ...data,
            });
        } catch (err) {
            res.status(500).send('Lỗi server!');
        }
    }

    // GET /api/thietbi/:maTB - Lấy thông tin thiết bị
    async getThietBi(req, res) {
        try {
            const { maTB } = req.params;

            const thietbis = await ThietBiBUS.getThietBiByMaThietBi(maTB);

            res.json(thietbis);
        } catch (err) {
            if (err.message === 'Không tìm thấy thiết bị') {
                return res.status(404).json({ error: err.message });
            }

            res.status(500).send('Lỗi server!');
        }
    }

    // POST /api/thietbi - Thêm thiết bị
    async createThietBi(req, res) {
        try {
            console.log('API /api/thietbi ĐƯỢC GỌI!');
            console.log('Body received:', req.body);

            const result = await ThietBiBUS.createThietBi(req.body);

            res.json({
                success: true,
                ...result,
            });
        } catch (error) {
            console.error('Lỗi lưu thiết bị:', error);

            if (error.message.includes('Thiếu thông tin bắt buộc')) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi khi lưu thiết bị: ' + error.message,
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            });
        }
    }

    // PUT /api/thietbi/:maTB - Cập nhật thiết bị
    async updateThietBi(req, res) {
        try {
            const { maTB } = req.params;

            const result = await ThietBiBUS.updateThietBi(maTB, req.body);

            res.json(result);
        } catch (error) {
            console.error('Lỗi cập nhật thiết bị:', error);

            if (error.message === 'Không tìm thấy thiết bị') {
                return res.status(404).json({ error: error.message });
            }

            res.status(400).json({ error: error.message });
        }
    }

    // PUT /api/thietbi/:maTB/status - Cập nhật trạng thái thiết bị
    async updateTrangThaiThietBi(req, res) {
        try {
            const { maTB } = req.params;
            const { TinhTrang } = req.body;

            const result = await ThietBiBUS.updateTrangThaiThietBi(maTB, TinhTrang);

            res.json({
                success: true,
                ...result,
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái thiết bị:', error);

            if (
                error.message === 'Trạng thái là bắt buộc' ||
                error.message === 'Trạng thái không hợp lệ'
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message,
                });
            }

            if (error.message === 'Không tìm thấy thiết bị') {
                return res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }

            res.status(500).json({
                success: false,
                error: 'Lỗi server khi cập nhật trạng thái',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }

    // DELETE /api/thietbi/:maTB - Xóa thiết bị
    async deleteThietBi(req, res) {
        try {
            const { maTB } = req.params;

            const result = await ThietBiBUS.deleteThietBi(maTB);

            res.json(result);
        } catch (error) {
            console.error('Lỗi xóa thiết bị:', error);

            if (error.message === 'Không tìm thấy thiết bị') {
                return res.status(404).json({ error: error.message });
            }

            res.status(400).json({ error: error.message });
        }
    }
}

export default new ThietBiController();
