// MongoDB Setup Script for Karaoke NNice
// Run this script using: mongosh < setup-mongodb.js
// Or connect to MongoDB and copy-paste the content

// Sử dụng database
use('karaoke_db');



// 1. TẠO COLLECTION PHÒNG HÁT
db.createCollection("phonghats", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["TenPhong", "LoaiPhong", "SucChua", "TrangThai"],
      properties: {
        MaPhong: { bsonType: "string" },
        TenPhong: { bsonType: "string" },
        LoaiPhong: { bsonType: "string" },
        SucChua: { bsonType: "number" },
        TrangThai: { bsonType: "string" },
        GhiChu: { bsonType: "string" },
        LinkAnh: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.phonghats.createIndex({ MaPhong: 1 }, { unique: true });


// 2. TẠO COLLECTION NHÂN VIÊN
db.createCollection("nhanviens", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaNV", "TenNV", "SĐT", "Email", "Password", "VaiTro", "LuongCoBan", "NgayVaoLam"],
      properties: {
        MaNV: { bsonType: "string" },
        TenNV: { bsonType: "string" },
        SĐT: { bsonType: "string" },
        Email: { bsonType: "string" },
        Password: { bsonType: "string" },
        VaiTro: { enum: ["Lễ tân", "Phục vụ", "Kỹ thuật", "Quản lý", "Bảo vệ"] },
        CaTruc: { enum: ["Sáng (6h-14h)", "Chiều (14h-22h)", "Tối (22h-6h)", "Full-time"] },
        LuongCoBan: { bsonType: "number" },
        PhuCap: { bsonType: "number" },
        NgayVaoLam: { bsonType: "date" },
        TrangThai: { enum: ["Đang làm việc", "Nghỉ phép", "Đã nghỉ việc"] },
        LinkAvatar: { bsonType: "string" },
        NgaySinh: { bsonType: "date" },
        GioiTinh: { enum: ["Nam", "Nữ"] },
        CCCD: { bsonType: "string" },
        DiaChi: { bsonType: "string" },
        SoGioLam: { bsonType: "number" },
        DoanhSo: { bsonType: "number" },
        DanhGia: { bsonType: "number", minimum: 1, maximum: 5 },
        GhiChu: { bsonType: "string" }
      }
    }
  }
});

db.nhanviens.createIndex({ MaNV: 1 }, { unique: true });
db.nhanviens.createIndex({ Email: 1 }, { unique: true });


// 3. TẠO COLLECTION KHÁCH HÀNG
db.createCollection("khachhangs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaKH", "TenKH", "SDT"],
      properties: {
        MaKH: { bsonType: "string" },
        TenKH: { bsonType: "string" },
        SDT: { bsonType: "string" },
        Email: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.khachhangs.createIndex({ MaKH: 1 }, { unique: true });


// 4. TẠO COLLECTION ĐẶT PHÒNG
db.createCollection("datphongs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaDatPhong", "MaKH", "MaPhong", "ThoiGianBatDau"],
      properties: {
        MaDatPhong: { bsonType: "string" },
        MaKH: { bsonType: "string" },
        MaPhong: { bsonType: "string" },
        ThoiGianBatDau: { bsonType: "date" },
        ThoiGianKetThuc: { bsonType: "date" },
        SoNguoi: { bsonType: "number" },
        TrangThai: { bsonType: "string" },
        GhiChu: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});
db.datphongs.createIndex({ MaDatPhong: 1 }, { unique: true });
db.datphongs.createIndex({ MaKH: 1 });
db.datphongs.createIndex({ MaPhong: 1 });


