import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, Card, Typography, Breadcrumb, message, Space, Spin } from 'antd';
import { HomeOutlined, SaveOutlined } from '@ant-design/icons';
import { createUserSubscription } from '../store/slices/subscriptionSlice';
import { fetchUsers } from '../store/slices/userSlice';
import { fetchDevices } from '../store/slices/deviceSlice';

const { Title } = Typography;
const { Option } = Select;

const CreateSubscription = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { items: devices, chipsLoading: devicesLoading } = useSelector((state) => state.devices);
  const { loading: subscriptionLoading } = useSelector((state) => state.subscriptions);
  const [loading, setLoading] = useState(false);
  const hasFetchedUsersRef = useRef(false);
  const hasFetchedDevicesRef = useRef(false);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    if (user?.role !== 'superAdmin') {
      message.error('Access denied. Only super admins can create subscriptions.');
      navigate('/access-control/list', { replace: true });
    }
  }, [token, user, navigate]);

  useEffect(() => {
    if (!token || user?.role !== 'superAdmin') {
      return;
    }

    // Prevent duplicate calls
    if (!hasFetchedUsersRef.current) {
      hasFetchedUsersRef.current = true;
      dispatch(fetchUsers({ page: 1, limit: 10 }));
    }

    if (!hasFetchedDevicesRef.current) {
      hasFetchedDevicesRef.current = true;
      dispatch(fetchDevices({ page: 1, limit: 10 }));
    }
  }, [dispatch, token, user]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const subscriptionData = {
        userId: Number(values.userId),
        subscriptionId: Number(values.subscriptionId),
        deviceId: Number(values.deviceId),
      };

      await dispatch(createUserSubscription(subscriptionData)).unwrap();
      message.success('Subscription created successfully');
      form.resetFields();
    } catch (error) {
      message.error(error || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const usersList = Array.isArray(users) ? users : [];
  
  const devicesList = Array.isArray(devices) 
    ? devices 
    : (devices?.results || devices?.data || []);

  if (user?.role !== 'superAdmin') {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden">
      <Breadcrumb
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            title: 'Subscription Management',
          },
          {
            title: 'Create Subscription',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0 }}>
          Create Subscription
        </Title>
      </div>

      <Card>
        <Spin spinning={usersLoading || devicesLoading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="userId"
              label="User"
              rules={[
                { required: true, message: 'Please select a user' },
              ]}
            >
              <Select
                placeholder="Search and select a user"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const user = usersList.find(u => (u.id || u._id) == option.value);
                  if (!user) return false;
                  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                  const email = user.email || '';
                  const searchText = `${name} ${email}`.toLowerCase();
                  return searchText.includes(input.toLowerCase());
                }}
                loading={usersLoading}
                notFoundContent={usersLoading ? <Spin size="small" /> : 'No users found'}
                style={{ width: '100%' }}
              >
                {usersList.length > 0 ? (
                  usersList.map((user) => {
                    const userId = user.id || user._id;
                    const firstName = user.firstName || '';
                    const lastName = user.lastName || '';
                    const userName = `${firstName} ${lastName}`.trim() || user.email || `User ${userId}`;
                    const userEmail = user.email || 'No email';
                    return (
                      <Option key={userId} value={userId} label={`${userName} (${userEmail})`}>
                        <div>
                          <div style={{ fontWeight: 500, color: '#000' }}>{userName}</div>
                          {/* <div style={{ fontSize: '12px', color: '#999' }}>{userEmail}</div> */}
                        </div>
                      </Option>
                    );
                  })
                ) : (
                  <Option disabled value="no-users">No users available</Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item
              name="subscriptionId"
              label="Subscription Type"
              rules={[
                { required: true, message: 'Please select a subscription type' },
              ]}
            >
              <Select
                placeholder="Select subscription type"
              >
                <Option value={1}>Basic Subscription</Option>
                <Option value={2}>Premium</Option>
                <Option value={3}>Ultra Premium</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="deviceId"
              label="Device"
              rules={[
                { required: true, message: 'Please select a device' },
              ]}
            >
              <Select
                placeholder="Search and select a device"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const device = devicesList.find(d => (d.id || d._id) == option.value);
                  if (!device) return false;
                  const name = device.name || '';
                  const serial = device.serialNumber || '';
                  const localId = device.localId || '';
                  const searchText = `${name} ${serial} ${localId}`.toLowerCase();
                  return searchText.includes(input.toLowerCase());
                }}
                loading={devicesLoading}
                notFoundContent={devicesLoading ? <Spin size="small" /> : 'No devices found'}
                style={{ width: '100%' }}
              >
                {devicesList.length > 0 ? (
                  devicesList.map((device) => {
                    const deviceId = device.id || device._id;
                    const deviceName = device.name || 'Unnamed Device';
                    const serialNumber = device.serialNumber || 'N/A';
                    const localId = device.localId || '';
                    const deviceLabel = `${deviceName}${serialNumber !== 'N/A' ? ` (${serialNumber})` : ''}`;
                    return (
                      <Option key={deviceId} value={deviceId} label={deviceLabel}>
                        <div>
                          {/* <div style={{ fontWeight: 500, color: '#000' }}>{deviceName}</div> */}
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {serialNumber !== 'N/A' && `Serial: ${serialNumber}`}
                            {serialNumber !== 'N/A' && localId && ' • '}
                            {localId && `Local ID: ${localId}`}
                            {serialNumber === 'N/A' && !localId && 'No device details'}
                          </div>
                        </div>
                      </Option>
                    );
                  })
                ) : (
                  <Option disabled value="no-devices">No devices available</Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading || subscriptionLoading}
                  size="large"
                >
                  Create Subscription
                </Button>
                <Button
                  onClick={() => form.resetFields()}
                  size="large"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => navigate(-1)}
                  size="large"
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default CreateSubscription;
