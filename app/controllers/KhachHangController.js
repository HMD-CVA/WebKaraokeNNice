import KhachHangBUS from '../bus/KhachHangBUS.js';

class KhachHangController {
    // GET /admin/khachhang - Render trang khách hàng
    async renderKhachHangPage(req, res) {
        try {
            const khachhangs = await KhachHangBUS.getAllKhachHangs();

            res.render('khachhang', {
                layout: 'AdminMain',
                title: 'Thông tin khách hàng',
                khachhangs,
            });
        } catch (err) {
            console.error('Lỗi khi lấy danh sách khách hàng:', err);
            res.status(500).send('Lỗi server!');
        }
    }

    // GET /api/khachhang/:maKH - Lấy thông tin khách hàng
    async getKhachHang(req, res) {
        try {
            const { maKH } = req.params;

            const khachHang = await KhachHangBUS.getKhachHangByMaKH(maKH);

            res.json(khachHang);
        } catch (err) {
            console.error('Error:', err);

            if (err.message === 'Không tìm thấy khách hàng') {
                return res.status(404).json({ error: err.message });
            }

            res.status(500).json({ error: 'Lỗi server!' });
        }
    }

    // POST /api/khachhang - Thêm khách hàng
    async createKhachHang(req, res) {
        try {
            const kh = await KhachHangBUS.createKhachHang(req.body);

            res.status(200).json(kh);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // PUT /api/khachhang/:id - Cập nhật khách hàng
    async updateKhachHang(req, res) {
        try {
            const { id } = req.params;

            const kh = await KhachHangBUS.updateKhachHang(id, req.body);

            res.json(kh);
        } catch (err) {
            if (err.message === 'Không tìm thấy khách hàng') {
                return res.status(404).json({ error: err.message });
            }

            res.status(400).json({ error: err.message });
        }
    }

    // DELETE /api/khachhang/:id - Xóa khách hàng
    async deleteKhachHang(req, res) {
        try {
            const { id } = req.params;

            const result = await KhachHangBUS.deleteKhachHang(id);

            res.json(result);
        } catch (err) {
            if (err.message === 'Không tìm thấy khách hàng') {
                return res.status(404).json({ error: err.message });
            }

            res.status(400).json({ error: err.message });
        }
    }

    // GET /api/khachhang - Lấy danh sách khách hàng hoặc tìm theo phone (API)
    async getAllKhachHangs(req, res) {
        try {
            const { phone } = req.query;
            
            // Nếu có phone query, tìm khách hàng theo số điện thoại
            if (phone) {
                const khachHang = await KhachHangBUS.getKhachHangByPhone(phone);
                return res.json(khachHang);
            }
            
            // Nếu không có phone, trả về tất cả
            const khachhangs = await KhachHangBUS.getKhachHangsForAPI(req.query);

            res.json({
                success: true,
                data: khachhangs,
                count: khachhangs.length,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
}

export default new KhachHangController();
