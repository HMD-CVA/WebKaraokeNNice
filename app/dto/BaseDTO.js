/**
 * Base DTO Class
 * Lớp cơ sở cho tất cả các DTO
 */
export class BaseDTO {
    /**
     * Chuyển đổi một document MongoDB thành DTO
     * @param {Object} data - Document từ MongoDB
     * @returns {Object} - DTO object
     */
    static toDTO(data) {
        if (!data) return null;
        if (Array.isArray(data)) {
            return data.map(item => this.toDTO(item));
        }
        
        // Chuyển đổi Mongoose document thành plain object
        const plainObject = data.toObject ? data.toObject() : data;
        
        // Xóa các trường không cần thiết (giữ lại _id vì MongoDB dùng để update/delete)
        delete plainObject.__v;
        
        return plainObject;
    }

    /**
     * Chuyển đổi mảng documents thành mảng DTOs
     * @param {Array} dataArray - Mảng documents từ MongoDB
     * @returns {Array} - Mảng DTO objects
     */
    static toDTOList(dataArray) {
        if (!Array.isArray(dataArray)) return [];
        return dataArray.map(item => this.toDTO(item));
    }

    /**
     * Loại bỏ các trường null/undefined
     * @param {Object} obj - Object cần làm sạch
     * @returns {Object} - Object đã được làm sạch
     */
    static removeNullFields(obj) {
        const cleaned = {};
        for (const key in obj) {
            if (obj[key] !== null && obj[key] !== undefined) {
                cleaned[key] = obj[key];
            }
        }
        return cleaned;
    }
}
