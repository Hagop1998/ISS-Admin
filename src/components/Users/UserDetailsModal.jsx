import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Tag, Table, Spin, message, Divider, Space } from 'antd';
import { userService } from '../../services/userService';

const UserDetailsModal = ({ open, onCancel, userId }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    } else {
      setUserDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

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
      footer={null}
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
                <Descriptions.Item label="Manager ID">{userDetails.address.managerId || '-'}</Descriptions.Item>
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
    </Modal>
  );
};

export default UserDetailsModal;
