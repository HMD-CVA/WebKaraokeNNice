import KhachHangDAO from '../dao/KhachHangDAO.js';

class KhachHangBUS {
    // Lấy danh sách khách hàng để render trang
    async getAllKhachHangs() {
        return await KhachHangDAO.findAll();
    }

    // Lấy thông tin khách hàng theo MaKH
    async getKhachHangByMaKH(maKH) {
        const khachHang = await KhachHangDAO.findByMaKH(maKH);

        if (!khachHang) {
            throw new Error('Không tìm thấy khách hàng');
        }

        return khachHang;
    }

    // Lấy thông tin khách hàng theo số điện thoại
    async getKhachHangByPhone(phone) {
        const khachHang = await KhachHangDAO.findByPhone(phone);
        return khachHang; // Có thể null nếu không tìm thấy
    }

    // Thêm khách hàng mới
    async createKhachHang(khachHangData) {
        const { name, phone, address } = khachHangData;

        const kh = await KhachHangDAO.create({
            name,
            phone,
            address,
        });

        return kh;
    }

    // Cập nhật khách hàng
    async updateKhachHang(id, khachHangData) {
        const { name, phone, address } = khachHangData;

        const kh = await KhachHangDAO.update(id, { name, phone, address });

        if (!kh) {
            throw new Error('Không tìm thấy khách hàng');
        }

        return kh;
    }

    // Xóa khách hàng
    async deleteKhachHang(id) {
        const kh = await KhachHangDAO.delete(id);

        if (!kh) {
            throw new Error('Không tìm thấy khách hàng');
        }

        return { message: 'Xóa khách hàng thành công' };
    }

    // Lấy danh sách khách hàng (API)
    async getKhachHangsForAPI(params = {}) {
        const { search, limit } = params;

        // Implement search logic nếu cần
        return await KhachHangDAO.findAll();
    }
}

export default new KhachHangBUS();
