import DatPhongBUS from '../bus/DatPhongBUS.js';
import KhachHangBUS from '../bus/KhachHangBUS.js';
import PhongHatBUS from '../bus/PhongHatBUS.js';

class DatPhongController {
    // GET /admin/datphong - Render trang quản lý đặt phòng
    async renderDatPhongPage(req, res) {
        try {
            const [khachhangs, datphongs, phongsTrong] = await Promise.all([
                KhachHangBUS.getAllKhachHangs(),
                DatPhongBUS.getAllDatPhongs(),
                PhongHatBUS.getPhongsByTrangThai('Trống')
            ]);

            // Map thông tin khách hàng vào đơn đặt phòng
            const datPhongKH = datphongs.map((datphong) => {
                const khachHang = khachhangs.find(
                    (kh) => kh.MaKH === datphong.MaKH
                );

                return {
                    ...datphong,
                    ChiTiet: khachHang ? [khachHang] : [],
                };
            });

            // Lấy danh sách phòng đang được đặt
            const maPhongDangDat = [...new Set(datphongs.map(dp => dp.MaPhong))];
            const phongsDangDat = await PhongHatBUS.getPhongsByMaPhongs(maPhongDangDat);
            
            // Gộp lại và loại bỏ trùng lặp
            const phongMap = new Map();
            [...phongsTrong, ...phongsDangDat].forEach(p => {
                phongMap.set(p.MaPhong, p);
            });
            const phongs = Array.from(phongMap.values());

            res.render('datphong', {
                layout: 'AdminMain',
                title: 'Quản lý đặt phòng',
                datPhongKH,
                khachhangs,
                phongs,
            });
        } catch (error) {
            console.error('Lỗi render trang đặt phòng:', error);
            res.status(500).send('Lỗi server!');
        }
    }

    // POST /api/datphong - Tạo đơn đặt phòng mới
    async createDatPhong(req, res) {
        try {
            const result = await DatPhongBUS.createDatPhong(req.body);

            res.status(201).json(result);
        } catch (error) {
            console.error('Lỗi đặt phòng:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi đặt phòng',
                error: error.message,
            });
        }
    }

    // GET /api/datphong/:maDatPhong - Lấy thông tin đơn đặt phòng
    async getDatPhong(req, res) {
        try {
            const { maDatPhong } = req.params;

            const datPhong = await DatPhongBUS.getDatPhongByMaDatPhong(maDatPhong);

            res.json(datPhong);
        } catch (err) {
            console.error('Error:', err);

            if (err.message === 'Không tìm thấy đơn đặt phòng') {
                return res.status(404).json({ error: err.message });
            }

            res.status(500).json({ error: 'Lỗi server!' });
        }
    }

    // PUT /api/datphong/:maDatPhong - Cập nhật đơn đặt phòng
    async updateDatPhong(req, res) {
        try {
            const { maDatPhong } = req.params;

            const result = await DatPhongBUS.updateDatPhong(maDatPhong, req.body);

            res.json(result);
        } catch (err) {
            if (err.message === 'Không tìm thấy đơn đặt phòng') {
                return res.status(404).json({ error: err.message });
            }

            res.status(400).json({ error: err.message });
        }
    }

    // PUT /api/datphong/:maDatPhong/huy - Hủy đơn đặt phòng
    async huyDatPhong(req, res) {
        try {
            const { maDatPhong } = req.params;

            const result = await DatPhongBUS.huyDatPhong(maDatPhong);

            res.json(result);
        } catch (err) {
            if (err.message === 'Không tìm thấy đơn đặt phòng') {
                return res.status(404).json({ error: err.message });
            }

            res.status(400).json({ error: err.message });
        }
    }

    // DELETE /api/datphong/:maDatPhong - Xóa đơn đặt phòng
    async deleteDatPhong(req, res) {
        try {
            const { maDatPhong } = req.params;

            const result = await DatPhongBUS.deleteDatPhong(maDatPhong);

            res.json(result);
        } catch (err) {
            if (err.message === 'Không tìm thấy đơn đặt phòng') {
                return res.status(404).json({ error: err.message });
            }

            res.status(400).json({ error: err.message });
        }
    }

    // PUT /api/datphong/:maDatPhong/checkin - Check-in và tạo hóa đơn
    async checkInDatPhong(req, res) {
        try {
            const { maDatPhong } = req.params;

            const result = await DatPhongBUS.checkInDatPhong(maDatPhong);

            res.json(result);
        } catch (err) {
            if (err.message === 'Không tìm thấy đặt phòng') {
                return res.status(404).json({ error: err.message });
            }

            res.status(400).json({ error: err.message });
        }
    }
}

export default new DatPhongController();
