import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, message, Typography } from 'antd';
import { useDispatch } from 'react-redux';
import { getAddressById } from '../../store/slices/addressSlice';

const { Title } = Typography;

const UserSubscriptionsModal = ({ open, onCancel, addresses }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState([]);

  useEffect(() => {
    if (open && addresses.length > 0) {
      fetchAllUserSubscriptions();
    } else {
      setUserSubscriptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, addresses]);

  const fetchAllUserSubscriptions = async () => {
    setLoading(true);
    try {
      const allSubscriptions = [];
      
      // Fetch details for each address to get userSubscriptions
      for (const address of addresses) {
        const addressId = address.id || address._id;
        if (!addressId) continue;

        try {
          const addressDetails = await dispatch(getAddressById(addressId)).unwrap();
          
          // Check if address has device and device has userSubscriptions
          if (addressDetails?.device?.userSubscriptions && Array.isArray(addressDetails.device.userSubscriptions)) {
            addressDetails.device.userSubscriptions.forEach((subscription) => {
              allSubscriptions.push({
                key: `${addressId}-${subscription.id}`,
                userId: subscription.userId,
                deviceId: subscription.deviceId,
                subscriptionId: subscription.subscriptionId,
                status: subscription.status,
                addressId: addressId,
                address: addressDetails.address || 'N/A',
                createdAt: subscription.createdAt,
                expireDate: subscription.expireDate,
                // These will be populated when backend adds user data
                userName: subscription.user?.name || null,
                userEmail: subscription.user?.email || null,
              });
            });
          }
        } catch (error) {
          console.error(`Error fetching address ${addressId}:`, error);
          // Continue with other addresses even if one fails
        }
      }

      setUserSubscriptions(allSubscriptions);
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      message.error('Failed to load user subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: 'Device ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width: 100,
    },
    {
      title: 'Subscription ID',
      dataIndex: 'subscriptionId',
      key: 'subscriptionId',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
  ];

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>User Subscriptions</Title>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={userSubscriptions}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} subscriptions`,
          }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No user subscriptions found',
          }}
        />
      </Spin>
    </Modal>
  );
};

export default UserSubscriptionsModal;

