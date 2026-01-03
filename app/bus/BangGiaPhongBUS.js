import BangGiaPhongDAO from '../dao/BangGiaPhongDAO.js';
import PhongHatDAO from '../dao/PhongHatDAO.js';
import DataModel from '../model/index.js';
import { generateCode } from '../utils/codeGenerator.js';

class BangGiaPhongBUS {
    // Lưu/Cập nhật bảng giá cho một loại phòng (POST/PUT)
    async saveBangGiaForLoaiPhong(loaiPhong, bangGia) {
        console.log('Nhận dữ liệu bảng giá:', {
            loaiPhong: loaiPhong,
            soKhungGio: bangGia ? bangGia.length : 0,
        });

        // Validate dữ liệu đầu vào
        if (!loaiPhong || !bangGia || !Array.isArray(bangGia)) {
            throw new Error('Dữ liệu không hợp lệ: thiếu loaiPhong hoặc bangGia');
        }

        if (bangGia.length === 0) {
            throw new Error('Vui lòng thêm ít nhất một khung giờ');
        }

        // Validate từng khung giờ
        for (let i = 0; i < bangGia.length; i++) {
            const gia = bangGia[i];
            if (!gia.KhungGio || gia.GiaTien === undefined || gia.GiaTien === null) {
                throw new Error(
                    `Khung giờ thứ ${i + 1} thiếu thông tin KhungGio hoặc GiaTien`
                );
            }
            if (gia.GiaTien < 1000) {
                throw new Error(
                    `Khung giờ "${gia.KhungGio}" có giá tiền không hợp lệ (phải từ 1,000 VNĐ)`
                );
            }
        }

        console.log('Đang xóa khung giờ cũ cho loại phòng:', loaiPhong);

        // Xóa các khung giờ cũ
        const deleteResult = await BangGiaPhongDAO.deleteByLoaiPhong(loaiPhong);

        console.log('Đã xóa:', deleteResult.deletedCount, 'khung giờ cũ');

        // Tạo mã cho từng khung giờ
        const newBangGia = [];

        // Lấy mã cuối cùng một lần để tối ưu
        const lastMaGia = await generateCode(
            'PG',
            DataModel.Data_BangGiaPhong_Model,
            'MaGia'
        );
        const lastNumber = parseInt(lastMaGia.replace('PG', '')) || 0;

        console.log('Mã cuối cùng:', lastMaGia, 'Số:', lastNumber);

        // Tạo dữ liệu mới
        for (let i = 0; i < bangGia.length; i++) {
            const gia = bangGia[i];
            const newNumber = lastNumber + i + 1;
            const maGia = `PG${newNumber.toString().padStart(3, '0')}`;

            newBangGia.push({
                MaGia: maGia,
                LoaiPhong: loaiPhong,
                KhungGio: gia.KhungGio,
                GiaTien: parseInt(gia.GiaTien),
                createdAt: new Date(),
            });

            console.log(`📝 Tạo khung giờ ${i + 1}:`, {
                maGia: maGia,
                khungGio: gia.KhungGio,
                giaTien: gia.GiaTien,
            });
        }

        console.log('Đang lưu', newBangGia.length, 'khung giờ mới...');

        // Lưu dữ liệu mới
        const result = await BangGiaPhongDAO.createMany(newBangGia);

        console.log('Đã thêm thành công:', result.length, 'khung giờ');
        console.log(
            '📋 Mã được tạo:',
            result.map((item) => item.MaGia)
        );

        return {
            soKhungGio: result.length,
            maGiaList: result.map((item) => item.MaGia),
            bangGia: result,
        };
    }

