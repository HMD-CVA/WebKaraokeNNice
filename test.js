// test-cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Test cấu hình Cloudinary
async function testCloudinary() {
  try {
    console.log('🧪 Testing Cloudinary configuration...');
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Test bằng cách upload ảnh nhỏ
    const result = await cloudinary.uploader.upload(
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwN2ZmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfmIQ8L3RleHQ+PC9zdmc+',
      {
        folder: 'test',
        resource_type: 'image'
      }
    );

    console.log('✅ Cloudinary test successful!');
    console.log('📁 Uploaded to:', result.secure_url);
    
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
    return null;
  }
}

testCloudinary();