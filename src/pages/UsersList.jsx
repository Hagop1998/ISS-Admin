import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Breadcrumb, Popconfirm, Tooltip, Table, Input, Select, Badge, Alert, App } from 'antd';
import { HomeOutlined, DeleteOutlined, UserOutlined, SearchOutlined, CheckCircleOutlined, BellOutlined, PlusOutlined } from '@ant-design/icons';
import { fetchUsers, deleteUser, verifyUser, createUser, setSearch, setRole, setPage, setLimit } from '../store/slices/userSlice';
import { createUserSubscription } from '../store/slices/subscriptionSlice';
import { fetchDevices } from '../store/slices/deviceSlice';
import AddUserModal from '../components/Users/AddUserModal';
import SelectAddressModal from '../components/Users/SelectAddressModal';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const UsersList = () => {
  const { message } = App.useApp();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error, pagination, filters } = useSelector((state) => state.users);
  const { items: devices } = useSelector((state) => state.devices);
  const { loading: subscriptionLoading } = useSelector((state) => state.subscriptions);
  const token = useSelector((state) => state.auth.token);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isSelectAddressModalOpen, setIsSelectAddressModalOpen] = useState(false);
  const [userToVerify, setUserToVerify] = useState(null);

  // Sync search value with filter state
  useEffect(() => {
    setSearchValue(filters.search || '');
  }, [filters.search]);

  // Redirect to login if token is cleared
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Show error messages
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Fetch users when pagination or filters change
  useEffect(() => {
    if (token) {
      dispatch(fetchUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
      }));
    }
  }, [dispatch, token, pagination.page, pagination.limit, filters.search, filters.role]);

  const handleDelete = async (user) => {
    try {
      const userId = user._id || user.id;
      await dispatch(deleteUser(userId)).unwrap();
      message.success('User deleted successfully');
      // Refresh the list
      dispatch(fetchUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
      }));
    } catch (error) {
      message.error(error || 'Failed to delete user');
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    dispatch(setSearch(value));
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleRoleFilter = (value) => {
    dispatch(setRole(value));
  };

  const handleVerifyClick = (user) => {
    // Open address selection modal first
    setUserToVerify(user);
    setIsSelectAddressModalOpen(true);
  };

  const handleVerifyAndCreateSubscription = async (formValues) => {
    if (!userToVerify) return;

    try {
      const userId = userToVerify._id || userToVerify.id;
      const addressId = formValues.addressId;
      const hasSubscription = formValues.hasSubscription; 
      const subscriptionId = formValues.subscriptionId; 

      if (!userId) {
        message.error('User ID is missing');
        return;
      }

      if (!addressId) {
        message.error('Please select an address');
        return;
      }

      // First verify the user
      await dispatch(verifyUser(userId)).unwrap();

      // Only create subscription if hasSubscription is true
      if (hasSubscription === true && subscriptionId) {
        // Fetch devices using Redux action if not already loaded
        let devicesList = devices || [];
        if (!devices || devices.length === 0) {
          const devicesResponse = await dispatch(fetchDevices({ page: 1, limit: 100 })).unwrap();
          devicesList = devicesResponse?.results || devicesResponse?.data || (Array.isArray(devicesResponse) ? devicesResponse : []);
        }
        
        // Filter device by addressId
        const device = devicesList.find(dev => (dev.addressId || dev.address?.id || dev.address?._id) == addressId);
        
        if (!device || !device.id) {
          message.error('No device found for the selected address. Please ensure the address has a device assigned.');
          return;
        }

        const deviceId = device.id;

        // Create user subscription using Redux action
        const subscriptionData = {
          userId: Number(userId),
          subscriptionId: subscriptionId,
          deviceId: Number(deviceId),
        };

        await dispatch(createUserSubscription(subscriptionData)).unwrap();
        message.success('User verified and subscription created successfully.');
      } else {
        // Verify user without subscription (subscriptionId is null)
        message.success('User verified successfully without subscription.');
      }
      
      setIsSelectAddressModalOpen(false);
      setUserToVerify(null);

      // Refresh the list to get updated data
      dispatch(fetchUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
      }));
    } catch (error) {
      console.error('Verify and subscription error:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to verify user and create subscription';
      message.error(errorMessage);
    }
  };

  const handleAddUser = async (userData) => {
    try {
    
      await dispatch(createUser({
        ...userData,
        role: 'admin',
      })).unwrap();
      message.success('User created successfully');
      setIsAddUserModalOpen(false);
      dispatch(fetchUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
      }));
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Failed to create user';
      message.error(errorMessage);
    }
  };

  // Get pending verifications (unverified users)
  const pendingVerifications = useMemo(() => {
    return users.filter(user => user.isVerified === false || user.isVerified === undefined);
  }, [users]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text, record) => record.id || record._id || '-',
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (text) => text || '-',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      render: (text) => text || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <Text copyable={!!text} ellipsis={{ tooltip: text }}>
          {text || '-'}
        </Text>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || '-',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text) => (
        <span className="px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">
          {text || 'User'}
        </span>
      ),
    },
    {
      title: 'Verified',
      key: 'isVerified',
      width: 100,
      render: (_, record) => {
        const isVerified = record.isVerified === true;
        return (
          <Space>
            {isVerified ? (
              <Badge status="success" text="Verified" />
            ) : (
              <Badge status="warning" text="Pending" />
            )}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const isActive = record.isActive !== false; // Default to active if not specified
        return (
          <span className={isActive ? 'text-green-600' : 'text-red-600'}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
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
          });
        } catch {
          return text;
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        const isVerified = record.isVerified === true;
        return (
          <Space size="small">
            {!isVerified && (
              <Tooltip title="Accept & Verify User">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  onClick={() => handleVerifyClick(record)}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Accept
                </Button>
              </Tooltip>
            )}
            <Popconfirm
              title="Delete this user?"
              description="Are you sure you want to delete this user? This action cannot be undone."
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete User">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
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
            title: 'User Management',
          },
          {
            title: 'Users List',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Pending Verifications Alert */}
      {pendingVerifications.length > 0 && (
        <Alert
          message={
            <Space>
              <BellOutlined />
              <span>
                <strong>{pendingVerifications.length}</strong> user{pendingVerifications.length > 1 ? 's' : ''} waiting for verification
              </span>
            </Space>
          }
          description="New users registered from the mobile app need admin approval to continue using the app."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 24 }}
          action={
            <Button
              size="small"
              type="primary"
              onClick={() => {
                // Scroll to pending users or filter by unverified
                const unverifiedUsers = users.filter(u => !u.isVerified);
                if (unverifiedUsers.length > 0) {
                  // You could add logic to highlight or scroll to these users
                  message.info(`There are ${unverifiedUsers.length} unverified users in the table below`);
                }
              }}
            >
              View All
            </Button>
          }
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          User Management
        </Title>
        <Space size="middle" direction="vertical" style={{ width: '100%' }} className="sm:!w-auto">
          <Space size="middle" style={{ width: '100%' }} className="sm:!w-auto">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsAddUserModalOpen(true)}
            >
              Add User
            </Button>
            <Select
              placeholder="Filter by Role"
              allowClear
              style={{ width: 180 }}
              size="large"
              value={filters.role || undefined}
              onChange={handleRoleFilter}
            >
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
              <Option value="superAdmin">Super Admin</Option>
            </Select>
            <Search
              placeholder="Search users by name, email, or phone"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchValue}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              style={{ width: '100%', maxWidth: 400 }}
            />
          </Space>
        </Space>
      </div>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey={(record) => record.id || record._id}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            onChange: (page, pageSize) => {
              dispatch(setPage(page));
              dispatch(setLimit(pageSize));
            },
          }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No users found.',
          }}
        />
      </Card>

      <AddUserModal
        open={isAddUserModalOpen}
        onCancel={() => setIsAddUserModalOpen(false)}
        onSubmit={handleAddUser}
      />

      <SelectAddressModal
        open={isSelectAddressModalOpen}
        onCancel={() => {
          setIsSelectAddressModalOpen(false);
          setUserToVerify(null);
        }}
        onSubmit={handleVerifyAndCreateSubscription}
        user={userToVerify}
      />
    </div>
  );
};

export default UsersList;

