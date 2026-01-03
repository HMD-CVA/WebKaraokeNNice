import HoaDonDAO from '../dao/HoaDonDAO.js';
import ChiTietHDDAO from '../dao/ChiTietHDDAO.js';
import KhachHangDAO from '../dao/KhachHangDAO.js';
import MatHangDAO from '../dao/MatHangDAO.js';
import PhongHatDAO from '../dao/PhongHatDAO.js';
import { generateCode } from '../utils/codeGenerator.js';
import DataModel from '../model/index.js';

class HoaDonBUS {
    // Lấy tất cả hóa đơn
    async getAllHoaDon() {
        try {
            const hoadons = await HoaDonDAO.findAll();
            return {
                success: true,
                message: 'Lấy danh sách hóa đơn thành công',
                data: hoadons
            };
        } catch (error) {
            return {
                success: false,
                message: `Lỗi khi lấy danh sách hóa đơn: ${error.message}`,
                data: null
            };
        }
    }

    // Lấy hóa đơn theo mã
    async getHoaDonByMa(maHoaDon) {
        try {
            const hoadon = await HoaDonDAO.findByMaHoaDon(maHoaDon);
            if (!hoadon) {
                return {
                    success: false,
                    message: 'Không tìm thấy hóa đơn',
                    data: null
                };
            }

            return {
                success: true,
                message: 'Lấy thông tin hóa đơn thành công',
                data: hoadon
            };
        } catch (error) {
            return {
                success: false,
                message: `Lỗi khi lấy hóa đơn: ${error.message}`,
                data: null
            };
        }
    }

    // Lấy hóa đơn để chỉnh sửa (kèm khách hàng, phòng, chi tiết, bảng giá)
    async getHoaDonForEdit(maHoaDon) {
        try {
            // Tìm hóa đơn
            const hoaDon = await HoaDonDAO.findByMaHoaDon(maHoaDon);
            if (!hoaDon) {
                return {
                    success: false,
                    message: 'Không tìm thấy hóa đơn',
                    data: null
                };
            }

            // Tìm khách hàng
            const khachHang = await KhachHangDAO.findByMaKH(hoaDon.MaKH);

            // Tìm phòng hát
            const phongHat = await PhongHatDAO.findByMaPhong(hoaDon.MaPhong);

            // Tìm chi tiết hóa đơn
            const chiTietHoaDon = await ChiTietHDDAO.findByMaHoaDon(maHoaDon);

            // Lấy tất cả bảng giá và lọc theo loại phòng
            const bangGiaList = await DataModel.Data_BangGiaPhong_Model.find({}).lean();
            const bangGiaCuaPhong = bangGiaList.filter(
                (banggia) => banggia.LoaiPhong === phongHat?.LoaiPhong
            );

            // Lấy thông tin mặt hàng cho từng chi tiết
            const chiTietWithMatHang = await Promise.all(
                chiTietHoaDon.map(async (ct) => {
                    const matHang = await MatHangDAO.findByMaHang(ct.MaHang);
                    return {
                        ...ct,
                        MatHang: matHang ? {
                            TenHang: matHang.TenHang,
                            DonGia: matHang.DonGia,
                            DonViTinh: matHang.DonViTinh,
                            SoLuongTon: matHang.SoLuongTon,
                        } : null,
                    };
                })
            );

            // Kết hợp kết quả
            const result = {
                ...hoaDon,
                KH: khachHang ? {
                    MaKH: khachHang.MaKH,
                    TenKH: khachHang.TenKH,
                    SDT: khachHang.SDT,
                    Email: khachHang.Email,
                } : null,
                PH: phongHat ? {
                    MaPhong: phongHat.MaPhong,
                    TenPhong: phongHat.TenPhong,
                    LoaiPhong: phongHat.LoaiPhong,
                    SucChua: phongHat.SucChua,
                    TrangThai: phongHat.TrangThai,
                } : null,
                BangGia: bangGiaCuaPhong,
                ChiTietHoaDon: chiTietWithMatHang,
            };

            return {
                success: true,
                message: 'Lấy thông tin hóa đơn để chỉnh sửa thành công',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: `Lỗi khi lấy hóa đơn để chỉnh sửa: ${error.message}`,
                data: null
            };
        }
    }

