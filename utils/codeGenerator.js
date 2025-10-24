import mongoose from "mongoose";

/**
 * Hàm tự động sinh mã cho các collection
 * @param {String} prefix - Tiền tố mã (VD: 'NV', 'P', 'HD')
 * @param {mongoose.Model} model - Model Mongoose
 * @param {String} field - Tên trường mã (mặc định: 'Ma')
 * @returns {String} - Mã mới
 */
export const generateCode = async (prefix, model, field = 'Ma') => {
  try {
    const lastDoc = await model.findOne().sort({ [field]: -1 }).exec();
    let newNumber = 1;
    
    if (lastDoc && lastDoc[field]) {
      const lastCode = lastDoc[field];
      // Lấy số từ mã cuối cùng (VD: "NV015" -> 15)
      const lastNumber = parseInt(lastCode.replace(prefix, '')) || 0;
      newNumber = lastNumber + 1;
    }
    
    return `${prefix}${newNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Lỗi khi sinh mã:', error);
    // Trả về mã mặc định nếu có lỗi
    return `${prefix}001`;
  }
};