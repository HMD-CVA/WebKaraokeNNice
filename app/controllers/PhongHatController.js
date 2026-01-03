import PhongHatBUS from '../bus/PhongHatBUS.js';

class PhongHatController {
    // Render trang quản lý phòng hát
    async renderPhongHatPage(req, res) {
        try {
            const data = await PhongHatBUS.getAllPhongHatsWithBangGia();

            res.render('phonghat', {
                layout: 'AdminMain',
                title: 'Quản lý phòng hát & bảng giá',
                ...data,
                phonghatPage: true,
                helpers: {
                    formatNumber: function (price) {
                        return new Intl.NumberFormat('vi-VN').format(price);
                    },
                    json: function (context) {
                        return JSON.stringify(context);
                    },
                    eq: function (a, b) {
                        return a === b;
                    },
                },
            });
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Lỗi server!');
        }
    }

    // Thêm phòng hát mới
    async createPhongHat(req, res) {
        try {
            const ph = await PhongHatBUS.createPhongHat(req.body);

            res.status(200).json({
                success: true,
                message: `Thêm phòng "${ph.TenPhong}" thành công với mã ${ph.MaPhong}!`,
                data: ph,
            });
        } catch (err) {
            console.error('Lỗi thêm phòng:', err);
            res.status(400).json({
                success: false,
                error: err.message,
            });
        }
    }

    // Cập nhật phòng hát
    async updatePhongHat(req, res) {
        try {
            const { id } = req.params;
            const ph = await PhongHatBUS.updatePhongHat(id, req.body);

            res.status(200).json({
                success: true,
                message: `Cập nhật phòng "${ph.TenPhong}" thành công!`,
                data: ph,
            });
        } catch (err) {
            console.error('Lỗi cập nhật phòng:', err);
            
            if (err.message === 'Không tìm thấy phòng') {
                return res.status(404).json({
                    success: false,
                    error: err.message,
                });
            }

            res.status(400).json({
                success: false,
                error: err.message,
            });
        }
    }

    // Xóa phòng hát
    async deletePhongHat(req, res) {
        try {
            const { id } = req.params;
            const result = await PhongHatBUS.deletePhongHat(id);

            res.json(result);
        } catch (err) {
            console.error('Lỗi xóa phòng:', err);
            
            if (err.message === 'Không tìm thấy phòng hát!') {
                return res.status(404).json({ error: err.message });
            }
            
            if (err.message === 'Không thể xóa phòng đang được sử dụng!') {
                return res.status(400).json({ error: err.message });
            }

            res.status(400).json({ error: err.message });
        }
    }

    // Cập nhật ảnh phòng
    async updateImagePhongHat(req, res) {
        try {
            const { id } = req.params;
            const { LinkAnh } = req.body;

            const data = await PhongHatBUS.updateImagePhongHat(id, LinkAnh);

            res.json({
                success: true,
                message: 'Cập nhật ảnh phòng thành công',
                data,
            });
        } catch (error) {
            console.error('Lỗi cập nhật ảnh phòng:', error);

            if (error.message === 'Không tìm thấy phòng') {
                return res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }

            res.status(500).json({
                success: false,
                error: 'Lỗi server khi cập nhật ảnh phòng',
            });
        }
    }

    // Kiểm tra loại phòng có đang được sử dụng không
    async checkLoaiPhongInUse(req, res) {
        try {
            const { loaiPhong } = req.params;

            const result = await PhongHatBUS.checkLoaiPhongInUse(loaiPhong);

            res.json(result);
        } catch (err) {
            console.error('Lỗi kiểm tra loại phòng:', err);
            res.status(500).json({ error: err.message });
        }
    }

    // Lấy bảng giá theo mã phòng (cho hóa đơn)
    async getBangGiaByMaPhong(req, res) {
        try {
            const { maPhong } = req.params;

            const bangGia = await PhongHatBUS.getBangGiaByMaPhong(maPhong);

            res.json(bangGia);
        } catch (err) {
            console.error('Lỗi Server khi truy vấn bảng giá:', err);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi truy vấn bảng giá.',
            });
        }
    }

    // Lấy bảng giá theo loại phòng
    async getBangGiaByLoaiPhong(req, res) {
        try {
            const { loaiPhong } = req.params;

            const bangGia = await PhongHatBUS.getBangGiaByLoaiPhong(loaiPhong);

            res.json(bangGia);
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Lỗi server!' });
        }
    }

    // API lấy giá phòng theo khung giờ
    async getGiaPhongTheoKhungGio(req, res) {
        try {
            const { maPhong } = req.params;
            const { khungGio } = req.query;

            console.log('Lấy giá phòng:', maPhong, 'Khung giờ:', khungGio);

            const result = await PhongHatBUS.getGiaPhongTheoKhungGio(maPhong, khungGio);

            res.json(result);
        } catch (err) {
            console.error('Error:', err);
            if (err.message === 'Không tìm thấy phòng') {
                return res.status(404).json({ error: err.message });
            }
            res.status(500).json({ error: 'Lỗi server!' });
        }
    }

    // API lấy bảng giá và khung giờ hoạt động của phòng
    async getBangGiaAndKhungGioHoatDong(req, res) {
        try {
            const { maPhong } = req.params;

            const result = await PhongHatBUS.getBangGiaAndKhungGioHoatDong(maPhong);

            res.json(result);
        } catch (err) {
            console.error('Lỗi API bảng giá phòng:', err);
            if (err.message === 'Không tìm thấy phòng') {
                return res.status(404).json({ error: err.message });
            }
            res.status(500).json({ error: err.message });
        }
    }

    // API lấy danh sách phòng trống với bảng giá
    async getPhongTrongWithBangGia(req, res) {
        try {
            const phongsWithPrice = await PhongHatBUS.getPhongTrongWithBangGia();

            console.log(phongsWithPrice);
            res.json({
                success: true,
                data: phongsWithPrice,
                count: phongsWithPrice.length,
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách phòng',
                error: error.message,
            });
        }
    }
}

export default new PhongHatController();