    // Lấy chi tiết hóa đơn
    async getChiTietHoaDon(maHoaDon) {
        try {
            const ctHD = await ChiTietHDDAO.findByMaHoaDon(maHoaDon);

            const chiTietWithMatHang = await Promise.all(
                ctHD.map(async (chiTiet) => {
                    const matHang = await MatHangDAO.findByMaHang(chiTiet.MaHang);
                    return {
                        ...chiTiet,
                        TenHang: matHang?.TenHang || 'N/A',
                        DonViTinh: matHang?.DonViTinh || 'N/A',
                        SoLuongTon: matHang?.SoLuongTon || 0,
                        LinkAnh: matHang?.LinkAnh || '',
                    };
                })
            );

            return {
                success: true,
                message: 'Lấy chi tiết hóa đơn thành công',
                data: chiTietWithMatHang
            };
        } catch (error) {
            return {
                success: false,
                message: `Lỗi khi lấy chi tiết hóa đơn: ${error.message}`,
                data: null
            };
        }
    }

    // Tạo hóa đơn mới
    async createHoaDon(hoaDonData) {
        try {
            const { tenKH, sdtKH, emailKH, maPhong, thoiGianBatDau, tienPhong, dichVu, tongTien } = hoaDonData;

            // Tìm hoặc tạo khách hàng
            let khachHang = await KhachHangDAO.findByPhone(sdtKH);
            if (!khachHang) {
                const maKH = await generateCode('KH', DataModel.Data_KhachHang_Model, 'MaKH');
                const newKHData = {
                    MaKH: maKH,
                    TenKH: tenKH,
                    SDT: sdtKH,
                    Email: emailKH || '',
                    createdAt: new Date(),
                };
                khachHang = await KhachHangDAO.create(newKHData);
            }

            // Tạo mã hóa đơn
            const maHD = await generateCode('HD', DataModel.Data_HoaDon_Model, 'MaHoaDon');

            // Tạo hóa đơn
            const hoaDon = await HoaDonDAO.create({
                MaHoaDon: maHD,
                MaDatPhong: null,
                MaKH: khachHang.MaKH,
                MaPhong: maPhong,
                TongTien: tongTien,
                ThoiGianBatDau: new Date(thoiGianBatDau),
                ThoiGianKetThuc: null,
                TrangThai: 'Chưa thanh toán',
                createdAt: new Date(),
            });

            // Xử lý dịch vụ
            for (const dv of dichVu) {
                // Kiểm tra tồn kho
                const matHang = await MatHangDAO.findByMaHang(dv.MaHang);
                if (!matHang) {
                    throw new Error(`Mặt hàng ${dv.TenHang} không tồn tại`);
                }

                if (matHang.SoLuongTon < dv.SoLuong) {
                    throw new Error(
                        `Số lượng tồn kho không đủ cho ${dv.TenHang}. Chỉ còn ${matHang.SoLuongTon} ${matHang.DonViTinh}`
                    );
                }

                // Tạo chi tiết hóa đơn
                const maCTHD = await generateCode('CTHD', DataModel.Data_ChiTietHD_Model, 'MaCTHD');
                await ChiTietHDDAO.create({
                    MaCTHD: maCTHD,
                    MaHoaDon: hoaDon.MaHoaDon,
                    MaHang: dv.MaHang,
                    SoLuong: dv.SoLuong,
                    DonGia: dv.DonGia,
                    ThanhTien: dv.ThanhTien,
                    LoaiDichVu: matHang.LoaiHang,
                    createdAt: new Date(),
                });

                // Cập nhật tồn kho (giảm)
                await MatHangDAO.incrementSoLuongTon(dv.MaHang, -dv.SoLuong);
            }

            // Cập nhật trạng thái phòng
            await PhongHatDAO.updateTrangThai(maPhong, 'Đang sử dụng');

            return {
                success: true,
                message: `Tạo hóa đơn ${maHD} thành công`,
                data: { maHoaDon: hoaDon.MaHoaDon }
            };
        } catch (error) {
            return {
                success: false,
                message: `Lỗi khi tạo hóa đơn: ${error.message}`,
                data: null
            };
        }
    }

