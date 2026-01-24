import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Tag, Table, Spin, message, Divider, Space, Button, Popconfirm, Select, Form } from 'antd';
import { DeleteOutlined, UserSwitchOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, fetchUsers } from '../../store/slices/userSlice';
import { updateAddress } from '../../store/slices/addressSlice';

const { Option } = Select;

const UserDetailsModal = ({ open, onCancel, userId, onUserDeleted }) => {
  const dispatch = useDispatch();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assignManagerModalOpen, setAssignManagerModalOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [form] = Form.useForm();
  const { users: allUsers, loading: usersLoading } = useSelector((state) => state.users);
  const [adminsFetched, setAdminsFetched] = useState(false);

  const adminUsers = allUsers.filter(u => u.role === 'admin' || u.role === 'superAdmin');

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    } else {
      setUserDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  useEffect(() => {
    if (assignManagerModalOpen && !adminsFetched && adminUsers.length === 0) {
      dispatch(fetchUsers({ page: 1, limit: 100, role: 'admin' }))
        .then(() => setAdminsFetched(true))
        .catch(error => {
          console.error('Failed to fetch admin users:', error);
          message.error('Failed to load admin users');
        });
    }
  }, [assignManagerModalOpen, adminsFetched, adminUsers.length, dispatch]);

  useEffect(() => {
    if (!assignManagerModalOpen) {
      form.resetFields();
      setSelectedManagerId(null);
    }
  }, [assignManagerModalOpen, form]);

  const handleAssignManagerSubmit = async () => {
    if (!selectedManagerId) {
      message.warning('Please select a manager');
      return;
    }

    try {
      const addressId = userDetails.address.id || userDetails.address._id;
      await dispatch(updateAddress({ 
        id: addressId, 
        addressData: { managerId: Number(selectedManagerId) } 
      })).unwrap();
      
      message.success('Address assigned to manager successfully');
      setAssignManagerModalOpen(false);
      form.resetFields();
      setSelectedManagerId(null);
      fetchUserDetails();
    } catch (error) {
      message.error(error?.message || 'Failed to assign address to manager');
    }
  };

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_PATH || '/api'}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('iss_admin_token') && { Authorization: `Bearer ${localStorage.getItem('iss_admin_token')}` }),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }
        let errorMessage = 'Failed to fetch user details';
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch (error) {
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      message.error(error.message || 'Failed to fetch user details');
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;

    setDeleting(true);
    try {
      await dispatch(deleteUser(userId)).unwrap();
      message.success('User deleted successfully');
      onCancel();
      if (onUserDeleted) {
        onUserDeleted();
      }
    } catch (error) {
      message.error(error || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const familyMembersColumns = [
    {
      title: 'ID',
      dataIndex: ['user', 'id'],
      key: 'id',
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => {
        const user = record.user;
        if (user) {
          return `${user.firstName || ''} ${user.lastName || ''}`.trim() || '-';
        }
        return '-';
      },
    },
    {
      title: 'Email',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag>{role || '-'}</Tag>,
    },
    {
      title: 'Invited At',
      dataIndex: 'invitedAt',
      key: 'invitedAt',
      render: (date) => (date ? new Date(date).toLocaleString() : '-'),
    },
    {
      title: 'Accepted At',
      dataIndex: 'acceptedAt',
      key: 'acceptedAt',
      render: (date) => (date ? new Date(date).toLocaleString() : '-'),
    },
  ];

  return (
    <Modal
      title="User Details"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Close
        </Button>,
        <Popconfirm
          key="delete"
          title="Delete this user?"
          description="Are you sure you want to delete this user? This action cannot be undone."
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
          okType="danger"
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            loading={deleting}
          >
            Delete User
          </Button>
        </Popconfirm>,
      ]}
      width={900}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : userDetails ? (
        <div>
          {/* Basic User Information */}
          <Descriptions title="User Information" bordered column={2} size="small">
            <Descriptions.Item label="User ID">{userDetails.id || '-'}</Descriptions.Item>
            <Descriptions.Item label="First Name">{userDetails.firstName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{userDetails.lastName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Email">{userDetails.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="Phone">{userDetails.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag>{userDetails.role || '-'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={userDetails.status === 1 || userDetails.status === true ? 'success' : 'default'}>
                {userDetails.status === 1 || userDetails.status === true ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Verified">
              <Tag color={userDetails.isVerified ? 'success' : 'default'}>
                {userDetails.isVerified ? 'Yes' : 'No'}
              </Tag>
            </Descriptions.Item>
            {userDetails.bio && (
              <Descriptions.Item label="Bio" span={2}>
                {userDetails.bio}
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Address Information */}
          {userDetails.address && (
            <>
              <Divider />
              <Descriptions title="Address Information" bordered column={2} size="small">
                <Descriptions.Item label="Address ID">{userDetails.address.id || '-'}</Descriptions.Item>
                <Descriptions.Item label="Address">{userDetails.address.address || '-'}</Descriptions.Item>
                <Descriptions.Item label="City">{userDetails.address.city || '-'}</Descriptions.Item>
                <Descriptions.Item label="Manager ID">
                  <Space>
                    <span>{userDetails.address.managerId || 'Not assigned'}</span>
                    {userDetails.address.managerId ? (
                      <Popconfirm
                        title="Unassign manager from this address?"
                        description="Are you sure you want to unassign the manager?"
                        onConfirm={async () => {
                          try {
                            const addressId = userDetails.address.id || userDetails.address._id;
                            await dispatch(updateAddress({ 
                              id: addressId, 
                              addressData: { managerId: null } 
                            })).unwrap();
                            message.success('Manager unassigned from address successfully');
                            // Refresh user details to get updated address info
                            fetchUserDetails();
                          } catch (error) {
                            message.error(error?.message || 'Failed to unassign manager from address');
                          }
                        }}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="default"
                          size="small"
                          icon={<DisconnectOutlined />}
                          style={{ 
                            borderColor: '#1890ff',
                            color: '#1890ff'
                          }}
                        >
                          Unassign Manager
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Button
                        type="default"
                        size="small"
                        icon={<UserSwitchOutlined />}
                        onClick={() => {
                          message.info('Please assign manager from the Addresses page');
                        }}
                        style={{ 
                          borderColor: '#1890ff',
                          color: '#1890ff'
                        }}
                      >
                        Assign Manager
                      </Button>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Latitude">{userDetails.address.lat || '-'}</Descriptions.Item>
                <Descriptions.Item label="Longitude">{userDetails.address.long || '-'}</Descriptions.Item>
              </Descriptions>
            </>
          )}

          {/* Device Information */}
          {userDetails.device && (
            <>
              <Divider />
              <Descriptions title="Device Information" bordered column={2} size="small">
                <Descriptions.Item label="Device ID">{userDetails.device.id || '-'}</Descriptions.Item>
                <Descriptions.Item label="Local ID">{userDetails.device.localId || '-'}</Descriptions.Item>
                <Descriptions.Item label="Device Type">
                  <Tag>{userDetails.device.deviceType || '-'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Sector">{userDetails.device.sector || '-'}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Space>
                    <Tag color={userDetails.device.isOnline ? 'success' : 'error'}>
                      {userDetails.device.isOnline ? 'Online' : 'Offline'}
                    </Tag>
                    <Tag color={userDetails.device.isEnabled ? 'success' : 'default'}>
                      {userDetails.device.isEnabled ? 'Enabled' : 'Disabled'}
                    </Tag>
                  </Space>
                </Descriptions.Item>
                {userDetails.device.address && (
                  <>
                    <Descriptions.Item label="Device Address">{userDetails.device.address.address || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Device City">{userDetails.device.address.city || '-'}</Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </>
          )}

          {/* Chip Information */}
          {userDetails.chip && (
            <>
              <Divider />
              <Descriptions title="Chip Information" bordered column={2} size="small">
                <Descriptions.Item label="Chip ID">{userDetails.chip.id || '-'}</Descriptions.Item>
                <Descriptions.Item label="Serial Number">{userDetails.chip.serialNumber || '-'}</Descriptions.Item>
                <Descriptions.Item label="Card SN">{userDetails.chip.cardSN || '-'}</Descriptions.Item>
                <Descriptions.Item label="User ID">{userDetails.chip.userId || '-'}</Descriptions.Item>
                <Descriptions.Item label="Device ID">{userDetails.chip.deviceId || '-'}</Descriptions.Item>
                <Descriptions.Item label="Chip Type">
                  <Tag>{userDetails.chip.chipType || '-'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={userDetails.chip.chipStatus === 'Active' ? 'success' : 'default'}>
                    {userDetails.chip.chipStatus || '-'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Assigned At">
                  {userDetails.chip.assignedAt ? new Date(userDetails.chip.assignedAt).toLocaleString() : '-'}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {/* User Subscription Information */}
          {userDetails.userSubscription && (
            <>
              <Divider />
              <Descriptions title="Subscription Information" bordered column={2} size="small">
                <Descriptions.Item label="Subscription ID">{userDetails.userSubscription.id || '-'}</Descriptions.Item>
                <Descriptions.Item label="User ID">{userDetails.userSubscription.userId || '-'}</Descriptions.Item>
                <Descriptions.Item label="Device ID">{userDetails.userSubscription.deviceId || '-'}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={userDetails.userSubscription.status === 'active' ? 'success' : 'default'}>
                    {userDetails.userSubscription.status || '-'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {userDetails.userSubscription.createdAt ? new Date(userDetails.userSubscription.createdAt).toLocaleString() : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Expire Date">
                  {userDetails.userSubscription.expireDate ? new Date(userDetails.userSubscription.expireDate).toLocaleString() : '-'}
                </Descriptions.Item>
              </Descriptions>

              {/* Subscription Plan */}
              {userDetails.userSubscription.subscription && (
                <>
                  <Divider />
                  <Descriptions title="Subscription Plan" bordered column={2} size="small">
                    <Descriptions.Item label="Plan ID">{userDetails.userSubscription.subscription.id || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Plan Name">{userDetails.userSubscription.subscription.name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Description" span={2}>
                      {userDetails.userSubscription.subscription.description || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Price">
                      {userDetails.userSubscription.subscription.price ? `$${userDetails.userSubscription.subscription.price}` : '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}

              {/* Family Members */}
              {userDetails.userSubscription.familyMembers && userDetails.userSubscription.familyMembers.length > 0 && (
                <>
                  <Divider />
                  <h3 style={{ marginBottom: 16 }}>Family Members ({userDetails.userSubscription.familyMembers.length})</h3>
                  <Table
                    columns={familyMembersColumns}
                    dataSource={userDetails.userSubscription.familyMembers.map((member) => ({ ...member, key: member.id }))}
                    pagination={false}
                    size="small"
                    scroll={{ x: 'max-content' }}
                  />
                </>
              )}

              {/* Subscription Device */}
              {userDetails.userSubscription.device && (
                <>
                  <Divider />
                  <Descriptions title="Subscription Device" bordered column={2} size="small">
                    <Descriptions.Item label="Device ID">{userDetails.userSubscription.device.id || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Local ID">{userDetails.userSubscription.device.localId || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Device Type">
                      <Tag>{userDetails.userSubscription.device.deviceType || '-'}</Tag>
                    </Descriptions.Item>
                    {userDetails.userSubscription.device.address && (
                      <>
                        <Descriptions.Item label="Device Address">{userDetails.userSubscription.device.address.address || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Device City">{userDetails.userSubscription.device.address.city || '-'}</Descriptions.Item>
                      </>
                    )}
                  </Descriptions>
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          No user details available
        </div>
      )}

      {/* Assign Manager Modal */}
      <Modal
        title="Assign Manager"
        open={assignManagerModalOpen}
        onCancel={() => setAssignManagerModalOpen(false)}
        onOk={handleAssignManagerSubmit}
        okText="Assign"
        cancelText="Cancel"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Select Manager"
            rules={[{ required: true, message: 'Please select a manager' }]}
          >
            <Select
              placeholder="Select a manager"
              showSearch
              loading={usersLoading}
              value={selectedManagerId}
              onChange={(value) => setSelectedManagerId(value)}
              filterOption={(input, option) =>
                String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={usersLoading ? <Spin size="small" /> : 'No admin users found'}
            >
              {adminUsers.map((adminUser) => (
                <Option 
                  key={adminUser.id || adminUser._id} 
                  value={adminUser.id || adminUser._id}
                >
                  {adminUser.firstName && adminUser.lastName
                    ? `${adminUser.firstName} ${adminUser.lastName} (${adminUser.email || 'No email'})`
                    : adminUser.email || `Admin ${adminUser.id || adminUser._id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default UserDetailsModal;
