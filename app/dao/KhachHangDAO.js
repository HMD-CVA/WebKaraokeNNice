import DataModel from '../model/index.js';

class KhachHangDAO {
    // Tạo khách hàng mới
    async create(khachHangData) {
        return await DataModel.Data_KhachHang_Model.create(khachHangData);
    }

    // Lấy tất cả khách hàng
    async findAll() {
        return await DataModel.Data_KhachHang_Model.find({}).sort({ MaKH: 1 }).lean();
    }

    // Tìm khách hàng theo ID
    async findById(id) {
        return await DataModel.Data_KhachHang_Model.findById(id).lean();
    }

    // Tìm khách hàng theo MaKH
    async findByMaKH(maKH) {
        return await DataModel.Data_KhachHang_Model.findOne({ MaKH: maKH }).lean().exec();
    }

    // Tìm khách hàng theo số điện thoại
    async findByPhone(phone) {
        return await DataModel.Data_KhachHang_Model.findOne({ SDT: phone }).lean().exec();
    }

    // Cập nhật khách hàng
    async update(id, khachHangData) {
        return await DataModel.Data_KhachHang_Model.findByIdAndUpdate(
            id,
            khachHangData,
            { new: true }
        );
    }

    // Xóa khách hàng
    async delete(id) {
        return await DataModel.Data_KhachHang_Model.findByIdAndDelete(id);
    }

    // Đếm số lượng khách hàng
    async count(filter = {}) {
        return await DataModel.Data_KhachHang_Model.countDocuments(filter);
    }

    // Đếm tổng số khách hàng
    async estimatedDocumentCount() {
        return await DataModel.Data_KhachHang_Model.estimatedDocumentCount();
    }
}

export default new KhachHangDAO();
