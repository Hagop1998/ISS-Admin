import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Typography, Breadcrumb, message, Popconfirm } from 'antd';
import { HomeOutlined, ReloadOutlined, DeleteOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { mediaService } from '../services/mediaService';

const { Title } = Typography;

const VideosList = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const lastFetchedVideosRef = useRef({ page: null, limit: null });

  // Redirect to login if token is cleared (after logout)
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Check if user is superadmin
    if (user?.role !== 'superAdmin') {
      message.error('Access denied. Only super admins can view videos.');
      navigate('/access-control/list', { replace: true });
    }
  }, [token, user, navigate]);

  // Fetch videos
  useEffect(() => {
    if (!token || user?.role !== 'superAdmin') {
      return;
    }

    // Prevent duplicate calls with the same parameters
    const currentParams = {
      page: pagination.current,
      limit: pagination.pageSize,
    };

    const lastParams = lastFetchedVideosRef.current;
    if (
      lastParams.page === currentParams.page &&
      lastParams.limit === currentParams.limit
    ) {
      return;
    }

    // Update last fetched params
    lastFetchedVideosRef.current = currentParams;

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await mediaService.getMedias({
          page: currentParams.page,
          limit: currentParams.limit,
          mediaType: 'video',
          entityType: 'advertisment',
        });
        
        // Handle different response formats
        const videosData = response?.results || response?.data || (Array.isArray(response) ? response : []);
        setVideos(videosData);
        
        // Update pagination total
        if (response?.pages?.totalCount !== undefined) {
          setPagination(prev => ({
            ...prev,
            total: response.pages.totalCount,
          }));
        } else if (response?.totalCount !== undefined) {
          setPagination(prev => ({
            ...prev,
            total: response.totalCount,
          }));
        } else if (Array.isArray(response)) {
          setPagination(prev => ({
            ...prev,
            total: response.length,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        if (error.message && error.message.includes('Unauthorized')) {
          message.error('Your session has expired. Please login again.');
        } else {
          message.error('Failed to fetch videos');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [token, user, pagination.current, pagination.pageSize]);

  // Helper function to get video URL
  const getVideoUrl = (video) => {
    if (!video) return null;
    
    const url = video.videoUrl || video.url || video.value || video.path || video.fileUrl || video.filePath;
    if (!url) return null;
    
    // If URL is already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If URL starts with /, construct full URL with API base
    if (url.startsWith('/')) {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
      return `${apiBaseUrl}${url}`;
    }
    
    // Otherwise, construct with API base path
    const apiBasePath = process.env.REACT_APP_API_BASE_PATH || '/api';
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
    return `${apiBaseUrl}${apiBasePath}${url.startsWith('/') ? url : `/${url}`}`;
  };

  // Get full video URL for delete operation
  const getVideoUrlForDelete = (video) => {
    // Return the full video URL
    return getVideoUrl(video);
  };

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
    // Reset last fetched ref to allow new fetch
    lastFetchedVideosRef.current = { page: null, limit: null };
  };

  const handleDelete = async (record) => {
    try {
      const videoUrl = getVideoUrlForDelete(record);
      if (!videoUrl) {
        message.error('Video URL not found');
        return;
      }
      
      console.log('Deleting video with full URL:', videoUrl);
      console.log('Full video record:', record);
      
      const response = await mediaService.deleteVideo(videoUrl);
      console.log('Delete response:', response);
      
      message.success('Video deleted successfully');
      
      // Refresh the list
      lastFetchedVideosRef.current = { page: null, limit: null };
      const fetchResponse = await mediaService.getMedias({
        page: pagination.current,
        limit: pagination.pageSize,
        mediaType: 'video',
        entityType: 'advertisment',
      });
      const videosData = fetchResponse?.results || fetchResponse?.data || (Array.isArray(fetchResponse) ? fetchResponse : []);
      setVideos(videosData);
    } catch (error) {
      console.error('Delete video error:', error);
      message.error(error?.message || 'Failed to delete video');
    }
  };

  const handleRefresh = () => {
    lastFetchedVideosRef.current = { page: null, limit: null };
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));
  };

  if (user?.role !== 'superAdmin') {
    return null;
  }

  const columns = [
    {
      title: 'No.',
      key: 'index',
      width: 80,
      render: (_, __, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: 'Video',
      dataIndex: 'videoUrl',
      key: 'video',
      width: 300,
      render: (_, record) => {
        const videoUrl = getVideoUrl(record);
        if (!videoUrl) {
          return <span style={{ color: '#999' }}>No video available</span>;
        }
        return (
          <video
            controls
            style={{ width: '100%', maxWidth: '300px', maxHeight: '200px' }}
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        );
      },
    },
    {
      title: 'File Name',
      key: 'fileName',
      render: (_, record) => {
        const videoUrl = getVideoUrl(record);
        if (videoUrl) {
          const urlParts = videoUrl.split('/');
          return urlParts[urlParts.length - 1];
        }
        return record.id || record._id || 'unknown';
      },
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (text) => text || 'advertisment',
    },
    {
      title: 'Media Type',
      dataIndex: 'mediaType',
      key: 'mediaType',
      render: (text) => text || 'video',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => {
        if (!text) return '-';
        try {
          const date = new Date(text);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch {
          return text;
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="Delete this video?"
          description="Are you sure you want to delete this video? This action cannot be undone."
          onConfirm={() => handleDelete(record)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

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
            title: 'Videos List',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0 }}>
          Videos List
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<VideoCameraOutlined />}
            onClick={() => navigate('/media/upload-video')}
          >
            Upload Video
          </Button>
        </Space>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={videos}
          rowKey={(record) => record.id || record._id || Math.random()}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default VideosList;
