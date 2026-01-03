import DataModel from '../model/index.js';

class BangGiaPhongDAO {
    // Tìm tất cả bảng giá
    async findAll() {
        return await DataModel.Data_BangGiaPhong_Model.find({}).lean().exec();
    }

    // Tìm bảng giá theo loại phòng
    async findByLoaiPhong(loaiPhong) {
        return await DataModel.Data_BangGiaPhong_Model.find({ LoaiPhong: loaiPhong }).lean().exec();
    }

    // Lấy danh sách loại phòng duy nhất
    async getDistinctLoaiPhong() {
        return await DataModel.Data_BangGiaPhong_Model.distinct('LoaiPhong');
    }

    // Xóa bảng giá theo loại phòng
    async deleteByLoaiPhong(loaiPhong) {
        return await DataModel.Data_BangGiaPhong_Model.deleteMany({ LoaiPhong: loaiPhong });
    }

    // Tạo nhiều bảng giá
    async createMany(bangGiaList) {
        return await DataModel.Data_BangGiaPhong_Model.insertMany(bangGiaList);
    }

    // Cập nhật bảng giá theo loại phòng
    async updateByLoaiPhong(loaiPhong, bangGiaData) {
        // Xóa bảng giá cũ và thêm bảng giá mới
        await this.deleteByLoaiPhong(loaiPhong);
        return await this.createMany(bangGiaData);
    }
}

export default new BangGiaPhongDAO();
