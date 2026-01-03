import DataModel from '../model/index.js';

class DatPhongDAO {
    // Tạo đơn đặt phòng mới
    async create(datPhongData) {
        return await DataModel.Data_DatPhong_Model.create(datPhongData);
    }

    // Lấy tất cả đơn đặt phòng
    async findAll() {
        return await DataModel.Data_DatPhong_Model.find({})
            .sort({ ThoiGianBatDau: -1 })
            .lean();
    }

    // Tìm đơn đặt phòng theo ID
    async findById(id) {
        return await DataModel.Data_DatPhong_Model.findById(id).lean();
    }

    // Tìm đơn đặt phòng theo MaDatPhong
    async findByMaDatPhong(maDatPhong) {
        return await DataModel.Data_DatPhong_Model.findOne({ MaDatPhong: maDatPhong }).lean().exec();
    }

    // Tìm đơn đặt phòng theo MaKH
    async findByMaKH(maKH) {
        return await DataModel.Data_DatPhong_Model.find({ MaKH: maKH })
            .sort({ ThoiGianBatDau: -1 })
            .lean();
    }

    // Tìm đơn đặt phòng theo MaPhong
    async findByMaPhong(maPhong) {
        return await DataModel.Data_DatPhong_Model.find({ MaPhong: maPhong })
            .sort({ ThoiGianBatDau: -1 })
            .lean();
    }

    // Cập nhật đơn đặt phòng
    async update(id, datPhongData) {
        return await DataModel.Data_DatPhong_Model.findByIdAndUpdate(
            id,
            datPhongData,
            { new: true }
        );
    }

    // Cập nhật đơn đặt phòng theo MaDatPhong
    async updateByMaDatPhong(maDatPhong, datPhongData) {
        return await DataModel.Data_DatPhong_Model.findOneAndUpdate(
            { MaDatPhong: maDatPhong },
            datPhongData,
            { new: true }
        );
    }

    // Xóa đơn đặt phòng
    async delete(id) {
        return await DataModel.Data_DatPhong_Model.findByIdAndDelete(id);
    }

    // Xóa đơn đặt phòng theo MaDatPhong
    async deleteByMaDatPhong(maDatPhong) {
        return await DataModel.Data_DatPhong_Model.findOneAndDelete({ MaDatPhong: maDatPhong });
    }

    // Đếm số lượng đơn đặt phòng
    async count(filter = {}) {
        return await DataModel.Data_DatPhong_Model.countDocuments(filter);
    }
}

export default new DatPhongDAO();
