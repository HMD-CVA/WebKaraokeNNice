import PhongHatDAO from '../dao/PhongHatDAO.js';
import BangGiaPhongDAO from '../dao/BangGiaPhongDAO.js';
import DataModel from '../model/index.js';
import { generateCode } from '../utils/codeGenerator.js';

class PhongHatBUS {
    // Lấy danh sách phòng hát kèm bảng giá
    async getAllPhongHatsWithBangGia() {
        const [phonghats, bangGiaList, roomTypes, roomStatus] = await Promise.all([
            PhongHatDAO.findAll(),
            BangGiaPhongDAO.findAll(),
            BangGiaPhongDAO.getDistinctLoaiPhong(),
            PhongHatDAO.getDistinctTrangThai(),
        ]);

        // Tạo map để tra cứu nhanh bảng giá theo LoaiPhong
        const phonghatsWithPrice = phonghats.map((phong) => {
            const bangGiaCungLoai = bangGiaList.filter(
                (banggia) => banggia.LoaiPhong === phong.LoaiPhong
            );

            return {
                ...phong,
                BangGia: bangGiaCungLoai,
            };
        });

        // Chuẩn bị dữ liệu cho phần chỉnh sửa
        const editBangGia = bangGiaList.map((gia) => {
            const [startTime = '', endTime = ''] = gia.KhungGio.split('-');
            return {
                ...gia,
                startTime,
                endTime,
            };
        });

        // Tính toán thống kê
        const totalRooms = phonghats.length;
        const countAvailable = phonghats.filter((p) => p.TrangThai === 'Trống').length;
        const countBusy = phonghats.filter((p) => p.TrangThai === 'Đang sử dụng').length;
        const countReserved = phonghats.filter((p) => p.TrangThai === 'Đã đặt trước').length;

        return {
            phonghats: phonghatsWithPrice,
            roomTypes,
            currentBangGia: bangGiaList,
            editBangGia,
            totalRooms,
            countAvailable,
            countBusy,
            countReserved,
            roomStatus,
        };
    }

    // Thêm phòng hát mới
    async createPhongHat(phongHatData) {
        const { TenPhong, LoaiPhong, SucChua, TrangThai, GhiChu, LinkAnh } = phongHatData;

        console.log('Nhận dữ liệu phòng:', TenPhong);

        // Tạo mã phòng tự động
        const maPhong = await generateCode('P', DataModel.Data_PhongHat_Model, 'MaPhong');

        const ph = await PhongHatDAO.create({
            MaPhong: maPhong,
            TenPhong,
            LoaiPhong,
            SucChua,
            TrangThai,
            GhiChu,
            LinkAnh,
            createdAt: new Date(),
        });

        console.log('Đã thêm phòng:', ph.TenPhong);
        console.log('Mã phòng được tạo:', ph.MaPhong);

        return ph;
    }

    // Cập nhật phòng hát
    async updatePhongHat(id, phongHatData) {
        const { TenPhong, LoaiPhong, SucChua, TrangThai, GhiChu, LinkAnh } = phongHatData;

        console.log('Cập nhật phòng ID:', id);

        const ph = await PhongHatDAO.update(id, {
            TenPhong,
            LoaiPhong,
            SucChua,
            TrangThai,
            GhiChu,
            LinkAnh,
            createdAt: new Date(),
        });

        if (!ph) {
            throw new Error('Không tìm thấy phòng');
        }

        console.log('Đã cập nhật phòng:', ph.TenPhong);

        return ph;
    }

    // Xóa phòng hát
    async deletePhongHat(id) {
        // Kiểm tra phòng có đang được sử dụng không
        const phong = await PhongHatDAO.findById(id);
        
        if (!phong) {
            throw new Error('Không tìm thấy phòng hát!');
        }

        if (phong.TrangThai === 'Đang sử dụng') {
            throw new Error('Không thể xóa phòng đang được sử dụng!');
        }

        // Xóa phòng
        await PhongHatDAO.delete(id);
        return { message: 'Xóa phòng hát thành công' };
    }

    // Cập nhật ảnh phòng
    async updateImagePhongHat(id, linkAnh) {
        console.log('Cập nhật ảnh phòng:', { id, linkAnh });

        const phong = await PhongHatDAO.updateImage(id, linkAnh);

        if (!phong) {
            throw new Error('Không tìm thấy phòng');
        }

        return {
            _id: phong._id,
            LinkAnh: phong.LinkAnh,
        };
    }

    // Kiểm tra loại phòng có đang được sử dụng không
    async checkLoaiPhongInUse(loaiPhong) {
        const roomsUsingType = await PhongHatDAO.findByLoaiPhong(loaiPhong);

        const roomDetails = roomsUsingType.map((room) => ({
            TenPhong: room.TenPhong,
            MaPhong: room.MaPhong,
            TrangThai: room.TrangThai,
        }));

        return {
            isUsed: roomsUsingType.length > 0,
            loaiPhong,
            count: roomsUsingType.length,
            rooms: roomDetails,
        };
    }

