import NhanVienDAO from '../dao/NhanVienDAO.js';
import DataModel from '../model/index.js';
import { generateCode } from '../utils/codeGenerator.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class NhanVienBUS {
    // Đăng nhập
    async login(email, password) {
        const nhanVien = await NhanVienDAO.findByEmail(email);

        if (!nhanVien) {
            throw new Error('Email hoặc mật khẩu không đúng');
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, nhanVien.Password);

        if (!isMatch) {
            throw new Error('Email hoặc mật khẩu không đúng');
        }

        // Tạo JWT token
        const token = jwt.sign(
            {
                id: nhanVien._id,
                email: nhanVien.Email,
                ten: nhanVien.TenNV,
                vaiTro: nhanVien.VaiTro
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        return {
            success: true,
            token,
            user: {
                _id: nhanVien._id,
                MaNV: nhanVien.MaNV,
                Ten: nhanVien.Ten,
                Email: nhanVien.Email,
                SDT: nhanVien.SDT,
            },
        };
    }

    // Lấy danh sách nhân viên
    async getAllNhanViens() {
        return await NhanVienDAO.findAll();
    }

    // Lấy thông tin nhân viên theo MaNV
    async getNhanVienByMaNV(maNV) {
        console.log('Đang tìm nhân viên với mã:', maNV);

        const nhanVien = await NhanVienDAO.findByMaNV(maNV);

        return nhanVien;
    }

    // Thêm nhân viên mới
    async createNhanVien(nhanVienData) {
        const maNV = await generateCode('NV', DataModel.Data_NhanVien_Model, 'MaNV');

        const newEmployee = await NhanVienDAO.create({
            ...nhanVienData,
            MaNV: maNV,
        });

        return {
            message: 'Thêm nhân viên thành công',
            data: newEmployee,
        };
    }

    // Cập nhật nhân viên
    async updateNhanVien(maNV, nhanVienData) {
        const nv = await NhanVienDAO.update(maNV, nhanVienData);

        if (!nv) {
            throw new Error('Không tìm thấy nhân viên');
        }

        return {
            message: 'Cập nhật nhân viên thành công',
            data: nv,
        };
    }

    // Xóa nhân viên
    async deleteNhanVien(maNV) {
        const nv = await NhanVienDAO.deleteByMaNV(maNV);

        if (!nv) {
            throw new Error('Không tìm thấy nhân viên');
        }

        return { message: 'Xóa nhân viên thành công' };
    }

    // Lấy thông tin profile admin
    async getProfile(userId) {
        const user = await NhanVienDAO.findById(userId);
        return user;
    }
}

export default new NhanVienBUS();
