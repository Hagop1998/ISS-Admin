import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Breadcrumb,
  message,
  Descriptions,
  Tag,
  Divider,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Spin,
} from 'antd';
import { HomeOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';

const { Title, Text } = Typography;
const { Option } = Select;

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.user);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
  }, [token, navigate]);

  const fetchUser = async () => {
    if (!id || !token) return;
    try {
      setLoading(true);
      const data = await userService.getUserById(id);
      setUserDetails(data);
    } catch (error) {
      message.error(error?.message || 'Failed to load user');
      navigate('/users', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id, token]);

  const handleEditOpen = () => {
    if (!userDetails) return;
    form.setFieldsValue({
      firstName: userDetails.firstName ?? '',
      lastName: userDetails.lastName ?? '',
      email: userDetails.email ?? '',
      phone: userDetails.phone ?? '',
      role: userDetails.role ?? 'user',
      isVerified: userDetails.isVerified === true,
      isActive: userDetails.isActive !== false,
      status: userDetails.status != null ? userDetails.status : 1,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      setSaving(true);
      const payload = {
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        email: values.email?.trim(),
        phone: values.phone?.trim() || undefined,
        role: values.role,
        isVerified: values.isVerified,
        isActive: values.isActive,
        status: values.isActive ? 1 : 0,
      };
      await userService.updateUser(id, payload);
      message.success('User updated successfully');
      setEditModalOpen(false);
      fetchUser();
    } catch (error) {
      message.error(error?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 pt-16 lg:pt-6 flex justify-center items-center min-h-[200px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!userDetails) {
    return null;
  }

  const displayName = [userDetails.firstName, userDetails.lastName].filter(Boolean).join(' ') || userDetails.email || `User ${id}`;

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden">
      <Breadcrumb
        items={[
          { href: '/', title: <HomeOutlined /> },
          { href: '/users', title: 'User Management' },
          { title: 'Users List', href: '/users' },
          { title: displayName },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0 }}>
          User: {displayName}
        </Title>
        {(currentUser?.role === 'admin' || currentUser?.role === 'superAdmin') && (
          <Button type="primary" icon={<EditOutlined />} onClick={handleEditOpen}>
            Edit user
          </Button>
        )}
      </div>

      {/* User information */}
      <Card title="User information" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="ID">{userDetails.id ?? userDetails._id ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="First name">{userDetails.firstName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Last name">{userDetails.lastName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Email">{userDetails.email ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{userDetails.phone ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag>{userDetails.role ?? '-'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Verified">
            <Tag color={userDetails.isVerified ? 'success' : 'default'}>{userDetails.isVerified ? 'Yes' : 'No'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={userDetails.isActive !== false ? 'success' : 'default'}>
              {userDetails.isActive !== false ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleString() : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Subscription */}
      {(userDetails.userSubscription || userDetails.subscription) && (
        <Card title="Subscription" style={{ marginBottom: 16 }}>
          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
            {userDetails.userSubscription && (
              <>
                <Descriptions.Item label="Subscription ID">{userDetails.userSubscription.id ?? userDetails.userSubscription._id ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="Device ID">{userDetails.userSubscription.deviceId ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={userDetails.userSubscription.status === 'active' ? 'success' : 'default'}>
                    {userDetails.userSubscription.status ?? '-'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {userDetails.userSubscription.createdAt ? new Date(userDetails.userSubscription.createdAt).toLocaleString() : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Expires">
                  {userDetails.userSubscription.expireDate ? new Date(userDetails.userSubscription.expireDate).toLocaleString() : '-'}
                </Descriptions.Item>
              </>
            )}
            {(userDetails.userSubscription?.subscription || userDetails.subscription) && (
              <>
                <Descriptions.Item label="Plan name">
                  {(userDetails.userSubscription?.subscription || userDetails.subscription).name ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Plan price">
                  {(userDetails.userSubscription?.subscription || userDetails.subscription).price != null
                    ? `${Number((userDetails.userSubscription?.subscription || userDetails.subscription).price).toLocaleString()} AMD`
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Plan description" span={2}>
                  {(userDetails.userSubscription?.subscription || userDetails.subscription).description ?? '-'}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>
      )}

      {/* Device */}
      {(userDetails.device || (userDetails.devices && userDetails.devices.length > 0)) && (
        <Card title="Device(s)" style={{ marginBottom: 16 }}>
          {userDetails.device && (
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="Device ID">{userDetails.device.id ?? userDetails.device._id ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Local ID">{userDetails.device.localId ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Type">{userDetails.device.deviceType ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={userDetails.device.isOnline ? 'success' : 'default'}>
                  {userDetails.device.isOnline ? 'Online' : 'Offline'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          )}
          {userDetails.devices && userDetails.devices.length > 0 && (
            <Table
              rowKey={(r) => r.id ?? r._id}
              dataSource={userDetails.devices}
              columns={[
                { title: 'ID', dataIndex: 'id', key: 'id', render: (v, r) => r.id ?? r._id },
                { title: 'Local ID', dataIndex: 'localId', key: 'localId' },
                { title: 'Type', dataIndex: 'deviceType', key: 'deviceType' },
              ]}
              pagination={false}
              size="small"
            />
          )}
        </Card>
      )}

      {/* Address */}
      {userDetails.address && (
        <Card title="Address" style={{ marginBottom: 16 }}>
          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="Address ID">{userDetails.address.id ?? userDetails.address._id ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Address">{userDetails.address.address ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="City">{userDetails.address.city ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Manager ID">{userDetails.address.managerId ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Latitude">{userDetails.address.lat ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Longitude">{userDetails.address.long ?? '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {!userDetails.userSubscription && !userDetails.subscription && !userDetails.device && !userDetails.devices?.length && !userDetails.address && (
        <Card>
          <Text type="secondary">No subscription, device, or address linked to this user.</Text>
        </Card>
      )}

      <div style={{ marginTop: 24 }}>
        <Button onClick={() => navigate('/users')}>Back to Users List</Button>
      </div>

      <Modal
        title="Edit user"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="firstName" label="First name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="First name" />
          </Form.Item>
          <Form.Item name="lastName" label="Last name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="Last name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Required' }, { type: 'email' }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="Phone" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Role">
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
              <Option value="superAdmin">Super Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isVerified" label="Verified" valuePropName="checked">
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                Save
              </Button>
              <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDetail;