    // Lấy bảng giá theo mã phòng
    async getBangGiaByMaPhong(maPhong) {
        console.log('Bắt đầu tìm Bảng giá cho Mã phòng:', maPhong);

        // 1. Tìm phòng để lấy LoaiPhong
        const phong = await PhongHatDAO.findByMaPhong(maPhong);

        if (!phong || !phong.LoaiPhong) {
            throw new Error(`Không tìm thấy phòng với mã ${maPhong} hoặc phòng chưa có loại phòng`);
        }

        const loaiPhong = phong.LoaiPhong;

        // 2. Lấy bảng giá theo LoaiPhong
        const bangGia = await BangGiaPhongDAO.findByLoaiPhong(loaiPhong);

        console.log(`✅ Đã tải ${bangGia.length} mục giá cho Loại phòng: ${loaiPhong}`);

        return bangGia;
    }

    // Lấy bảng giá theo loại phòng
    async getBangGiaByLoaiPhong(loaiPhong) {
        return await BangGiaPhongDAO.findByLoaiPhong(loaiPhong);
    }

    // Lấy danh sách phòng theo trạng thái
    async getPhongsByTrangThai(trangThai) {
        return await PhongHatDAO.findByTrangThai(trangThai);
    }

    // Lấy danh sách phòng theo mảng MaPhong
    async getPhongsByMaPhongs(maPhongs) {
        if (!maPhongs || maPhongs.length === 0) return [];
        
        return await DataModel.Data_PhongHat_Model.find({
            MaPhong: { $in: maPhongs }
        }).lean().exec();
    }

    // API lấy giá phòng theo khung giờ
    async getGiaPhongTheoKhungGio(maPhong, khungGio) {
        const phong = await PhongHatDAO.findByMaPhong(maPhong);

        if (!phong) {
            throw new Error('Không tìm thấy phòng');
        }

        // Lấy bảng giá theo loại phòng
        const bangGiaList = await BangGiaPhongDAO.findByLoaiPhong(phong.LoaiPhong);

        // Tìm giá theo khung giờ
        const giaTheoGio = bangGiaList.find(g => g.KhungGio === khungGio);

        if (giaTheoGio) {
            return {
                gia: giaTheoGio.GiaTien,
                khungGio: khungGio
            };
        } else {
            return {
                gia: null,
                message: `Không có giá cho khung giờ ${khungGio}`
            };
        }
    }

    // API lấy bảng giá và khung giờ hoạt động của phòng
    async getBangGiaAndKhungGioHoatDong(maPhong) {
        const phong = await PhongHatDAO.findByMaPhong(maPhong);

        if (!phong) {
            throw new Error('Không tìm thấy phòng');
        }

        // Lấy bảng giá cho loại phòng này
        const bangGia = await BangGiaPhongDAO.findByLoaiPhong(phong.LoaiPhong);

        // Xác định khung giờ hoạt động từ bảng giá
        let khungGioHoatDong = { start: '10:00', end: '22:00' }; // Mặc định

        if (bangGia.length > 0) {
            // Giả sử bảng giá có trường GioBatDau và GioKetThuc
            const gioBatDau = bangGia.map((g) => g.GioBatDau).sort()[0];
            const gioKetThuc = bangGia
                .map((g) => g.GioKetThuc)
                .sort()
                .reverse()[0];

            khungGioHoatDong = {
                start: gioBatDau || '10:00',
                end: gioKetThuc || '22:00',
            };
        }

        return {
            bangGia: bangGia,
            khungGioHoatDong: khungGioHoatDong,
            phong: {
                MaPhong: phong.MaPhong,
                TenPhong: phong.TenPhong,
                LoaiPhong: phong.LoaiPhong,
            },
        };
    }

    // API lấy danh sách phòng trống với bảng giá (aggregate)
    async getPhongTrongWithBangGia() {
        const phongsWithPrice = await DataModel.Data_PhongHat_Model.aggregate([
            // BƯỚC 1: Lọc chỉ lấy các phòng có TrangThai: "Trống"
            {
                $match: {
                    TrangThai: 'Trống',
                },
            },

            // BƯỚC 2: Nối (JOIN) với Collection Bảng Giá Phòng
            {
                $lookup: {
                    from: 'banggiaphongs', // Tên collection trong MongoDB
                    localField: 'LoaiPhong',
                    foreignField: 'LoaiPhong',
                    as: 'BangGiaChiTiet',
                },
            },

            // BƯỚC 3: Dự chiếu (Project) và sắp xếp kết quả
            {
                $project: {
                    MaPhong: 1,
                    TenPhong: 1,
                    LoaiPhong: 1,
                    SucChua: 1,
                    TrangThai: 1,
                    BangGia: '$BangGiaChiTiet', // Đổi tên BangGiaChiTiet thành BangGia
                },
            },

            // Sắp xếp theo TenPhong
            {
                $sort: {
                    TenPhong: 1,
                },
            },
        ]);

        return phongsWithPrice;
    }
}

export default new PhongHatBUS();