// 5. TẠO COLLECTION HÓA ĐƠN
db.createCollection("hoadons", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaHoaDon", "MaKH", "MaPhong", "TongTien"],
      properties: {
        MaHoaDon: { bsonType: "string" },
        MaDatPhong: { bsonType: "string" },
        MaKH: { bsonType: "string" },
        MaPhong: { bsonType: "string" },
        TongTien: { bsonType: "number" },
        ThoiGianTao: { bsonType: "date" },
        ThoiGianBatDau: { bsonType: "date" },
        ThoiGianKetThuc: { bsonType: "date" },
        TrangThai: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.hoadons.createIndex({ MaHoaDon: 1 }, { unique: true });
db.hoadons.createIndex({ MaDatPhong: 1 });


// 6. TẠO COLLECTION MẶT HÀNG
db.createCollection("mathangs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaHang", "TenHang", "LoaiHang", "DonGia", "DonViTinh"],
      properties: {
        MaHang: { bsonType: "string" },
        TenHang: { bsonType: "string" },
        LoaiHang: { bsonType: "string" },
        DonGia: { bsonType: "number" },
        DonViTinh: { bsonType: "string" },
        SoLuongTon: { bsonType: "number" },
        LinkAnh: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.mathangs.createIndex({ MaHang: 1 }, { unique: true });


// 7. TẠO COLLECTION CHI TIẾT HÓA ĐƠN
db.createCollection("chitiethoadons", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaCTHD", "MaHoaDon", "SoLuong", "DonGia", "ThanhTien", "LoaiDichVu"],
      properties: {
        MaCTHD: { bsonType: "string" },
        MaHoaDon: { bsonType: "string" },
        MaHang: { bsonType: "string" },
        SoLuong: { bsonType: "number" },
        DonGia: { bsonType: "number" },
        ThanhTien: { bsonType: "number" },
        LoaiDichVu: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.chitiethoadons.createIndex({ MaCTHD: 1 }, { unique: true });
db.chitiethoadons.createIndex({ MaHoaDon: 1 });


// 8. TẠO COLLECTION BẢNG GIÁ PHÒNG
db.createCollection("banggiaphongs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaGia", "LoaiPhong"],
      properties: {
        MaGia: { bsonType: "string" },
        LoaiPhong: { bsonType: "string" },
        KhungGio: { bsonType: "string" },
        GiaTien: { bsonType: "number" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.banggiaphongs.createIndex({ MaGia: 1 }, { unique: true });


// 9. TẠO COLLECTION THIẾT BỊ
db.createCollection("thietbis", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaThietBi", "MaPhong", "TenThietBi", "LoaiThietBi"],
      properties: {
        MaThietBi: { bsonType: "string" },
        MaPhong: { bsonType: "string" },
        TenThietBi: { bsonType: "string" },
        LoaiThietBi: { bsonType: "string" },
        TinhTrang: { bsonType: "string" },
        LinkAnh: { bsonType: "string" },
        NgayNhap: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.thietbis.createIndex({ MaThietBi: 1 }, { unique: true });
db.thietbis.createIndex({ MaPhong: 1 });


// 10. TẠO COLLECTION PHIẾU BẢO TRÌ
db.createCollection("phieubaotris", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaPBT"],
      properties: {
        MaPBT: { bsonType: "string" },
        MoTa: { bsonType: "string" },
        TongChiPhi: { bsonType: "number" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.phieubaotris.createIndex({ MaPBT: 1 }, { unique: true });


// 11. TẠO COLLECTION CHI TIẾT PHIẾU BẢO TRÌ
db.createCollection("chitietphieubaotris", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaCTPBT", "MaPBT"],
      properties: {
        MaCTPBT: { bsonType: "string" },
        MaPBT: { bsonType: "string" },
        MaThietBi: { bsonType: "string" },
        ChiPhi: { bsonType: "number" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.chitietphieubaotris.createIndex({ MaCTPBT: 1 }, { unique: true });
db.chitietphieubaotris.createIndex({ MaPBT: 1 });


// 12. TẠO COLLECTION PHIẾU NHẬP
db.createCollection("phieunhaps", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaPN", "NgayNhap"],
      properties: {
        MaPN: { bsonType: "string" },
        MaNV: { bsonType: "string" },
        NgayNhap: { bsonType: "date" },
        TongChiPhi: { bsonType: "number" },
        GhiChu: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.phieunhaps.createIndex({ MaPN: 1 }, { unique: true });


// 13. TẠO COLLECTION CHI TIẾT PHIẾU NHẬP HÀNG
db.createCollection("chitietphieunhaphangs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaCTPNH", "MaPN", "MaHang", "SoLuong", "DonGia"],
      properties: {
        MaCTPNH: { bsonType: "string" },
        MaPN: { bsonType: "string" },
        MaHang: { bsonType: "string" },
        SoLuong: { bsonType: "number" },
        DonGia: { bsonType: "number" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.chitietphieunhaphangs.createIndex({ MaCTPNH: 1 }, { unique: true });
db.chitietphieunhaphangs.createIndex({ MaPN: 1 });


// 14. TẠO COLLECTION CHI TIẾT PHIẾU NHẬP THIẾT BỊ
db.createCollection("chitietphieunhapthietbis", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["MaCTPNTB", "MaPN", "MaThietBi", "SoLuong", "DonGia"],
      properties: {
        MaCTPNTB: { bsonType: "string" },
        MaPN: { bsonType: "string" },
        MaThietBi: { bsonType: "string" },
        SoLuong: { bsonType: "number" },
        DonGia: { bsonType: "number" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.chitietphieunhapthietbis.createIndex({ MaCTPNTB: 1 }, { unique: true });
db.chitietphieunhapthietbis.createIndex({ MaPN: 1 });

