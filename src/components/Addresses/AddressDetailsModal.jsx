import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Divider, Button, Space, Popconfirm, message, Select, Spin, Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { EnvironmentOutlined, UserOutlined, SettingOutlined, EyeOutlined, UserSwitchOutlined, DisconnectOutlined } from '@ant-design/icons';
import { fetchUsers } from '../../store/slices/userSlice';

const { Option } = Select;

const AddressDetailsModal = ({ open, onCancel, address, onViewUsers, onAssignManager, onUnassignManager }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [assignManagerModalOpen, setAssignManagerModalOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [form] = Form.useForm();
  const { users: allUsers, loading: usersLoading } = useSelector((state) => state.users);
  const [adminsFetched, setAdminsFetched] = useState(false);

  const adminUsers = allUsers.filter(u => u.role === 'admin' || u.role === 'superAdmin');

  useEffect(() => {
    if (assignManagerModalOpen && !adminsFetched) {
      dispatch(fetchUsers({ page: 1, limit: 10, role: 'admin' }))
        .unwrap()
        .then(() => {
          setAdminsFetched(true);
        })
        .catch(error => {
          console.error('Failed to fetch admin users:', error);
          setAdminsFetched(true); // Set to true even on error to prevent retry loops
          message.warning('Failed to load admin users. Please try again.');
        });
    }
  }, [assignManagerModalOpen, adminsFetched, dispatch]);

  useEffect(() => {
    if (!assignManagerModalOpen) {
      form.resetFields();
      setSelectedManagerId(null);
    }
  }, [assignManagerModalOpen, form]);

  const handleAssignManagerClick = () => {
    setAssignManagerModalOpen(true);
  };

  const handleAssignManagerSubmit = async () => {
    if (!selectedManagerId) {
      message.warning('Please select a manager');
      return;
    }

    if (onAssignManager) {
      const addressWithManager = { ...address, managerId: Number(selectedManagerId) };
      await onAssignManager(addressWithManager);
      setAssignManagerModalOpen(false);
      form.resetFields();
      setSelectedManagerId(null);
    }
  };

  if (!address) return null;

  const lat = parseFloat(address.lat);
  const long = parseFloat(address.long);
  const hasValidCoordinates = !isNaN(lat) && !isNaN(long);

  const yandexMapsUrl = hasValidCoordinates
    ? `https://yandex.com/map-widget/v1/?ll=${long},${lat}&z=15`
    : null;

  const openInYandexMaps = () => {
    if (hasValidCoordinates) {
      window.open(`https://yandex.com/maps/?pt=${long},${lat}&z=15`, '_blank');
    }
  };

  return (
    <Modal
      title="Address Details"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      <div>
        {/* Address Information */}
        <Descriptions title="Address Information" bordered column={2} size="small">
          <Descriptions.Item label="Address ID">{address.id || address._id || '-'}</Descriptions.Item>
          <Descriptions.Item label="Address">{address.address || '-'}</Descriptions.Item>
          <Descriptions.Item label="City">{address.city || '-'}</Descriptions.Item>
          <Descriptions.Item label="Manager ID">
            <Space>
              <span>{address.managerId || 'Not assigned'}</span>
              {address.managerId ? (
                onUnassignManager && (
                  <Popconfirm
                    title="Unassign manager from this address?"
                    description="Are you sure you want to unassign the manager?"
                    onConfirm={() => onUnassignManager(address)}
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
                )
              ) : (
                onAssignManager && (
                  <Button
                    type="default"
                    size="small"
                    icon={<UserSwitchOutlined />}
                    onClick={handleAssignManagerClick}
                    style={{ 
                      borderColor: '#1890ff',
                      color: '#1890ff'
                    }}
                  >
                    Assign Manager
                  </Button>
                )
              )}
            </Space>
          </Descriptions.Item>
          {address.manager && (
            <>
              <Descriptions.Item label="Manager Name">
                {address.manager.firstName && address.manager.lastName
                  ? `${address.manager.firstName} ${address.manager.lastName}`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Manager Email">{address.manager.email || '-'}</Descriptions.Item>
            </>
          )}
        </Descriptions>

        <Divider />

        {/* Coordinates */}
        <Descriptions title="Location Coordinates" bordered column={2} size="small">
          <Descriptions.Item label="Latitude">
            {hasValidCoordinates ? (
              <Space>
                <Tag color="blue">{lat.toFixed(6)}</Tag>
                <Button
                  type="link"
                  icon={<EnvironmentOutlined />}
                  onClick={openInYandexMaps}
                  size="small"
                >
                  Open in Google Maps
                </Button>
              </Space>
            ) : (
              <Tag color="default">Not available</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Longitude">
            {hasValidCoordinates ? (
              <Space>
                <Tag color="blue">{long.toFixed(6)}</Tag>
                <Button
                  type="link"
                  icon={<EnvironmentOutlined />}
                  onClick={openInYandexMaps}
                  size="small"
                >
                  Open in Google Maps
                </Button>
              </Space>
            ) : (
              <Tag color="default">Not available</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>

        {/* Map */}
        {hasValidCoordinates && (
          <>
            <Divider />
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 12 }}>Location on Map</h3>
              <div
                style={{
                  width: '100%',
                  height: '400px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={yandexMapsUrl}
                  allowFullScreen
                  title="Address Location"
                />
              </div>
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <Button
                  type="primary"
                  icon={<EnvironmentOutlined />}
                  onClick={openInYandexMaps}
                >
                  Open in Google Maps
                </Button>
              </div>
            </div>
          </>
        )}

        {!hasValidCoordinates && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <EnvironmentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p>Location coordinates are not available for this address.</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>
              Please update the address with valid latitude and longitude to view it on the map.
            </p>
          </div>
        )}

        <Divider />

        {/* Device Information */}
        {address.device && (
          <>
            <Descriptions 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span>Device Information</span>
                  <Button
                    type="default"
                    icon={<SettingOutlined />}
                    onClick={() => {
                      const deviceId = address.device.id || address.device._id;
                      if (deviceId) {
                        onCancel();
                        navigate(`/access-control/custom-settings/${deviceId}`);
                      }
                    }}
                    style={{ 
                      borderColor: '#1890ff',
                      color: '#1890ff',
                      marginLeft: 8
                    }}
                  >
                    Device Settings
                  </Button>
                </div>
              }
              bordered 
              column={2} 
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Device ID">{address.device.id || address.device._id || '-'}</Descriptions.Item>
              <Descriptions.Item label="Local ID">{address.device.localId || '-'}</Descriptions.Item>
              <Descriptions.Item label="Device Type">
                <Tag>{address.device.deviceType || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Sector">{address.device.sector || '-'}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Space>
                  <Tag color={address.device.isOnline ? 'success' : 'error'}>
                    {address.device.isOnline ? 'Online' : 'Offline'}
                  </Tag>
                  <Tag color={address.device.isEnabled ? 'success' : 'default'}>
                    {address.device.isEnabled ? 'Enabled' : 'Disabled'}
                  </Tag>
                </Space>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
          </>
        )}

        {!address.device && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
            No device associated with this address.
          </div>
        )}

        {/* Actions */}
        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => {
              if (onViewUsers) {
                onViewUsers();
              }
            }}
            size="large"
          >
            View Users at This Address
          </Button>
        </div>
      </div>

      {/* Assign Manager Modal */}
      <Modal
        title="Assign Manager"
        open={assignManagerModalOpen}
        onCancel={() => setAssignManagerModalOpen(false)}
        onOk={handleAssignManagerSubmit}
        okText="Assign"
        cancelText="Cancel"
        width={500}
        okButtonProps={{ disabled: adminUsers.length === 0 || !selectedManagerId }}
      >
        {adminUsers.length === 0 && !usersLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
            <p>There are no users with role admin.</p>
            <p style={{ fontSize: '12px', marginTop: 8 }}>
              Please create an admin user first before assigning a manager.
            </p>
          </div>
        ) : (
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
        )}
      </Modal>
    </Modal>
  );
};

export default AddressDetailsModal;
