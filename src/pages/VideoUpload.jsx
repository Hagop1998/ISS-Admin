import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Upload, Button, Card, Typography, Breadcrumb, message, Space, Select, Progress } from 'antd';
import { HomeOutlined, UploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { mediaService } from '../services/mediaService';

const { Title } = Typography;
const { Option } = Select;

const VideoUpload = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Check if user` superadmin
    if (user?.role !== 'superAdmin') {
      message.error('Access denied. Only admins can upload videos.');
      navigate('/access-control/list', { replace: true });
    }
  }, [token, user, navigate]);

  const getAllowedExtensions = () => ['mp4', 'mov', 'avi', 'mkv'];
  
  const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const beforeUpload = (file) => {
    // Clear any previous errors
    setFileError('');

    // Check file extension (server allows: mp4, mov, avi, mkv)
    const allowedExtensions = getAllowedExtensions();
    const fileExtension = getFileExtension(file.name);
    
    if (!allowedExtensions.includes(fileExtension)) {
      const errorMsg = `Invalid file type! Only ${allowedExtensions.map(ext => ext.toUpperCase()).join(', ')} files are allowed. Your file: ${fileExtension || 'unknown'}`;
      message.error(errorMsg);
      setFileError(errorMsg);
      return Upload.LIST_IGNORE;
    }

    // Also check MIME type as secondary validation
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      const errorMsg = `Invalid file type! Only video files (${allowedExtensions.map(ext => ext.toUpperCase()).join(', ')}) are allowed.`;
      message.error(errorMsg);
      setFileError(errorMsg);
      return Upload.LIST_IGNORE;
    }

    // Check file size (500MB max)
    const fileSizeMB = file.size / 1024 / 1024;
    const isLt500M = fileSizeMB < 500;
    if (!isLt500M) {
      const errorMsg = `File size exceeds limit! Maximum size: 500MB. Your file: ${fileSizeMB.toFixed(2)}MB`;
      message.error(errorMsg);
      setFileError(errorMsg);
      return Upload.LIST_IGNORE;
    }

    // Clear error if validation passes
    setFileError('');
    // Return false to prevent auto-upload - we handle it manually on form submit
    return false;
  };

  const handleChange = (info) => {
    let newFileList = [...info.fileList];

    // Limit to 1 file
    newFileList = newFileList.slice(-1);

    // Update file list - when beforeUpload returns false, file is still added to list
    setFileList(newFileList);

    // Clear error when file is selected
    if (newFileList.length > 0) {
      setFileError('');
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setUploadProgress(0);
    setFileError('');
  };

  const handleSubmit = async (values) => {
    // Validate file is selected
    if (fileList.length === 0) {
      setFileError('Please select a video file to upload');
      message.error('Please select a video file to upload');
      return;
    }

    // Get the actual file object - Ant Design stores it in originFileObj or as the file itself
    const fileItem = fileList[0];
    const file = fileItem?.originFileObj || fileItem;
    
    if (!file || !(file instanceof File)) {
      const errorMsg = 'Please select a valid video file';
      setFileError(errorMsg);
      message.error(errorMsg);
      return;
    }

    // Validate file extension (server allows: mp4, mov, avi, mkv)
    const allowedExtensions = getAllowedExtensions();
    const fileExtension = getFileExtension(file.name);
    
    if (!allowedExtensions.includes(fileExtension)) {
      const errorMsg = `Invalid file type! Only ${allowedExtensions.map(ext => ext.toUpperCase()).join(', ')} files are allowed. Your file: ${fileExtension || 'unknown'}`;
      setFileError(errorMsg);
      message.error(errorMsg);
      return;
    }

    // Also check MIME type as secondary validation
    if (!file.type.startsWith('video/')) {
      const errorMsg = `Invalid file type! Only video files (${allowedExtensions.map(ext => ext.toUpperCase()).join(', ')}) are allowed.`;
      setFileError(errorMsg);
      message.error(errorMsg);
      return;
    }

    // Validate file size (500MB max)
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB >= 500) {
      const errorMsg = `File size exceeds limit! Maximum size: 500MB. Your file: ${fileSizeMB.toFixed(2)}MB`;
      setFileError(errorMsg);
      message.error(errorMsg);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', values.source || 'advertisment');

      const response = await mediaService.uploadVideo(formData, (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      // Show success message with video URL if available
      const successMessage = response?.videoUrl 
        ? `Video uploaded successfully! URL: ${response.videoUrl}`
        : 'Video uploaded successfully!';
      message.success(successMessage);
      
      // Clear form and file list after successful upload
      form.resetFields();
      setFileList([]);
      setUploadProgress(0);
      setFileError(''); // Clear any validation errors
    } catch (error) {
      console.error('Video upload error:', error);
      
      // Extract error message properly
      let errorMsg = 'Failed to upload video';
      if (error?.message) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      
      // Set error in form field
      setFileError(errorMsg);
      message.error(errorMsg);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'superAdmin') {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden">
      <Breadcrumb
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            title: 'Media Management',
          },
          {
            title: 'Upload Video',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0 }}>
          Upload Video
        </Title>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label="Video File"
            required
            validateStatus={fileError ? 'error' : ''}
            help={fileError || (fileList.length === 0 ? 'Please select a video file' : '')}
          >
            <Upload
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              onRemove={handleRemove}
              maxCount={1}
              accept=".mp4,.mov,.avi,.mkv,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
              customRequest={() => {}} // Prevent auto-upload, we handle it manually
            >
              <Button icon={<UploadOutlined />} disabled={uploading}>
                Select Video
              </Button>
            </Upload>
            <div style={{ 
              marginTop: 8, 
              fontSize: '12px', 
              color: fileError ? '#ff4d4f' : '#999' 
            }}>
              Supported formats: MP4, MOV, AVI, MKV. Maximum size: 500MB
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress percent={uploadProgress} style={{ marginTop: 8 }} />
            )}
          </Form.Item>

          <Form.Item
            name="source"
            label="Source"
            rules={[
              { required: true, message: 'Please select source' },
            ]}
            initialValue="advertisment"
          >
            <Select placeholder="Select source">
              <Option value="advertisment">Advertisement</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<VideoCameraOutlined />}
                loading={uploading}
                size="large"
                disabled={fileList.length === 0}
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setFileList([]);
                  setUploadProgress(0);
                  setFileError('');
                }}
                size="large"
                disabled={uploading}
              >
                Reset
              </Button>
              <Button
                onClick={() => navigate(-1)}
                size="large"
                disabled={uploading}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default VideoUpload;
