import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Select, Button, Card, Typography, Breadcrumb, message, Space, Spin } from 'antd';
import { HomeOutlined, SaveOutlined } from '@ant-design/icons';
import { createUserSubscription, updateUserSubscription } from '../store/slices/subscriptionSlice';
import { fetchUsers } from '../store/slices/userSlice';
import { fetchDevices } from '../store/slices/deviceSlice';
import { subscriptionService } from '../services/subscriptionService';
import { userService } from '../services/userService';

const { Title, Text } = Typography;
const { Option } = Select;

// Module-level guards so Strict Mode double-mount doesn't trigger duplicate API calls
const createSubFetchGuard = { users: false, devices: false, plans: false };
const RESET_GUARD_DELAY_MS = 150;

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
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [existingUserSubscriptionId, setExistingUserSubscriptionId] = useState(null);
  const [loadingUserSubscription, setLoadingUserSubscription] = useState(false);

  const selectedUserId = Form.useWatch('userId', form);

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
    if (!token || user?.role !== 'superAdmin') return;

    if (!createSubFetchGuard.users) {
      createSubFetchGuard.users = true;
      dispatch(fetchUsers({ page: 1, limit: 10 }));
    }
    if (!createSubFetchGuard.devices) {
      createSubFetchGuard.devices = true;
      dispatch(fetchDevices({ page: 1, limit: 10 }));
    }

    return () => {
      setTimeout(() => {
        createSubFetchGuard.users = false;
        createSubFetchGuard.devices = false;
      }, RESET_GUARD_DELAY_MS);
    };
  }, [dispatch, token, user]);

  useEffect(() => {
    if (!token || user?.role !== 'superAdmin') return;
    if (createSubFetchGuard.plans) return;
    createSubFetchGuard.plans = true;
    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        const response = await subscriptionService.getSubscriptionPlans({ page: 1, limit: 50 });
        const list = response?.results ?? response?.data ?? (Array.isArray(response) ? response : []);
        setPlans(list);
      } catch (error) {
        message.error(error?.message || 'Failed to load subscription plans');
      } finally {
        setPlansLoading(false);
      }
    };
    loadPlans();

    return () => {
      setTimeout(() => {
        createSubFetchGuard.plans = false;
      }, RESET_GUARD_DELAY_MS);
    };
  }, [token, user]);

  // When user is selected, fetch their details: if they have a subscription we update, else we create
  useEffect(() => {
    if (!selectedUserId) {
      setExistingUserSubscriptionId(null);
      return;
    }
    let cancelled = false;
    const fetchUserSubscription = async () => {
      setLoadingUserSubscription(true);
      try {
        const data = await userService.getUserById(selectedUserId);
        const memberSub = data.member?.userSubscription ?? data.userSubscription ?? data.user_subscription ?? data.subscription;
        const id = memberSub?.id ?? memberSub?._id;
        if (!cancelled) setExistingUserSubscriptionId(id ?? null);
      } catch {
        if (!cancelled) setExistingUserSubscriptionId(null);
      } finally {
        if (!cancelled) setLoadingUserSubscription(false);
      }
    };
    fetchUserSubscription();
    return () => { cancelled = true; };
  }, [selectedUserId]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const userId = Number(values.userId);
      const subscriptionId = Number(values.subscriptionId);
      const deviceId = Number(values.deviceId);

      if (existingUserSubscriptionId) {
        await dispatch(updateUserSubscription({
          id: existingUserSubscriptionId,
          subscriptionData: { subscriptionId, deviceId },
        })).unwrap();
        message.success('Subscription updated successfully');
      } else {
        await dispatch(createUserSubscription({
          userId,
          subscriptionId,
          deviceId,
        })).unwrap();
        message.success('Subscription created successfully');
      }
      form.resetFields();
      setExistingUserSubscriptionId(null);
    } catch (error) {
      message.error(error || (existingUserSubscriptionId ? 'Failed to update subscription' : 'Failed to create subscription'));
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
          { href: '/', title: <HomeOutlined /> },
          { title: 'Subscription Management' },
          { title: 'Create Subscription' },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="mb-6">
        <Title level={2} style={{ margin: 0 }}>
          Assign subscription to user
        </Title>
        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          Give a plan to a user who doesn&apos;t have one, or change their current subscription to another plan.
        </Text>
      </div>

      <Card>
        <Spin spinning={usersLoading || devicesLoading || plansLoading}>
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
              extra={existingUserSubscriptionId && (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  This user already has a subscription. Saving will update their subscription.
                </Typography.Text>
              )}
              rules={[{ required: true, message: 'Please select a user' }]}
            >
              <Select
                placeholder="Search and select a user"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const u = usersList.find((x) => (x.id || x._id) == option.value);
                  if (!u) return false;
                  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                  const email = u.email || '';
                  return `${name} ${email}`.toLowerCase().includes(input.toLowerCase());
                }}
                loading={usersLoading || loadingUserSubscription}
                notFoundContent={usersLoading || loadingUserSubscription ? <Spin size="small" /> : 'No users found'}
                style={{ width: '100%' }}
              >
                {usersList.length > 0 ? (
                  usersList.map((u) => {
                    const uid = u.id || u._id;
                    const userName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || `User ${uid}`;
                    return (
                      <Option key={uid} value={uid} label={`${userName} (${u.email || 'No email'})`}>
                        <div style={{ fontWeight: 500, color: '#000' }}>{userName}</div>
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
              label="Subscription plan"
              rules={[{ required: true, message: 'Please select a subscription plan' }]}
            >
              <Select
                placeholder="Select plan (assign or change for this user)"
                showSearch
                optionFilterProp="label"
                loading={plansLoading}
                notFoundContent={plansLoading ? <Spin size="small" /> : 'No plans found. Create a plan first.'}
              >
                {plans.map((plan) => {
                  const id = plan.id ?? plan._id;
                  const name = plan.name || `Plan ${id}`;
                  const price = plan.price != null ? `${Number(plan.price).toLocaleString()} AMD` : '';
                  return (
                    <Option key={id} value={id} label={`${name} ${price}`}>
                      <div>
                        {price && <div style={{ fontSize: '12px', color: '#999' }}>{price}</div>}
                      </div>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item
              name="deviceId"
              label="Device"
              rules={[{ required: true, message: 'Please select a device' }]}
            >
              <Select
                placeholder="Search and select a device"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const d = devicesList.find((x) => (x.id || x._id) == option.value);
                  if (!d) return false;
                  const text = `${d.name || ''} ${d.serialNumber || ''} ${d.localId || ''}`.toLowerCase();
                  return text.includes(input.toLowerCase());
                }}
                loading={devicesLoading}
                notFoundContent={devicesLoading ? <Spin size="small" /> : 'No devices found'}
                style={{ width: '100%' }}
              >
                {devicesList.length > 0 ? (
                  devicesList.map((d) => {
                    const deviceId = d.id || d._id;
                    const label = d.localId ? `Local ID: ${d.localId}` : `Device ${deviceId}`;
                    return (
                      <Option key={deviceId} value={deviceId} label={label}>
                        <div style={{ fontSize: '12px', color: '#999' }}>{label}</div>
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
                  {existingUserSubscriptionId ? 'Update subscription' : 'Create subscription'}
                </Button>
                <Button onClick={() => form.resetFields()} size="large">Reset</Button>
                <Button onClick={() => navigate(-1)} size="large">Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default CreateSubscription;
