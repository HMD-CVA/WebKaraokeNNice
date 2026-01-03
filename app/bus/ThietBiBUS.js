import ThietBiDAO from '../dao/ThietBiDAO.js';
import DataModel from '../model/index.js';
import { generateCode } from '../utils/codeGenerator.js';

class ThietBiBUS {
    // Lấy danh sách thiết bị để render trang
    async getAllThietBisForPage() {
        const thietbis = await ThietBiDAO.findAll();

        // Lấy danh sách mã phòng duy nhất từ thiết bị
        const uniqueMaPhongs = await ThietBiDAO.getDistinctMaPhong();
        const loaiThietBis = await ThietBiDAO.getDistinctLoaiThietBi();

        return {
            thietbis,
            uniqueMaPhongs,
            loaiThietBis,
        };
    }

    // Lấy thiết bị theo mã
    async getThietBiByMaThietBi(maTB) {
        console.log('Loại phòng nhận được:', maTB);

        const thietbis = await ThietBiDAO.findByMaThietBi(maTB);

        if (!thietbis) {
            throw new Error('Không tìm thấy thiết bị');
        }

        return thietbis;
    }

    // Thêm thiết bị mới
    async createThietBi(formData) {
        console.log('FormData:', formData);

        // VALIDATION
        if (!formData.TenThietBi || !formData.MaPhong || !formData.LoaiThietBi) {
            throw new Error('Thiếu thông tin bắt buộc: Tên thiết bị, Mã phòng, Loại thiết bị');
        }

        // Tạo mã thiết bị tự động
        const maThietBi = await generateCode('TB', DataModel.Data_ThietBi_Model, 'MaThietBi');
        console.log('Mã thiết bị mới:', maThietBi);

        // Tạo thiết bị mới
        const newThietBi = new DataModel.Data_ThietBi_Model({
            MaThietBi: maThietBi,
            TenThietBi: formData.TenThietBi,
            MaPhong: formData.MaPhong,
            LoaiThietBi: formData.LoaiThietBi,
            TinhTrang: formData.TinhTrang || 'Tốt',
            NgayNhap: formData.NgayNhap || new Date(),
            LinkAnh: formData.LinkAnh || '',
        });

        console.log('Đang lưu thiết bị:', newThietBi);

        // Lưu vào database
        const savedThietBi = await newThietBi.save();

        console.log('Đã lưu thiết bị thành công:', savedThietBi);

        return {
            message: `Thiết bị "${formData.TenThietBi}" đã được thêm thành công với mã ${maThietBi}!`,
            data: savedThietBi,
        };
    }

    // Cập nhật thiết bị
    async updateThietBi(maTB, updateData) {
        delete updateData.MaThietBi;
        delete updateData._id;

        const application = await ThietBiDAO.update(maTB, updateData);

        if (!application) {
            throw new Error('Không tìm thấy thiết bị');
        }

        return {
            message: 'Cập nhật thiết bị thành công',
            data: application,
        };
    }

    // Cập nhật trạng thái thiết bị
    async updateTrangThaiThietBi(maTB, tinhTrang) {
        console.log(maTB, tinhTrang);

        // Validate input
        if (!tinhTrang) {
            throw new Error('Trạng thái là bắt buộc');
        }

        // Danh sách trạng thái hợp lệ
        const validStatuses = ['Tốt', 'Đang bảo trì', 'Cần sửa chữa', 'Hỏng'];
        if (!validStatuses.includes(tinhTrang)) {
            throw new Error('Trạng thái không hợp lệ');
        }

        // Tìm và cập nhật thiết bị
        const updatedThietBi = await ThietBiDAO.updateTrangThai(maTB, tinhTrang);

        if (!updatedThietBi) {
            throw new Error('Không tìm thấy thiết bị');
        }

        return {
            message: 'Cập nhật trạng thái thành công',
            data: {
                TinhTrang: updatedThietBi.TinhTrang,
            },
        };
    }

    // Xóa thiết bị
    async deleteThietBi(maTB) {
        const thietBi = await ThietBiDAO.deleteByMaThietBi(maTB);

        if (!thietBi) {
            throw new Error('Không tìm thấy thiết bị');
        }

        return { message: 'Xóa thiết bị thành công' };
    }
}

export default new ThietBiBUS();