    // Cập nhật hóa đơn
    async updateHoaDon(maHoaDon, updateData) {
        try {
            const { maKH, tenKH, sdtKH, emailKH, maPhong, thoiGianBatDau, tienPhong, dichVu, tongTien } = updateData;

            // Tìm khách hàng để lấy _id
            const khachHang = await KhachHangDAO.findByMaKH(maKH);
            if (!khachHang) {
                throw new Error('Không tìm thấy khách hàng');
            }

            // Cập nhật thông tin khách hàng bằng _id
            await KhachHangDAO.update(khachHang._id, {
                TenKH: tenKH,
                SDT: sdtKH,
                Email: emailKH,
            });

            // Xử lý đổi phòng
            const oldHoaDon = await HoaDonDAO.findByMaHoaDon(maHoaDon);
            if (!oldHoaDon) {
                return {
                    success: false,
                    message: 'Không tìm thấy hóa đơn',
                    data: null
                };
            }

            // Nếu đổi phòng, cập nhật trạng thái phòng cũ và mới
            if (oldHoaDon.MaPhong !== maPhong) {
                await PhongHatDAO.updateTrangThai(oldHoaDon.MaPhong, 'Trống');
                await PhongHatDAO.updateTrangThai(maPhong, 'Đang sử dụng');
            }

            // Cập nhật hóa đơn
            await HoaDonDAO.update(maHoaDon, {
                MaPhong: maPhong,
                TongTien: tongTien,
                ThoiGianBatDau: thoiGianBatDau,
            });

            // Lấy chi tiết hóa đơn hiện tại
            const existingChiTiet = await ChiTietHDDAO.findByMaHoaDon(maHoaDon);

            // Tạo map để dễ tra cứu
            const existingChiTietMap = new Map();
            existingChiTiet.forEach((ct) => {
                existingChiTietMap.set(ct.MaHang, ct);
            });

            const dichVuMap = new Map();
            dichVu.forEach((dv) => {
                dichVuMap.set(dv.MaHang, dv);
            });

            // Xử lý từng dịch vụ mới
            for (const dv of dichVu) {
                const existingCT = existingChiTietMap.get(dv.MaHang);

                if (existingCT) {
                    // Dịch vụ đã tồn tại - CẬP NHẬT
                    const soLuongThayDoi = dv.SoLuong - existingCT.SoLuong;

                    if (soLuongThayDoi !== 0) {
                        // Kiểm tra tồn kho
                        const matHang = await MatHangDAO.findByMaHang(dv.MaHang);
                        if (!matHang) {
                            throw new Error(`Mặt hàng ${dv.TenHang} không tồn tại`);
                        }

                        if (soLuongThayDoi > 0 && matHang.SoLuongTon < soLuongThayDoi) {
                            throw new Error(
                                `Số lượng tồn kho không đủ cho ${dv.TenHang}. Chỉ còn ${matHang.SoLuongTon} ${matHang.DonViTinh}`
                            );
                        }

                        // Cập nhật tồn kho (tăng/giảm theo soLuongThayDoi)
                        await MatHangDAO.incrementSoLuongTon(dv.MaHang, -soLuongThayDoi);
                    }

                    // Cập nhật chi tiết hóa đơn
                    await ChiTietHDDAO.updateByMaHoaDonAndMaHang(maHoaDon, dv.MaHang, {
                        SoLuong: dv.SoLuong,
                        DonGia: dv.DonGia,
                        ThanhTien: dv.ThanhTien,
                        LoaiDichVu: dv.LoaiDichVu,
                    });
                } else {
                    // Dịch vụ mới - THÊM MỚI
                    const matHang = await MatHangDAO.findByMaHang(dv.MaHang);
                    if (!matHang) {
                        throw new Error(`Mặt hàng ${dv.TenHang} không tồn tại`);
                    }

                    if (matHang.SoLuongTon < dv.SoLuong) {
                        throw new Error(
                            `Số lượng tồn kho không đủ cho ${dv.TenHang}. Chỉ còn ${matHang.SoLuongTon} ${matHang.DonViTinh}`
                        );
                    }

                    // Tạo mã chi tiết hóa đơn mới
                    const maCTHD = await generateCode('CTHD', DataModel.Data_ChiTietHD_Model, 'MaCTHD');

                    // Thêm chi tiết hóa đơn mới
                    await ChiTietHDDAO.create({
                        MaCTHD: maCTHD,
                        MaHoaDon: maHoaDon,
                        MaHang: dv.MaHang,
                        SoLuong: dv.SoLuong,
                        DonGia: dv.DonGia,
                        ThanhTien: dv.ThanhTien,
                        LoaiDichVu: dv.LoaiDichVu || matHang.LoaiHang,
                        createdAt: new Date(),
                    });

                    // Cập nhật tồn kho (giảm)
                    await MatHangDAO.incrementSoLuongTon(dv.MaHang, -dv.SoLuong);
                }
            }

            // Xóa các dịch vụ không còn trong danh sách mới
            for (const existingCT of existingChiTiet) {
                if (!dichVuMap.has(existingCT.MaHang)) {
                    // Hoàn trả tồn kho (tăng)
                    await MatHangDAO.incrementSoLuongTon(existingCT.MaHang, existingCT.SoLuong);

                    // Xóa chi tiết hóa đơn
                    await ChiTietHDDAO.deleteByMaHoaDonAndMaHang(maHoaDon, existingCT.MaHang);
                }
            }

            return {
                success: true,
                message: 'Cập nhật hóa đơn thành công',
                data: {
                    maHoaDon: maHoaDon,
                    tongTien: tongTien,
                    soDichVu: dichVu.length,
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `Lỗi khi cập nhật hóa đơn: ${error.message}`,
                data: null
            };
        }
    }

    // Thanh toán hóa đơn
    async thanhToanHoaDon(maHoaDon, thanhToanData) {
        try {
            const { thoiGianKetThuc, tienPhong, tongTien, trangThai } = thanhToanData;

            // Cập nhật hóa đơn
            const updatedHoaDon = await HoaDonDAO.update(maHoaDon, {
                ThoiGianKetThuc: thoiGianKetThuc,
                TienPhong: tienPhong,
                TongTien: tongTien,
                TrangThai: trangThai,
            });

            if (!updatedHoaDon) {
                return {
                    success: false,
                    message: 'Không tìm thấy hóa đơn',
                    data: null
                };
            }

            // Cập nhật trạng thái phòng về "Trống"
            await PhongHatDAO.updateTrangThai(updatedHoaDon.MaPhong, 'Trống');

            return {
                success: true,
                message: 'Thanh toán thành công',
                data: {
                    MaHoaDon: updatedHoaDon.MaHoaDon,
                    TongTien: updatedHoaDon.TongTien,
                    TrangThai: updatedHoaDon.TrangThai,
                    ThoiGianKetThuc: updatedHoaDon.ThoiGianKetThuc,
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `Lỗi khi thanh toán hóa đơn: ${error.message}`,
                data: null
            };
        }
    }

    // Xóa hóa đơn
    async deleteHoaDon(maHoaDon) {
        try {
            // Tìm hóa đơn
            const hoaDon = await HoaDonDAO.findByMaHoaDon(maHoaDon);
            if (!hoaDon) {
                return {
                    success: false,
                    message: 'Không tìm thấy hóa đơn',
                    data: null
                };
            }

            const maPhong = hoaDon.MaPhong;

            // Lấy danh sách chi tiết hóa đơn để hoàn trả tồn kho
            const chiTietHoaDons = await ChiTietHDDAO.findByMaHoaDon(maHoaDon);

            // Hoàn trả tồn kho cho các mặt hàng đã sử dụng
            for (const chiTiet of chiTietHoaDons) {
                if (chiTiet.MaHang && chiTiet.LoaiDichVu !== 'Thuê phòng') {
                    // Hoàn trả tồn kho (tăng)
                    await MatHangDAO.incrementSoLuongTon(chiTiet.MaHang, chiTiet.SoLuong);
                }
            }

            // Xóa tất cả chi tiết hóa đơn
            await ChiTietHDDAO.deleteByMaHoaDon(maHoaDon);

            // Xóa hóa đơn chính
            await HoaDonDAO.delete(maHoaDon);

            // Cập nhật trạng thái phòng về "Trống"
            if (maPhong) {
                await PhongHatDAO.updateTrangThai(maPhong, 'Trống');
            }

            return {
                success: true,
                message: 'Xóa hóa đơn thành công',
                data: {
                    maHoaDon: maHoaDon,
                    soChiTietDaXoa: chiTietHoaDons.length,
                    maPhong: maPhong,
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `Lỗi khi xóa hóa đơn: ${error.message}`,
                data: null
            };
        }
    }
}

export default new HoaDonBUS();
