// app/utils/googleDrive.js
import { google } from 'googleapis';
import { fs } from 'fs';
import { path } from 'path';

// Cấu hình Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

class GoogleDriveService {
  constructor() {
    try {
      this.auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: SCOPES,
      });
      this.drive = google.drive({ version: 'v3', auth: this.auth });
    } catch (error) {
      console.error('❌ Lỗi khởi tạo Google Drive:', error);
      throw error;
    }
  }

  // Upload file lên Google Drive
  async uploadFile(file) {
    try {
      console.log('📤 Bắt đầu upload file:', file.originalname);

      const fileMetadata = {
        name: `${Date.now()}_${file.originalname}`,
        parents: ['YOUR_FOLDER_ID'], // THAY BẰNG FOLDER ID THỰC TẾ
      };

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink',
      });

      console.log('✅ File uploaded:', response.data.name);

      // Đặt quyền public
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Xóa file tạm
      fs.unlinkSync(file.path);

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        directLink: `https://drive.google.com/uc?export=view&id=${response.data.id}`,
      };
    } catch (error) {
      console.error('❌ Lỗi upload file:', error);
      // Xóa file tạm nếu có lỗi
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  // Xóa file khỏi Google Drive
  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId,
      });
      console.log(`✅ Đã xóa file ${fileId} khỏi Google Drive`);
    } catch (error) {
      console.error('❌ Lỗi xóa file:', error);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService();