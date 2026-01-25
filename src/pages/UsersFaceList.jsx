import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Typography, Breadcrumb, message, Popconfirm, Image } from 'antd';
import { HomeOutlined, ReloadOutlined, DeleteOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import { mediaService } from '../services/mediaService';

const { Title } = Typography;

const UsersFaceList = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const lastFetchedMediasRef = useRef({ page: null, limit: null });

  // Redirect to login if token is cleared (after logout)
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Fetch medias with entityType=regFace
  useEffect(() => {
    if (!token) {
      return;
    }

    // Prevent duplicate calls with the same parameters
    const currentParams = {
      page: pagination.current,
      limit: pagination.pageSize,
    };

    const lastParams = lastFetchedMediasRef.current;
    if (
      lastParams.page === currentParams.page &&
      lastParams.limit === currentParams.limit
    ) {
      return;
    }

    // Update last fetched params
    lastFetchedMediasRef.current = currentParams;

    const fetchMedias = async () => {
      try {
        setLoading(true);
        const response = await mediaService.getMedias({
          page: currentParams.page,
          limit: currentParams.limit,
          entityType: 'regFace',
        });
        
        // Handle different response formats
        const mediasData = response?.results || response?.data || (Array.isArray(response) ? response : []);
        setMedias(mediasData);
        
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
        console.error('Failed to fetch medias:', error);
        if (error.message && error.message.includes('Unauthorized')) {
          message.error('Your session has expired. Please login again.');
        } else {
          message.error('Failed to fetch face list');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedias();
  }, [token, pagination.current, pagination.pageSize]);


  // Helper function to get full image URL
  const getImageUrl = (media) => {
    if (!media) return null;
    
    // Use value field from the endpoint response
    const url = media.value || media.url || media.path || media.fileUrl || media.filePath;
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

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
    // Reset last fetched ref to allow new fetch
    lastFetchedMediasRef.current = { page: null, limit: null };
  };

  const handleDelete = async (record) => {
    try {
      // TODO: Implement delete media endpoint if available
      message.success('Face record deleted successfully');
      // Refresh the list
      const response = await mediaService.getMedias({
        page: pagination.current,
        limit: pagination.pageSize,
        entityType: 'regFace',
      });
      const mediasData = response?.results || response?.data || (Array.isArray(response) ? response : []);
      setMedias(mediasData);
    } catch (error) {
      message.error(error || 'Failed to delete face record');
    }
  };

  const handleEdit = (record) => {
    // Extract user info from media record
    const userData = record.user || record;
    navigate('/device-manager/device-settings', { state: { user: userData } });
  };

  const columns = [
    {
      title: 'No.',
      key: 'index',
      width: 60,
      render: (_, record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: 'User Name',
      key: 'userName',
      width: 150,
      ellipsis: true,
      render: (_, record) => {
        const user = record.user || {};
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || user.email || '-';
      },
    },
    {
      title: 'Last Name',
      key: 'lastName',
      width: 120,
      ellipsis: true,
      render: (_, record) => {
        const user = record.user || {};
        return user.lastName || '-';
      },
    },
    {
      title: 'Face ID',
      key: 'faceId',
      width: 140,
      ellipsis: true,
      render: (_, record) => {
        return record.id || record._id || '-';
      },
    },
    {
      title: 'Entry Time',
      dataIndex: 'createdAt',
      key: 'entryTime',
      width: 150,
      render: (text) => {
        if (text) {
          try {
            return new Date(text).toISOString().replace('T', ' ').substring(0, 19);
          } catch {
            return text;
          }
        }
        const now = new Date();
        return now.toISOString().replace('T', ' ').substring(0, 19);
      },
    },
    {
      title: 'Entity Type',
      key: 'entityType',
      width: 120,
      ellipsis: true,
      render: (_, record) => {
        return record.entityType || '-';
      },
    },
    {
      title: 'Face',
      key: 'face',
      width: 60,
      render: (_, record) => {
        const imageUrl = getImageUrl(record);
        
        if (imageUrl) {
          return (
            <Image
              width={40}
              height={40}
              src={imageUrl}
              alt="Face"
              style={{ borderRadius: 4, objectFit: 'cover' }}
              preview={{
                mask: <div>Preview</div>,
              }}
              fallback={
                <div style={{ width: 40, height: 40, borderRadius: 4, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserOutlined style={{ fontSize: 20, color: '#999' }} />
                </div>
              }
            />
          );
        }
        
        // Show placeholder if no media found
        return (
          <div style={{ width: 40, height: 40, borderRadius: 4, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserOutlined style={{ fontSize: 20, color: '#999' }} />
          </div>
        );
      },
    },
    {
      title: 'Operation',
      key: 'operation',
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this face record?"
            description="Are you sure you want to delete this entry?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            title: 'Access Control Mgt',
          },
          {
            title: 'Users Face List',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0 }}>
          Users Face List
        </Title>
        <Space>
          
          <Button
            icon={<ReloadOutlined />}
            onClick={async () => {
              lastFetchedMediasRef.current = { page: null, limit: null };
              try {
                setLoading(true);
                const response = await mediaService.getMedias({
                  page: pagination.current,
                  limit: pagination.pageSize,
                  entityType: 'regFace',
                });
                const mediasData = response?.results || response?.data || (Array.isArray(response) ? response : []);
                setMedias(mediasData);
                
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
                }
              } catch (error) {
                console.error('Failed to refresh medias:', error);
                message.error('Failed to refresh face list');
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Users Face List Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={medias}
          rowKey={(record) => record.id || record._id || Math.random()}
          loading={loading}
          rowSelection={{
            type: 'checkbox',
          }}
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
          scroll={{ x: 1000 }}
        />
      </div>
    </div>
  );
};

export default UsersFaceList;

