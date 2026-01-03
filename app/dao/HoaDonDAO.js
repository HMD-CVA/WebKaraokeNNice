import DataModel from '../model/index.js';

class HoaDonDAO {
    // Lấy tất cả hóa đơn
    async findAll() {
        try {
            return await DataModel.Data_HoaDon_Model.find({}).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findAll: ${error.message}`);
        }
    }

    // Tìm hóa đơn theo mã
    async findByMaHoaDon(maHoaDon) {
        try {
            return await DataModel.Data_HoaDon_Model.findOne({ MaHoaDon: maHoaDon }).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findByMaHoaDon: ${error.message}`);
        }
    }

    // Tìm hóa đơn theo mã đặt phòng
    async findByMaDatPhong(maDatPhong) {
        try {
            return await DataModel.Data_HoaDon_Model.findOne({ MaDatPhong: maDatPhong }).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findByMaDatPhong: ${error.message}`);
        }
    }

    // Tìm hóa đơn theo mã khách hàng
    async findByMaKH(maKH) {
        try {
            return await DataModel.Data_HoaDon_Model.find({ MaKH: maKH }).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findByMaKH: ${error.message}`);
        }
    }

    // Tìm hóa đơn theo mã phòng
    async findByMaPhong(maPhong) {
        try {
            return await DataModel.Data_HoaDon_Model.find({ MaPhong: maPhong }).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findByMaPhong: ${error.message}`);
        }
    }

    // Tìm hóa đơn theo trạng thái
    async findByTrangThai(trangThai) {
        try {
            return await DataModel.Data_HoaDon_Model.find({ TrangThai: trangThai }).lean().exec();
        } catch (error) {
            throw new Error(`DAO Error - findByTrangThai: ${error.message}`);
        }
    }

    // Tạo hóa đơn mới
    async create(hoaDonData) {
        try {
            const hoaDon = new DataModel.Data_HoaDon_Model(hoaDonData);
            return await hoaDon.save();
        } catch (error) {
            throw new Error(`DAO Error - create: ${error.message}`);
        }
    }

    // Cập nhật hóa đơn
    async update(maHoaDon, updateData) {
        try {
            return await DataModel.Data_HoaDon_Model.findOneAndUpdate(
                { MaHoaDon: maHoaDon },
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`DAO Error - update: ${error.message}`);
        }
    }

    // Cập nhật trạng thái hóa đơn
    async updateTrangThai(maHoaDon, trangThai) {
        try {
            return await DataModel.Data_HoaDon_Model.findOneAndUpdate(
                { MaHoaDon: maHoaDon },
                { TrangThai: trangThai, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`DAO Error - updateTrangThai: ${error.message}`);
        }
    }

    // Cập nhật tổng tiền hóa đơn
    async updateTongTien(maHoaDon, tongTien) {
        try {
            return await DataModel.Data_HoaDon_Model.findOneAndUpdate(
                { MaHoaDon: maHoaDon },
                { TongTien: tongTien, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`DAO Error - updateTongTien: ${error.message}`);
        }
    }

    // Cập nhật thời gian kết thúc
    async updateThoiGianKetThuc(maHoaDon, thoiGianKetThuc) {
        try {
            return await DataModel.Data_HoaDon_Model.findOneAndUpdate(
                { MaHoaDon: maHoaDon },
                { ThoiGianKetThuc: thoiGianKetThuc, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`DAO Error - updateThoiGianKetThuc: ${error.message}`);
        }
    }

    // Xóa hóa đơn
    async delete(maHoaDon) {
        try {
            return await DataModel.Data_HoaDon_Model.findOneAndDelete({ MaHoaDon: maHoaDon });
        } catch (error) {
            throw new Error(`DAO Error - delete: ${error.message}`);
        }
    }

    // Kiểm tra hóa đơn có tồn tại không
    async exists(maHoaDon) {
        try {
            const count = await DataModel.Data_HoaDon_Model.countDocuments({ MaHoaDon: maHoaDon });
            return count > 0;
        } catch (error) {
            throw new Error(`DAO Error - exists: ${error.message}`);
        }
    }
}

export default new HoaDonDAO();
