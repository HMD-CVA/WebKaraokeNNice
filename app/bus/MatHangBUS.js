import MatHangDAO from '../dao/MatHangDAO.js';
import DataModel from '../model/index.js';
import { generateCode } from '../utils/codeGenerator.js';

class MatHangBUS {
    // Lấy danh sách mặt hàng để render trang
    async getAllMatHangsForPage() {
        const mathangs = await MatHangDAO.findAll();

        // Lấy danh sách loại hàng duy nhất
        const uniqueCategories = [...new Set(mathangs.map((item) => item.LoaiHang))].filter(
            Boolean
        );

        console.log(uniqueCategories);

        return {
            mathangs,
            uniqueCategories,
        };
    }

    // Lấy danh sách mặt hàng cho API hóa đơn
    async getAllMatHangsForAPI() {
        const mathangs = await MatHangDAO.findAll();

        // Lấy danh sách loại hàng duy nhất
        const uniqueCategories = [...new Set(mathangs.map((item) => item.LoaiHang))].filter(
            Boolean
        );

        console.log(uniqueCategories);
        console.log(mathangs);

        return {
            success: true,
            data: mathangs,
            categories: uniqueCategories,
            count: mathangs.length,
        };
    }

    // Lấy mặt hàng tồn kho
    async getMatHangsTonKho(params) {
        const { search, loaiHang } = params;

        let filter = { SoLuongTon: { $gt: 0 } };

        // Tìm kiếm theo tên hàng
        if (search) {
            filter.TenHang = { $regex: search, $options: 'i' };
        }

        // Lọc theo loại hàng
        if (loaiHang) {
            filter.LoaiHang = loaiHang;
        }

        const mathangs = await MatHangDAO.findInStock(filter);

        return {
            success: true,
            data: mathangs,
            count: mathangs.length,
        };
    }

    // Lấy mặt hàng theo loại hoặc tất cả
    async getMatHangsByLoaiOrAll(loaiHang) {
        let matHangs;

        if (!loaiHang) {
            matHangs = await MatHangDAO.findWithLimit(100);
        } else {
            matHangs = await MatHangDAO.findByLoaiHang(loaiHang);
        }

        return matHangs;
    }

    // Thêm mặt hàng mới
    async createMatHang(matHangData) {
        const { TenHang, LoaiHang, DonGia, DonViTinh, SoLuongTon, LinkAnh } = matHangData;

        const maMH = await generateCode('MH', DataModel.Data_MatHang_Model, 'MaHang');

        const matHang = new DataModel.Data_MatHang_Model({
            MaHang: maMH,
            TenHang: TenHang,
            LoaiHang: LoaiHang,
            DonGia: DonGia,
            DonViTinh: DonViTinh,
            SoLuongTon: SoLuongTon,
            LinkAnh: LinkAnh,
            createdAt: new Date(),
        });

        await matHang.save();

        return {
            message: 'Thêm mặt hàng thành công',
        };
    }

    // Cập nhật mặt hàng
    async updateMatHang(maMH, matHangData) {
        const { TenHang, LoaiHang, DonGia, DonViTinh, SoLuongTon, LinkAnh } = matHangData;

        console.log('Nhận: ', maMH, TenHang, LoaiHang, DonGia, DonViTinh, SoLuongTon, LinkAnh);

        const mh = await MatHangDAO.update(maMH, {
            TenHang,
            LoaiHang,
            DonGia,
            DonViTinh,
            SoLuongTon,
            LinkAnh,
            createdAt: new Date(),
        });

        if (!mh) {
            throw new Error('Không tìm thấy mặt hàng');
        }

        return {
            message: 'Cập nhật mặt hàng thành công',
        };
    }

    // Cập nhật số lượng tồn kho
    async updateSoLuongTon(maHang, soLuong) {
        console.log('Tìm mặt hàng với ID:', maHang);
        console.log('Số lượng mới:', soLuong);

        const matHang = await MatHangDAO.findByMaHang(maHang);

        if (!matHang) {
            throw new Error('Không tìm thấy mặt hàng với mã: ' + maHang);
        }

        console.log('Đã tìm thấy mặt hàng:', matHang.TenHang);

        // Cập nhật số lượng tồn kho
        const updatedMatHang = await MatHangDAO.updateSoLuongTon(maHang, soLuong);

        console.log('Đã cập nhật số lượng tồn kho:', updatedMatHang.SoLuongTon);

        return {
            success: true,
            message: 'Cập nhật số lượng tồn kho thành công',
            data: updatedMatHang,
        };
    }

    // Xóa mặt hàng
    async deleteMatHang(maHang) {
        const matHang = await MatHangDAO.deleteByMaHang(maHang);

        if (!matHang) {
            throw new Error('Không tìm thấy mặt hàng');
        }

        return {
            success: true,
            message: 'Xóa mặt hàng thành công',
        };
    }
}

export default new MatHangBUS();
