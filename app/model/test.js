import mongoose from 'mongoose';
import models from '../model/index.js';

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/QuanLyKaraoke')
  .then(() => console.log('✅ Đã kết nối MongoDB để test'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

const testAutoCode = async () => {
  try {
    console.log('🧪 Bắt đầu test auto-generate code...\n');

    // Test đơn giản với 1 nhân viên trước
    console.log('1. Test tạo nhân viên:');
    const nv1 = new models.Data_NhanVien_Model({
      TenNV: "Nguyễn Văn An",
      VaiTro: "Lễ tân",
      NgayVaoLam: new Date()
    });
    
    console.log('   Trước khi save - MaNV:', nv1.MaNV); // Should be undefined
    
    await nv1.save();
    console.log(`   ✅ Tạo thành công: ${nv1.MaNV} - ${nv1.TenNV}`);

    // Test phòng
    console.log('\n2. Test tạo phòng:');
    const phong1 = new models.Data_PhongHat_Model({
      TenPhong: "Phòng 101",
      LoaiPhong: "Nhỏ",
      SucChua: 4
    });
    
    await phong1.save();
    console.log(`   ✅ Tạo thành công: ${phong1.MaPhong} - ${phong1.TenPhong}`);

    console.log('\n🎉 Test hoàn tất!');

  } catch (error) {
    console.error('💥 Lỗi khi test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Đã đóng kết nối database.');
  }
};

// Chạy test
testAutoCode();