import React, { useEffect, useState } from 'react';
import { Modal, Table, message, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { addressService } from '../../services/addressService';

const AddressUsersModal = ({ open, onCancel, address }) => {
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && address) {
      fetchUserSubscriptions();
    } else {
      setUserSubscriptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, address]);

  const fetchUserSubscriptions = async () => {
    setLoading(true);
    try {
      const addressId = address?.id || address?._id;
      if (!addressId) {
        setUserSubscriptions([]);
        setLoading(false);
        return;
      }

      // Call address/{id} endpoint to get full address details with userSubscriptions
      const addressDetails = await addressService.getAddressById(addressId);
      
      // Extract userSubscriptions from device
      let subscriptions = [];
      if (addressDetails?.device?.userSubscriptions && Array.isArray(addressDetails.device.userSubscriptions)) {
        subscriptions = addressDetails.device.userSubscriptions.map((subscription) => ({
          key: subscription.id || `${subscription.userId}-${subscription.deviceId}`,
          userId: subscription.userId,
          deviceId: subscription.deviceId,
          subscriptionId: subscription.subscriptionId,
          status: subscription.status,
          createdAt: subscription.createdAt,
          expireDate: subscription.expireDate,
          // These will be populated when backend adds user data
          userName: subscription.user?.name || subscription.user?.firstName || null,
          userEmail: subscription.user?.email || null,
        }));
      }
      
      setUserSubscriptions(subscriptions);
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      message.error(error.message || 'Failed to fetch user subscriptions');
      setUserSubscriptions([]);
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
          dataSource={userSubscriptions}
          rowKey="key"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} subscriptions`,
          }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No user subscriptions found for this address',
          }}
          size="small"
          bordered
        />
      </Spin>
    </Modal>
  );
};

export default AddressUsersModal;

