import DataModel from '../model/index.js';

class ChiTietHDDAO {
    // Lấy tất cả chi tiết hóa đơn
    async findAll() {
        try {
            return await DataModel.Data_ChiTietHD_Model.find({}).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findAll: ${error.message}`);
        }
    }

    // Tìm chi tiết hóa đơn theo mã chi tiết
    async findByMaCTHD(maCTHD) {
        try {
            return await DataModel.Data_ChiTietHD_Model.findOne({ MaCTHD: maCTHD }).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findByMaCTHD: ${error.message}`);
        }
    }

    // Tìm tất cả chi tiết của một hóa đơn
    async findByMaHoaDon(maHoaDon) {
        try {
            return await DataModel.Data_ChiTietHD_Model.find({ MaHoaDon: maHoaDon }).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findByMaHoaDon: ${error.message}`);
        }
    }

    // Tìm chi tiết hóa đơn theo mã hàng
    async findByMaHang(maHang) {
        try {
            return await DataModel.Data_ChiTietHD_Model.find({ MaHang: maHang }).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findByMaHang: ${error.message}`);
        }
    }

    // Tìm chi tiết hóa đơn theo loại dịch vụ
    async findByLoaiDichVu(loaiDichVu) {
        try {
            return await DataModel.Data_ChiTietHD_Model.find({ LoaiDichVu: loaiDichVu }).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findByLoaiDichVu: ${error.message}`);
        }
    }

    // Tìm chi tiết hóa đơn theo mã hóa đơn và mã hàng
    async findByMaHoaDonAndMaHang(maHoaDon, maHang) {
        try {
            return await DataModel.Data_ChiTietHD_Model.findOne({ 
                MaHoaDon: maHoaDon, 
                MaHang: maHang 
            }).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findByMaHoaDonAndMaHang: ${error.message}`);
        }
    }

    // Tạo chi tiết hóa đơn mới
    async create(chiTietData) {
        try {
            const chiTiet = new DataModel.Data_ChiTietHD_Model(chiTietData);
            return await chiTiet.save();
        } catch (error) {
            throw new Error(`DAO Error - create: ${error.message}`);
        }
    }

    // Tạo nhiều chi tiết hóa đơn
    async createMany(chiTietArray) {
        try {
            return await DataModel.Data_ChiTietHD_Model.insertMany(chiTietArray);
        } catch (error) {
            throw new Error(`DAO Error - createMany: ${error.message}`);
        }
    }

    // Cập nhật chi tiết hóa đơn theo mã chi tiết
    async update(maCTHD, updateData) {
        try {
            return await DataModel.Data_ChiTietHD_Model.findOneAndUpdate(
                { MaCTHD: maCTHD },
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`DAO Error - update: ${error.message}`);
        }
    }

    // Cập nhật chi tiết hóa đơn theo mã hóa đơn và mã hàng
    async updateByMaHoaDonAndMaHang(maHoaDon, maHang, updateData) {
        try {
            return await DataModel.Data_ChiTietHD_Model.findOneAndUpdate(
                { MaHoaDon: maHoaDon, MaHang: maHang },
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`DAO Error - updateByMaHoaDonAndMaHang: ${error.message}`);
        }
    }

    // Xóa chi tiết hóa đơn theo mã chi tiết
    async delete(maCTHD) {
        try {
            return await DataModel.Data_ChiTietHD_Model.findOneAndDelete({ MaCTHD: maCTHD });
        } catch (error) {
            throw new Error(`DAO Error - delete: ${error.message}`);
        }
    }

    // Xóa tất cả chi tiết của một hóa đơn
    async deleteByMaHoaDon(maHoaDon) {
        try {
            return await DataModel.Data_ChiTietHD_Model.deleteMany({ MaHoaDon: maHoaDon });
        } catch (error) {
            throw new Error(`DAO Error - deleteByMaHoaDon: ${error.message}`);
        }
    }

    // Xóa chi tiết hóa đơn theo mã hóa đơn và mã hàng
    async deleteByMaHoaDonAndMaHang(maHoaDon, maHang) {
        try {
            return await DataModel.Data_ChiTietHD_Model.findOneAndDelete({ 
                MaHoaDon: maHoaDon, 
                MaHang: maHang 
            });
        } catch (error) {
            throw new Error(`DAO Error - deleteByMaHoaDonAndMaHang: ${error.message}`);
        }
    }

    // Đếm số lượng chi tiết của một hóa đơn
    async countByMaHoaDon(maHoaDon) {
        try {
            return await DataModel.Data_ChiTietHD_Model.countDocuments({ MaHoaDon: maHoaDon });
        } catch (error) {
            throw new Error(`DAO Error - countByMaHoaDon: ${error.message}`);
        }
    }

    // Kiểm tra chi tiết hóa đơn có tồn tại không
    async exists(maCTHD) {
        try {
            const count = await DataModel.Data_ChiTietHD_Model.countDocuments({ MaCTHD: maCTHD });
            return count > 0;
        } catch (error) {
            throw new Error(`DAO Error - exists: ${error.message}`);
        }
    }
}

export default new ChiTietHDDAO();
