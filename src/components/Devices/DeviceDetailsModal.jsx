import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Tag, Table, Spin, message, Divider, Space } from 'antd';
import { useDispatch } from 'react-redux';
import { getDeviceById } from '../../store/slices/deviceSlice';

const DeviceDetailsModal = ({ open, onCancel, deviceId }) => {
  const dispatch = useDispatch();
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && deviceId) {
      fetchDeviceDetails();
    } else {
      setDeviceDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deviceId]);

  const fetchDeviceDetails = async () => {
    setLoading(true);
    try {
      const result = await dispatch(getDeviceById(deviceId)).unwrap();
      const deviceData = result?.data || result?.device || result;
      setDeviceDetails(deviceData);
    } catch (error) {
      message.error(error || 'Failed to fetch device details');
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const chipColumns = [
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
    },
    {
      title: 'Card SN',
      dataIndex: 'cardSN',
      key: 'cardSN',
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Chip Type',
      dataIndex: 'chipType',
      key: 'chipType',
      render: (text) => <Tag>{text || '-'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'chipStatus',
      key: 'chipStatus',
      render: (status) => (
        <Tag color={status === 'Active' ? 'success' : 'default'}>
          {status || '-'}
        </Tag>
      ),
    },
    {
      title: 'Assigned At',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date) => (date ? new Date(date).toLocaleString() : '-'),
    },
  ];

  const subscriptionColumns = [
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Subscription ID',
      dataIndex: 'subscriptionId',
      key: 'subscriptionId',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status || '-'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (date ? new Date(date).toLocaleString() : '-'),
    },
    {
      title: 'Expire Date',
      dataIndex: 'expireDate',
      key: 'expireDate',
      render: (date) => (date ? new Date(date).toLocaleString() : '-'),
    },
  ];

  return (
    <Modal
      title="Device Details"
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
      ) : deviceDetails ? (
        <div>
          {/* Basic Device Information */}
          <Descriptions title="Device Information" bordered column={2} size="small">
            <Descriptions.Item label="Device ID">{deviceDetails.id || '-'}</Descriptions.Item>
            <Descriptions.Item label="Local ID">{deviceDetails.localId || '-'}</Descriptions.Item>
            <Descriptions.Item label="Device Type">
              <Tag>{deviceDetails.deviceType || '-'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Sector">{deviceDetails.sector || '-'}</Descriptions.Item>
            <Descriptions.Item label="Sector Password">{deviceDetails.sectorPassword || '-'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Space>
                <Tag color={deviceDetails.isOnline ? 'success' : 'error'}>
                  {deviceDetails.isOnline ? 'Online' : 'Offline'}
                </Tag>
                <Tag color={deviceDetails.isEnabled ? 'success' : 'default'}>
                  {deviceDetails.isEnabled ? 'Enabled' : 'Disabled'}
                </Tag>
              </Space>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Manager Information */}
          {deviceDetails.manager && (
            <>
              <Descriptions title="Manager Information" bordered column={2} size="small">
                <Descriptions.Item label="Manager ID">{deviceDetails.manager.id || '-'}</Descriptions.Item>
                <Descriptions.Item label="Name">
                  {deviceDetails.manager.firstName && deviceDetails.manager.lastName
                    ? `${deviceDetails.manager.firstName} ${deviceDetails.manager.lastName}`
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">{deviceDetails.manager.email || '-'}</Descriptions.Item>
                <Descriptions.Item label="Phone">{deviceDetails.manager.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="Role">
                  <Tag>{deviceDetails.manager.role || '-'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={deviceDetails.manager.status === 1 ? 'success' : 'default'}>
                    {deviceDetails.manager.status === 1 ? 'Active' : 'Inactive'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Verified">
                  <Tag color={deviceDetails.manager.isVerified ? 'success' : 'default'}>
                    {deviceDetails.manager.isVerified ? 'Yes' : 'No'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
              <Divider />
            </>
          )}

          {/* Address Information */}
          {deviceDetails.address && (
            <>
              <Descriptions title="Address Information" bordered column={2} size="small">
                <Descriptions.Item label="Address ID">{deviceDetails.address.id || '-'}</Descriptions.Item>
                <Descriptions.Item label="Address">{deviceDetails.address.address || '-'}</Descriptions.Item>
                <Descriptions.Item label="City">{deviceDetails.address.city || '-'}</Descriptions.Item>
                <Descriptions.Item label="Latitude">{deviceDetails.address.lat || '-'}</Descriptions.Item>
                <Descriptions.Item label="Longitude">{deviceDetails.address.long || '-'}</Descriptions.Item>
                <Descriptions.Item label="Manager ID">{deviceDetails.address.managerId || '-'}</Descriptions.Item>
              </Descriptions>
              <Divider />
            </>
          )}

          {/* Chips Information */}
          {deviceDetails.chip && deviceDetails.chip.length > 0 && (
            <>
              <h3 style={{ marginBottom: 16 }}>Chips ({deviceDetails.chip.length})</h3>
              <Table
                columns={chipColumns}
                dataSource={deviceDetails.chip.map((chip) => ({ ...chip, key: chip.id }))}
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
              />
              <Divider />
            </>
          )}

          {/* User Subscriptions */}
          {deviceDetails.userSubscriptions && deviceDetails.userSubscriptions.length > 0 && (
            <>
              <h3 style={{ marginBottom: 16 }}>User Subscriptions ({deviceDetails.userSubscriptions.length})</h3>
              <Table
                columns={subscriptionColumns}
                dataSource={deviceDetails.userSubscriptions.map((sub) => ({ ...sub, key: sub.id }))}
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
              />
            </>
          )}

          {(!deviceDetails.chip || deviceDetails.chip.length === 0) &&
            (!deviceDetails.userSubscriptions || deviceDetails.userSubscriptions.length === 0) && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                No chips or subscriptions found for this device.
              </div>
            )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          No device details available
        </div>
      )}
    </Modal>
  );
};

export default DeviceDetailsModal;
