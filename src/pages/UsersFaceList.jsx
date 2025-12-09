import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Typography, Breadcrumb, message, Popconfirm, Image } from 'antd';
import { SearchOutlined, HomeOutlined, ReloadOutlined, DeleteOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import { fetchUsers, setPage, setLimit, setSearch, deleteUser } from '../store/slices/userSlice';

const { Title } = Typography;

const UsersFaceList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error, pagination, filters } = useSelector((state) => state.users);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    dispatch(fetchUsers({
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
    }));
  }, [dispatch, pagination.page, pagination.limit, filters.search]);

  useEffect(() => {
    if (error) {
      if (error.includes('Unauthorized')) {
        message.error('Your session has expired. Please login again.');
      } else {
        message.error(error);
      }
    }
  }, [error]);

  // Redirect to login if token is cleared (after logout)
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const handleTableChange = (newPagination) => {
    dispatch(setPage(newPagination.current));
    dispatch(setLimit(newPagination.pageSize));
  };

  const handleDelete = async (record) => {
    try {
      await dispatch(deleteUser(record.id)).unwrap();
      message.success('User deleted successfully');
      // Refresh the list
      dispatch(fetchUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
      }));
    } catch (error) {
      message.error(error || 'Failed to delete user');
    }
  };

  const handleEdit = (record) => {
    navigate('/device-manager/device-settings', { state: { user: record } });
  };

  const columns = [
    {
      title: 'No.',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Subordinate to the Room',
      dataIndex: 'roomPath',
      key: 'roomPath',
      width: 180,
      ellipsis: true,
      render: (text, record) => {
        // Format: "Building->Building>Room" or use available data
        return text || `${record.firstName || ''} ${record.lastName || ''}->${record.email || ''}`;
      },
    },
    {
      title: 'User Name',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      ellipsis: true,
      render: (text, record) => {
        return text || `${record.firstName || ''}${record.lastName ? ` ${record.lastName}` : ''}()`;
      },
    },
    {
      title: 'Nickname',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 100,
      ellipsis: true,
      render: (text, record) => {
        return text || record.firstName || record.email || '-';
      },
    },
    {
      title: 'Face ID',
      dataIndex: 'faceId',
      key: 'faceId',
      width: 140,
      ellipsis: true,
      render: (text) => {
        return text || '0000000000000000';
      },
    },
    {
      title: 'Entry Time',
      dataIndex: 'entryTime',
      key: 'entryTime',
      width: 150,
      render: (text) => {
        if (text) return text;
        const now = new Date();
        return now.toISOString().replace('T', ' ').substring(0, 19);
      },
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      width: 80,
      render: (text) => text || '-1000088',
    },
    {
      title: 'Face',
      dataIndex: 'face',
      key: 'face',
      width: 60,
      render: (avatar, record) => {
        // Show placeholder for now - will be populated when face data is available
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
            type="primary"
            icon={<UserOutlined />}
            size="large"
          >
            + Increase the Face Card Number
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => dispatch(fetchUsers({
              page: pagination.page,
              limit: pagination.limit,
              search: filters.search,
            }))}
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
          dataSource={users}
          rowKey="id"
          loading={loading}
          rowSelection={{
            type: 'checkbox',
          }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
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

