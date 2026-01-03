import DataModel from '../model/index.js';

class PhongHatDAO {
    // Tạo phòng hát mới
    async create(phongHatData) {
        return await DataModel.Data_PhongHat_Model.create(phongHatData);
    }

    // Lấy tất cả phòng hát
    async findAll() {
        return await DataModel.Data_PhongHat_Model.find({}).lean().exec();
    }

    // Tìm phòng theo ID
    async findById(id) {
        return await DataModel.Data_PhongHat_Model.findById(id);
    }

    // Tìm phòng theo MaPhong
    async findByMaPhong(maPhong) {
        return await DataModel.Data_PhongHat_Model.findOne({ MaPhong: maPhong }).lean().exec();
    }

    // Tìm phòng theo LoaiPhong
    async findByLoaiPhong(loaiPhong) {
        return await DataModel.Data_PhongHat_Model.find({ LoaiPhong: loaiPhong });
    }

    // Cập nhật phòng hát
    async update(id, phongHatData) {
        return await DataModel.Data_PhongHat_Model.findByIdAndUpdate(
            id,
            phongHatData,
            { new: true, runValidators: true }
        );
    }

    // Cập nhật chỉ ảnh phòng
    async updateImage(id, linkAnh) {
        return await DataModel.Data_PhongHat_Model.findByIdAndUpdate(
            id,
            {
                LinkAnh: linkAnh,
                updatedAt: new Date(),
            },
            {
                new: true,
                runValidators: true,
                fields: { LinkAnh: 1 },
            }
        );
    }

    // Xóa phòng hát
    async delete(id) {
        return await DataModel.Data_PhongHat_Model.findByIdAndDelete(id);
    }

    // Tìm phòng theo trạng thái
    async findByTrangThai(trangThai) {
        return await DataModel.Data_PhongHat_Model.find({ TrangThai: trangThai }).lean();
    }

    // Cập nhật trạng thái phòng theo MaPhong
    async updateTrangThai(maPhong, trangThai) {
        return await DataModel.Data_PhongHat_Model.findOneAndUpdate(
            { MaPhong: maPhong },
            { TrangThai: trangThai, updatedAt: new Date() },
            { new: true }
        );
    }

    // Lấy danh sách các trạng thái phòng duy nhất
    async getDistinctTrangThai() {
        return await DataModel.Data_PhongHat_Model.distinct('TrangThai');
    }
}

export default new PhongHatDAO();
