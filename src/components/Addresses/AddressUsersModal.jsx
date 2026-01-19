import React, { useEffect, useState } from 'react';
import { Modal, Table, message, Spin, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { fetchDevices } from '../../store/slices/accessControlSlice';
import { getDeviceById } from '../../store/slices/deviceSlice';
import { fetchUsers } from '../../store/slices/userSlice';

const AddressUsersModal = ({ open, onCancel, address }) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && address) {
      fetchUsersForAddress();
    } else {
      setUsers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, address]);

  const fetchUsersForAddress = async () => {
    setLoading(true);
    try {
      const addressId = address?.id || address?._id;
      if (!addressId) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Step 1: Fetch all devices and filter by addressId
      const devicesResponse = await dispatch(fetchDevices({ page: 1, limit: 100 })).unwrap();
      const devices = devicesResponse?.data || devicesResponse?.results || devicesResponse?.items || (Array.isArray(devicesResponse) ? devicesResponse : []);
      
      // Filter devices for this address
      const devicesAtAddress = devices.filter(device => {
        const deviceAddressId = device.addressId || device.address?.id || device.address?._id;
        return deviceAddressId == addressId;
      });

      if (devicesAtAddress.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Step 2: Get user subscriptions from all devices at this address
      const userIds = new Set();
      
      for (const device of devicesAtAddress) {
        try {
          const deviceId = device.id || device._id;
          if (!deviceId) continue;

          const deviceDetails = await dispatch(getDeviceById(deviceId)).unwrap();
          const deviceData = deviceDetails?.data || deviceDetails?.device || deviceDetails;
          
          // Extract user IDs from userSubscriptions
          if (deviceData?.userSubscriptions && Array.isArray(deviceData.userSubscriptions)) {
            deviceData.userSubscriptions.forEach(subscription => {
              if (subscription.userId) {
                userIds.add(subscription.userId);
              }
            });
          }
        } catch (error) {
          console.error(`Error fetching device ${device.id}:`, error);
          // Continue with other devices
        }
      }

      if (userIds.size === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Step 3: Fetch all users and filter by the collected user IDs
      const allUsersResponse = await dispatch(fetchUsers({ page: 1, limit: 100 })).unwrap();
      const allUsers = allUsersResponse?.data || allUsersResponse?.users || allUsersResponse?.results || (Array.isArray(allUsersResponse) ? allUsersResponse : []);
      
      // Filter users that are in our userIds set
      const filteredUsers = allUsers.filter(user => {
        const userId = user.id || user._id;
        return userIds.has(userId);
      });

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users for address:', error);
      message.error(error.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      width: 120,
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => <Tag>{role || '-'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 || status === true ? 'success' : 'default'}>
          {status === 1 || status === true ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Verified',
      dataIndex: 'isVerified',
      key: 'isVerified',
      width: 100,
      render: (isVerified) => (
        <Tag color={isVerified ? 'success' : 'default'}>
          {isVerified ? 'Yes' : 'No'}
        </Tag>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Users at {address?.address || address?.name || 'Address'}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey={(record) => record.id || record._id}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} users`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No users found for this address',
          }}
          size="small"
          bordered
        />
      </Spin>
    </Modal>
  );
};

export default AddressUsersModal;

