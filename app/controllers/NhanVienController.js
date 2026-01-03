import NhanVienBUS from '../bus/NhanVienBUS.js';

class NhanVienController {
    // POST /api/login - Đăng nhập
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const result = await NhanVienBUS.login(email, password);

            // Set cookie
            res.cookie('authToken', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.json({ message: 'Đăng nhập thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server: ' + error.message });
        }
    }

    // POST /api/logout - Đăng xuất
    async logout(req, res) {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });
        res.redirect('/admin-login');
    }

    // GET /admin/nhanvien - Render trang nhân viên
    async renderNhanVienPage(req, res) {
        try {
            const nhanviens = await NhanVienBUS.getAllNhanViens();

            res.render('nhanvien', {
                layout: 'AdminMain',
                title: 'Quản lý nhân viên',
                nhanviens,
            });
        } catch (err) {
            res.status(500).send('Lỗi server!');
        }
    }

    // GET /api/nhanvien/:maNV - Lấy thông tin nhân viên
    async getNhanVien(req, res) {
        try {
            const { maNV } = req.params;

            const nhanVien = await NhanVienBUS.getNhanVienByMaNV(maNV);

            res.json(nhanVien);
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Lỗi server!' });
        }
    }

    // POST /api/nhanvien - Thêm nhân viên
    async createNhanVien(req, res) {
        try {
            const result = await NhanVienBUS.createNhanVien(req.body);

            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // PUT /api/nhanvien/:maNV - Cập nhật nhân viên
    async updateNhanVien(req, res) {
        try {
            const { maNV } = req.params;

            const result = await NhanVienBUS.updateNhanVien(maNV, req.body);

            res.json(result);
        } catch (error) {
            if (error.message === 'Không tìm thấy nhân viên') {
                return res.status(404).json({ error: error.message });
            }

            res.status(400).json({ error: error.message });
        }
    }

    // DELETE /api/nhanvien/:maNV - Xóa nhân viên
    async deleteNhanVien(req, res) {
        try {
            const { maNV } = req.params;

            const result = await NhanVienBUS.deleteNhanVien(maNV);

            res.json(result);
        } catch (error) {
            if (error.message === 'Không tìm thấy nhân viên') {
                return res.status(404).json({ error: error.message });
            }

            res.status(400).json({ error: error.message });
        }
    }

    // GET /admin/profile - Render trang profile
    async renderProfilePage(req, res) {
        try {
            const id = req.user.id;
            const nhanvien = await NhanVienBUS.getProfile(id);

            res.render('profile', {
                layout: 'AdminMain',
                title: 'Thông tin cá nhân',
                nhanvien
            });
        } catch (error) {
            res.status(500).send('Lỗi server!');
        }
    }

    // GET /api/profile - Lấy thông tin profile
    async getProfile(req, res) {
        try {
            const id = req.user.id;
            const user = await NhanVienBUS.getProfile(id);

            res.json(user);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // PUT /api/profile - Cập nhật thông tin profile
    async updateProfile(req, res) {
        try {
            const id = req.user.id;
            const result = await NhanVienBUS.updateProfile(id, req.body);

            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // PUT /api/profile/password - Đổi mật khẩu
    async updatePassword(req, res) {
        try {
            const id = req.user.id;
            const { currentPassword, newPassword } = req.body;

            const result = await NhanVienBUS.updatePassword(id, currentPassword, newPassword);

            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // PUT /api/nhanvien/:maNV/permission - Cập nhật quyền (vai trò) nhân viên
    async updatePermission(req, res) {
        try {
            const { maNV } = req.params;
            const { VaiTro } = req.body;

            if (!VaiTro) {
                return res.status(400).json({ error: 'Vai trò không được để trống' });
            }

            const result = await NhanVienBUS.updatePermission(maNV, VaiTro);

            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new NhanVienController();
