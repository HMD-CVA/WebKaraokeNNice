import DataModel from '../model/index.js';

class NhanVienDAO {
    // Tạo nhân viên mới
    async create(nhanVienData) {
        const newEmployee = new DataModel.Data_NhanVien_Model(nhanVienData);
        return await newEmployee.save();
    }

    // Lấy tất cả nhân viên
    async findAll() {
        return await DataModel.Data_NhanVien_Model.find({}).sort({ MaNV: 1 }).lean();
    }

    // Tìm nhân viên theo ID
    async findById(id) {
        return await DataModel.Data_NhanVien_Model.findById(id).select('-Password');
    }

    // Tìm nhân viên theo MaNV
    async findByMaNV(maNV) {
        return await DataModel.Data_NhanVien_Model.findOne({ MaNV: maNV }).lean().exec();
    }

    // Tìm nhân viên theo Email
    async findByEmail(email) {
        return await DataModel.Data_NhanVien_Model.findOne({ Email: email }).exec();
    }

    // Cập nhật nhân viên
    async update(maNV, nhanVienData) {
        return await DataModel.Data_NhanVien_Model.findOneAndUpdate(
            { MaNV: maNV },
            nhanVienData,
            { new: true, runValidators: true }
        );
    }

    // Xóa nhân viên
    async deleteByMaNV(maNV) {
        return await DataModel.Data_NhanVien_Model.findOneAndDelete({ MaNV: maNV });
    }
}

export default new NhanVienDAO();