    // Quản lý loại phòng (thêm/sửa/xóa)
    async manageLoaiPhong(action, tenLoaiPhong, oldRoomType = null) {
        console.log('=== 🚨 manageLoaiPhong ===');
        console.log('Action:', action, 'TenLoaiPhong:', tenLoaiPhong);

        if (action === 'add') {
            console.log('Kiểm tra loại phòng tồn tại:', tenLoaiPhong);

            // Kiểm tra trùng
            const bangGiaList = await BangGiaPhongDAO.findByLoaiPhong(tenLoaiPhong);

            if (bangGiaList.length > 0) {
                console.log('Loại phòng đã tồn tại');
                throw new Error('Loại phòng đã tồn tại!');
            }

            console.log('Đang tạo loại phòng mới...');

            const lastMaGia = await generateCode(
                'PG',
                DataModel.Data_BangGiaPhong_Model,
                'MaGia'
            );
            const lastNumber = parseInt(lastMaGia.replace('PG', '')) || 0;

            const newNumber = lastNumber + 1;
            const maGia = `PG${newNumber.toString().padStart(3, '0')}`;

            // Tạo loại phòng mới với bảng giá rỗng
            const newRoomType = await DataModel.Data_BangGiaPhong_Model.create({
                MaGia: maGia,
                LoaiPhong: tenLoaiPhong,
                BangGia: [],
                CreatedAt: new Date(),
                UpdatedAt: new Date(),
            });

            console.log('Đã lưu loại phòng mới thành công');

            return {
                message: `Đã thêm loại phòng "${tenLoaiPhong}" thành công!`,
                data: newRoomType,
            };
        } else if (action === 'edit') {
            // SỬA LOẠI PHÒNG - CẬP NHẬT TẤT CẢ DOCUMENTS
            if (!oldRoomType) {
                throw new Error('Thiếu thông tin loại phòng cũ!');
            }

            console.log(`✏️ Đang đổi "${oldRoomType}" thành "${tenLoaiPhong}"`);

            // Kiểm tra trùng tên mới
            if (tenLoaiPhong !== oldRoomType) {
                const bangGiaList = await BangGiaPhongDAO.findByLoaiPhong(tenLoaiPhong);

                if (bangGiaList.length > 0) {
                    throw new Error('Tên loại phòng mới đã tồn tại!');
                }
            }

            // Cập nhật TRONG TẤT CẢ document có LoaiPhong cũ
            const bangGiaResult = await DataModel.Data_BangGiaPhong_Model.updateMany(
                { LoaiPhong: oldRoomType },
                {
                    $set: {
                        LoaiPhong: tenLoaiPhong,
                        UpdatedAt: new Date(),
                    },
                }
            );

            console.log(
                `📊 Đã cập nhật ${bangGiaResult.modifiedCount} document trong Data_BangGiaPhong_Model`
            );

            // Cập nhật trong collection phòng hát
            const phongHatResult = await DataModel.Data_PhongHat_Model.updateMany(
                { LoaiPhong: oldRoomType },
                { $set: { LoaiPhong: tenLoaiPhong } }
            );

            console.log(
                `📊 Đã cập nhật ${phongHatResult.modifiedCount} phòng trong Data_PhongHat_Model`
            );

            if (bangGiaResult.modifiedCount === 0 && phongHatResult.modifiedCount === 0) {
                throw new Error('Không tìm thấy loại phòng để sửa!');
            }

            return {
                message: `Đã đổi loại phòng "${oldRoomType}" thành "${tenLoaiPhong}"! (${bangGiaResult.modifiedCount} bảng giá, ${phongHatResult.modifiedCount} phòng)`,
                data: {
                    old: oldRoomType,
                    new: tenLoaiPhong,
                    bangGiaUpdated: bangGiaResult.modifiedCount,
                    phongHatUpdated: phongHatResult.modifiedCount,
                },
            };
        } else if (action === 'delete') {
            // XÓA LOẠI PHÒNG - XÓA TẤT CẢ DOCUMENTS
            console.log(`🗑️ Đang xóa loại phòng: ${tenLoaiPhong}`);

            // Kiểm tra xem loại phòng có đang được sử dụng không
            const usedRooms = await PhongHatDAO.findByLoaiPhong(tenLoaiPhong);

            if (usedRooms.length > 0) {
                throw new Error(
                    `Không thể xóa! Có ${usedRooms.length} phòng đang sử dụng loại phòng "${tenLoaiPhong}".`
                );
            }

            // Xóa TẤT CẢ document có LoaiPhong này
            const result = await BangGiaPhongDAO.deleteByLoaiPhong(tenLoaiPhong);

            console.log(
                `📊 Đã xóa ${result.deletedCount} document trong Data_BangGiaPhong_Model`
            );

            if (result.deletedCount === 0) {
                throw new Error('Không tìm thấy loại phòng để xóa!');
            }

            return {
                message: `Đã xóa loại phòng "${tenLoaiPhong}" thành công! (${result.deletedCount} bảng giá)`,
                data: { deletedCount: result.deletedCount },
            };
        } else {
            throw new Error('Action không hợp lệ!');
        }
    }

    // Xóa bảng giá theo loại phòng (kiểm tra phòng đang sử dụng)
    async deleteBangGiaByLoaiPhong(loaiPhong) {
        console.log('Đang xóa bảng giá cho:', loaiPhong);

        const roomsUsingType = await PhongHatDAO.findByLoaiPhong(loaiPhong);

        if (roomsUsingType.length > 0) {
            throw new Error(
                `Không thể xóa loại phòng "${loaiPhong}"! Có ${roomsUsingType.length} phòng đang sử dụng loại phòng này.`
            );
        }

        const deleteResult = await BangGiaPhongDAO.deleteByLoaiPhong(loaiPhong);

        console.log('Đã xóa:', deleteResult.deletedCount, 'khung giờ');

        return {
            message: `Đã xóa ${deleteResult.deletedCount} khung giờ`,
            deletedCount: deleteResult.deletedCount,
        };
    }

    // Kiểm tra loại phòng có đang được sử dụng không
    async checkLoaiPhongInUse(loaiPhong) {
        console.log('Loại phòng nhận được:', loaiPhong);

        // Kiểm tra xem có phòng nào đang sử dụng loại phòng này không
        const roomsUsingType = await BangGiaPhongDAO.findByLoaiPhong(loaiPhong);

        return {
            isUsed: roomsUsingType.length > 0,
        };
    }
}

export default new BangGiaPhongBUS();
