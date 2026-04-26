import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

class FileUploadService {
  constructor() {
    this.maxFileSize = 256 * 1024; // 256KB limit
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  }

  // Validate file before upload
  validateFile(file) {
    const errors = [];

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size must be less than ${this.maxFileSize / 1024}KB (256KB limit)`);
    }

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      errors.push('Only JPG, PNG, and GIF files are allowed');
    }

    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!this.allowedExtensions.includes(extension)) {
      errors.push('Invalid file extension');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Upload file to Firebase Storage
  async uploadFile(file, userId, folder = 'uploads') {
    try {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Generate unique filename
      const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = `${folder}/${userId}/${fileName}`;

      // Create storage reference
      const storageRef = ref(storage, filePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        success: true,
        url: downloadURL,
        path: filePath,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type
      };

    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete file from Firebase Storage
  async deleteFile(filePath) {
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('File delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, userId, folder = 'uploads') {
    const results = [];
    
    for (const file of files) {
      const result = await this.uploadFile(file, userId, folder);
      results.push(result);
    }

    return results;
  }

  // Get file info from URL
  getFileInfoFromURL(url) {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      return {
        fileName,
        isImage: this.allowedTypes.some(type => 
          fileName.toLowerCase().includes(type.split('/')[1])
        )
      };
    } catch (error) {
      return { fileName: 'Unknown', isImage: false };
    }
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new FileUploadService();