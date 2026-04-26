import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, AlertCircle, CheckCircle } from 'lucide-react';
import fileUploadService from '../services/fileUploadService';
import { useServerAuth } from '../context/ServerAuthContext';
import toast from 'react-hot-toast';

const FileUpload = ({ 
  onUploadComplete, 
  onUploadError, 
  folder = 'uploads',
  multiple = false,
  className = '',
  label = 'Upload',
  description = 'JPG, GIF or PNG, 256KB max.',
  showPreview = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const { user } = useServerAuth();

  // Handle file selection
  const handleFiles = async (files) => {
    if (!user) {
      toast.error('Please log in to upload files');
      return;
    }

    const fileArray = Array.from(files);
    setUploading(true);

    try {
      if (multiple) {
        // Upload multiple files
        const results = await fileUploadService.uploadMultipleFiles(fileArray, user.id, folder);
        const successfulUploads = results.filter(result => result.success);
        const failedUploads = results.filter(result => !result.success);

        if (successfulUploads.length > 0) {
          setUploadedFiles(prev => [...prev, ...successfulUploads]);
          onUploadComplete?.(successfulUploads);
          toast.success(`${successfulUploads.length} file(s) uploaded successfully`);
        }

        if (failedUploads.length > 0) {
          failedUploads.forEach(result => {
            toast.error(result.error);
            onUploadError?.(result.error);
          });
        }
      } else {
        // Upload single file
        const result = await fileUploadService.uploadFile(fileArray[0], user.id, folder);
        
        if (result.success) {
          setUploadedFiles([result]);
          onUploadComplete?.(result);
          toast.success('File uploaded successfully');
        } else {
          toast.error(result.error);
          onUploadError?.(result.error);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
      onUploadError?.(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Remove uploaded file
  const removeFile = async (index, filePath) => {
    try {
      if (filePath) {
        await fileUploadService.deleteFile(filePath);
      }
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
      toast.success('File removed');
    } catch (error) {
      console.error('Remove file error:', error);
      toast.error('Failed to remove file');
    }
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : uploading
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept=".jpg,.jpeg,.png,.gif"
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
            <p className="text-xs text-gray-400 mt-2">Click to browse or drag and drop</p>
          </div>
        )}
      </div>

      {/* File Preview */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  {file.type?.startsWith('image/') ? (
                    <div className="relative">
                      <Image className="w-5 h-5 text-green-500" />
                      <CheckCircle className="w-3 h-3 text-green-500 absolute -top-1 -right-1" />
                    </div>
                  ) : (
                    <File className="w-5 h-5 text-blue-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-48">
                      {file.originalName || file.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fileUploadService.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index, file.path);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-3 h-3" />
          <span>Supported formats: JPG, PNG, GIF</span>
        </div>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-3 h-3" />
          <span>Maximum file size: 256KB</span>
        </div>
        {multiple && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-3 h-3" />
            <span>You can upload multiple files at once</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;