import DataModel from '../model/index.js';

class ThietBiDAO {
    // Tạo thiết bị mới
    async create(thietBiData) {
        return await DataModel.Data_ThietBi_Model.create(thietBiData);
    }

    // Lấy tất cả thiết bị
    async findAll() {
        return await DataModel.Data_ThietBi_Model.find({}).lean();
    }

    // Tìm thiết bị theo MaThietBi
    async findByMaThietBi(maThietBi) {
        return await DataModel.Data_ThietBi_Model.findOne({ MaThietBi: maThietBi }).lean();
    }

    // Cập nhật thiết bị
    async update(maTB, thietBiData) {
        return await DataModel.Data_ThietBi_Model.findOneAndUpdate(
            { MaThietBi: maTB },
            thietBiData,
            { new: true, runValidators: true }
        );
    }

    // Cập nhật trạng thái thiết bị
    async updateTrangThai(maTB, trangThai) {
        return await DataModel.Data_ThietBi_Model.findOneAndUpdate(
            { MaThietBi: maTB },
            { TrangThai: trangThai },
            { new: true }
        );
    }

    // Xóa thiết bị
    async deleteByMaThietBi(maTB) {
        return await DataModel.Data_ThietBi_Model.findOneAndDelete({ MaThietBi: maTB });
    }

    // Lấy danh sách loại thiết bị duy nhất
    async getDistinctLoaiThietBi() {
        return await DataModel.Data_ThietBi_Model.distinct('LoaiThietBi');
    }

    // Lấy danh sách mã phòng duy nhất
    async getDistinctMaPhong() {
        const maPhongs = await DataModel.Data_ThietBi_Model.distinct('MaPhong');
        return maPhongs.sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''));
            const numB = parseInt(b.replace(/\D/g, ''));
            return numA - numB;
        });
    }
}

export default new ThietBiDAO();
