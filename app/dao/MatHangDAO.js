import DataModel from '../model/index.js';

class MatHangDAO {
    // Tạo mặt hàng mới
    async create(matHangData) {
        return await DataModel.Data_MatHang_Model.create(matHangData);
    }

    // Lấy tất cả mặt hàng
    async findAll() {
        return await DataModel.Data_MatHang_Model.find({}).lean();
    }

    // Lấy mặt hàng với giới hạn
    async findWithLimit(limit = 100) {
        return await DataModel.Data_MatHang_Model.find({}).limit(limit).lean();
    }

    // Tìm mặt hàng theo LoaiHang
    async findByLoaiHang(loaiHang) {
        return await DataModel.Data_MatHang_Model.find({ LoaiHang: loaiHang }).lean();
    }

    // Tìm mặt hàng còn hàng
    async findInStock(filter = {}) {
        return await DataModel.Data_MatHang_Model.find({
            ...filter,
            SoLuongTon: { $gt: 0 },
        })
            .select('MaHang TenHang LoaiHang DonGia DonViTinh SoLuongTon LinkAnh')
            .sort({ TenHang: 1 });
    }

    // Tìm mặt hàng theo MaHang
    async findByMaHang(maHang) {
        return await DataModel.Data_MatHang_Model.findOne({ MaHang: maHang }).lean();
    }

    // Cập nhật mặt hàng
    async update(maMH, matHangData) {
        return await DataModel.Data_MatHang_Model.findOneAndUpdate(
            { MaHang: maMH },
            matHangData,
            { new: true, runValidators: true }
        );
    }

    // Cập nhật số lượng tồn kho
    async updateSoLuongTon(maHang, soLuongMoi) {
        return await DataModel.Data_MatHang_Model.findOneAndUpdate(
            { MaHang: maHang },
            { SoLuongTon: soLuongMoi },
            { new: true }
        );
    }

    // Tăng/giảm số lượng tồn kho (dùng $inc)
    async incrementSoLuongTon(maHang, soLuongThayDoi) {
        return await DataModel.Data_MatHang_Model.findOneAndUpdate(
            { MaHang: maHang },
            { $inc: { SoLuongTon: soLuongThayDoi } },
            { new: true }
        );
    }

    // Xóa mặt hàng
    async deleteByMaHang(maHang) {
        return await DataModel.Data_MatHang_Model.findOneAndDelete({ MaHang: maHang });
    }

    // Lấy danh sách loại hàng duy nhất
    async getDistinctLoaiHang() {
        return await DataModel.Data_MatHang_Model.distinct('LoaiHang');
    }
}

export default new MatHangDAO();
