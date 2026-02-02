import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Tag, Table, Spin, message, Divider, Space, Button, Popconfirm, Select, Form, Input, Switch } from 'antd';
import { DeleteOutlined, UserSwitchOutlined, DisconnectOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, fetchUsers } from '../../store/slices/userSlice';
import { updateAddress } from '../../store/slices/addressSlice';
import { userService } from '../../services/userService';

const { Option } = Select;

const UserDetailsModal = ({ open, onCancel, userId, onUserDeleted, onUserUpdated }) => {
  const dispatch = useDispatch();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assignManagerModalOpen, setAssignManagerModalOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { users: allUsers, loading: usersLoading } = useSelector((state) => state.users);
  const [adminsFetched, setAdminsFetched] = useState(false);

  const adminUsers = allUsers.filter((u) => u.role === 'admin' || u.role === 'superAdmin');

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    } else {
      setUserDetails(null);
    }
  }, [open, userId]);

  useEffect(() => {
    if (!assignManagerModalOpen) {
      form.resetFields();
      setSelectedManagerId(null);
    }
  }, [assignManagerModalOpen, form]);

  useEffect(() => {
    if (!editModalOpen) editForm.resetFields();
  }, [editModalOpen, editForm]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await userService.getUserById(userId);
      const memberSub = data.member?.userSubscription ?? data.userSubscription ?? data.user_subscription ?? data.subscription;
      const normalized = {
        ...data,
        address: data.address ?? data.addresses?.[0] ?? memberSub?.device?.address ?? null,
        device: data.device ?? data.devices?.[0] ?? memberSub?.device ?? null,
        userSubscription: data.userSubscription ?? data.user_subscription ?? data.subscription ?? memberSub ?? null,
      };
      setUserDetails(normalized);
    } catch (error) {
      message.error(error?.message || 'Failed to fetch user details');
      onCancel?.();
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = () => {
    if (!userDetails) return;
    editForm.setFieldsValue({
      firstName: userDetails.firstName ?? '',
      lastName: userDetails.lastName ?? '',
      email: userDetails.email ?? '',
      phone: userDetails.phone ?? '',
      role: userDetails.role ?? 'user',
      isVerified: userDetails.isVerified === true,
      isActive: userDetails.status === 1 || userDetails.status === true,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (values) => {
    if (!userId) return;
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
      await userService.updateUser(userId, payload);
      message.success('User updated successfully');
      setEditModalOpen(false);
      fetchUserDetails();
      onUserUpdated?.();
    } catch (error) {
      message.error(error?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignManagerSubmit = async () => {
    if (!selectedManagerId || !userDetails?.address) return;
    try {
      const addressId = userDetails.address.id || userDetails.address._id;
      await dispatch(updateAddress({ id: addressId, addressData: { managerId: Number(selectedManagerId) } })).unwrap();
      message.success('Address assigned to manager successfully');
      setAssignManagerModalOpen(false);
      form.resetFields();
      setSelectedManagerId(null);
      fetchUserDetails();
    } catch (error) {
      message.error(error?.message || 'Failed to assign address to manager');
    }
  };

  useEffect(() => {
    if (assignManagerModalOpen && !adminsFetched && adminUsers.length === 0) {
      dispatch(fetchUsers({ page: 1, limit: 100, role: 'admin' }))
        .then(() => setAdminsFetched(true))
        .catch(() => {
          setAdminsFetched(true);
          message.error('Failed to load admin users');
        });
    }
  }, [assignManagerModalOpen, adminsFetched, adminUsers.length, dispatch]);

  const handleDelete = async () => {
    if (!userId) return;
    setDeleting(true);
    try {
      await dispatch(deleteUser(userId)).unwrap();
      message.success('User deleted successfully');
      onCancel?.();
      onUserDeleted?.();
    } catch (error) {
      message.error(error?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const familyMembersColumns = [
    { title: 'ID', dataIndex: ['user', 'id'], key: 'id' },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => {
        const u = record.user;
        return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || '-' : '-';
      },
    },
    { title: 'Email', dataIndex: ['user', 'email'], key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (r) => (r ? <Tag>{r}</Tag> : '-') },
    { title: 'Invited At', dataIndex: 'invitedAt', key: 'invitedAt', render: (d) => (d ? new Date(d).toLocaleString() : '-') },
    { title: 'Accepted At', dataIndex: 'acceptedAt', key: 'acceptedAt', render: (d) => (d ? new Date(d).toLocaleString() : '-') },
  ];

  return (
    <Modal
      title="User Details"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>Close</Button>,
        <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchUserDetails} loading={loading} disabled={!userId}>Refresh</Button>,
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={handleEditOpen} disabled={!userDetails}>Edit user</Button>,
        <Popconfirm
          key="delete"
          title="Delete this user?"
          description="Are you sure you want to delete this user? This action cannot be undone."
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
          okType="danger"
        >
          <Button type="primary" danger icon={<DeleteOutlined />} loading={deleting}>Delete User</Button>
        </Popconfirm>,
      ]}
      width={900}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>
      ) : userDetails ? (
        <div>
          <Descriptions title="User Information" bordered column={2} size="small">
            <Descriptions.Item label="User ID">{userDetails.id || '-'}</Descriptions.Item>
            <Descriptions.Item label="First Name">{userDetails.firstName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{userDetails.lastName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Email">{userDetails.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="Phone">{userDetails.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="Role"><Tag>{userDetails.role || '-'}</Tag></Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={userDetails.status === 1 || userDetails.status === true ? 'success' : 'default'}>
                {userDetails.status === 1 || userDetails.status === true ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Verified">
              <Tag color={userDetails.isVerified ? 'success' : 'default'}>{userDetails.isVerified ? 'Yes' : 'No'}</Tag>
            </Descriptions.Item>
            {userDetails.bio && <Descriptions.Item label="Bio" span={2}>{userDetails.bio}</Descriptions.Item>}
          </Descriptions>

          <Divider />
          <Descriptions title="Address Information" bordered column={2} size="small">
            {userDetails.address ? (
              <>
                <Descriptions.Item label="Address ID">{userDetails.address.id || userDetails.address._id || '-'}</Descriptions.Item>
                <Descriptions.Item label="Address">{userDetails.address.address || '-'}</Descriptions.Item>
                <Descriptions.Item label="City">{userDetails.address.city || '-'}</Descriptions.Item>
                <Descriptions.Item label="Manager ID">
                  <Space>
                    <span>{userDetails.address.managerId ?? 'Not assigned'}</span>
                    {userDetails.address.managerId ? (
                      <Popconfirm title="Unassign manager?" onConfirm={async () => {
                        try {
                          const addressId = userDetails.address.id || userDetails.address._id;
                          await dispatch(updateAddress({ id: addressId, addressData: { managerId: null } })).unwrap();
                          message.success('Manager unassigned');
                          fetchUserDetails();
                        } catch (e) { message.error(e?.message || 'Failed'); }
                      }} okText="Yes" cancelText="No">
                        <Button type="default" size="small" icon={<DisconnectOutlined />} style={{ borderColor: '#1890ff', color: '#1890ff' }}>Unassign Manager</Button>
                      </Popconfirm>
                    ) : (
                      <Button type="default" size="small" icon={<UserSwitchOutlined />} onClick={() => setAssignManagerModalOpen(true)} style={{ borderColor: '#1890ff', color: '#1890ff' }}>Assign Manager</Button>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Latitude">{userDetails.address.lat ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="Longitude">{userDetails.address.long ?? '-'}</Descriptions.Item>
              </>
            ) : (
              <Descriptions.Item label="Address" span={2}><span style={{ color: '#999' }}>No address linked to this user.</span></Descriptions.Item>
            )}
          </Descriptions>

          <Divider />
          <Descriptions title="Device Information" bordered column={2} size="small">
            {userDetails.device ? (
              <>
                <Descriptions.Item label="Device ID">{userDetails.device.id || userDetails.device._id || '-'}</Descriptions.Item>
                <Descriptions.Item label="Local ID">{userDetails.device.localId || '-'}</Descriptions.Item>
                <Descriptions.Item label="Device Type"><Tag>{userDetails.device.deviceType || '-'}</Tag></Descriptions.Item>
                <Descriptions.Item label="Sector">{userDetails.device.sector || '-'}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Space>
                    <Tag color={userDetails.device.isOnline ? 'success' : 'error'}>{userDetails.device.isOnline ? 'Online' : 'Offline'}</Tag>
                    <Tag color={userDetails.device.isEnabled ? 'success' : 'default'}>{userDetails.device.isEnabled ? 'Enabled' : 'Disabled'}</Tag>
                  </Space>
                </Descriptions.Item>
                {userDetails.device.address && (
                  <>
                    <Descriptions.Item label="Device Address">{userDetails.device.address.address || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Device City">{userDetails.device.address.city || '-'}</Descriptions.Item>
                  </>
                )}
              </>
            ) : (
              <Descriptions.Item label="Device" span={2}><span style={{ color: '#999' }}>No device linked to this user.</span></Descriptions.Item>
            )}
          </Descriptions>

          {userDetails.chip && (
            <>
              <Divider />
              <Descriptions title="Chip Information" bordered column={2} size="small">
                <Descriptions.Item label="Chip ID">{userDetails.chip.id || '-'}</Descriptions.Item>
                <Descriptions.Item label="Serial Number">{userDetails.chip.serialNumber || '-'}</Descriptions.Item>
                <Descriptions.Item label="Card SN">{userDetails.chip.cardSN || '-'}</Descriptions.Item>
                <Descriptions.Item label="User ID">{userDetails.chip.userId || '-'}</Descriptions.Item>
                <Descriptions.Item label="Device ID">{userDetails.chip.deviceId || '-'}</Descriptions.Item>
                <Descriptions.Item label="Chip Type"><Tag>{userDetails.chip.chipType || '-'}</Tag></Descriptions.Item>
                <Descriptions.Item label="Status"><Tag color={userDetails.chip.chipStatus === 'Active' ? 'success' : 'default'}>{userDetails.chip.chipStatus || '-'}</Tag></Descriptions.Item>
                <Descriptions.Item label="Assigned At">{userDetails.chip.assignedAt ? new Date(userDetails.chip.assignedAt).toLocaleString() : '-'}</Descriptions.Item>
              </Descriptions>
            </>
          )}

          <Divider />
          <Descriptions title="Subscription Information" bordered column={2} size="small">
            {userDetails.userSubscription ? (
              <>
                <Descriptions.Item label="Subscription ID">{userDetails.userSubscription.id || userDetails.userSubscription._id || '-'}</Descriptions.Item>
                <Descriptions.Item label="User ID">{userDetails.userSubscription.userId || '-'}</Descriptions.Item>
                <Descriptions.Item label="Device ID">{userDetails.userSubscription.deviceId || '-'}</Descriptions.Item>
                <Descriptions.Item label="Status"><Tag color={userDetails.userSubscription.status === 'active' ? 'success' : 'default'}>{userDetails.userSubscription.status || '-'}</Tag></Descriptions.Item>
                <Descriptions.Item label="Created At">{userDetails.userSubscription.createdAt ? new Date(userDetails.userSubscription.createdAt).toLocaleString() : '-'}</Descriptions.Item>
                <Descriptions.Item label="Expire Date">{userDetails.userSubscription.expireDate ? new Date(userDetails.userSubscription.expireDate).toLocaleString() : '-'}</Descriptions.Item>
              </>
            ) : (
              <Descriptions.Item label="Subscription" span={2}><span style={{ color: '#999' }}>No subscription linked to this user.</span></Descriptions.Item>
            )}
          </Descriptions>

          {userDetails.userSubscription?.subscription && (
            <>
              <Divider />
              <Descriptions title="Subscription Plan" bordered column={2} size="small">
                <Descriptions.Item label="Plan ID">{userDetails.userSubscription.subscription.id || '-'}</Descriptions.Item>
                <Descriptions.Item label="Plan Name">{userDetails.userSubscription.subscription.name || '-'}</Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>{userDetails.userSubscription.subscription.description || '-'}</Descriptions.Item>
                <Descriptions.Item label="Price">{userDetails.userSubscription.subscription.price != null ? `$${userDetails.userSubscription.subscription.price}` : '-'}</Descriptions.Item>
              </Descriptions>
            </>
          )}

          {userDetails.userSubscription?.familyMembers?.length > 0 && (
            <>
              <Divider />
              <h3 style={{ marginBottom: 16 }}>Family Members ({userDetails.userSubscription.familyMembers.length})</h3>
              <Table columns={familyMembersColumns} dataSource={userDetails.userSubscription.familyMembers.map((m) => ({ ...m, key: m.id }))} pagination={false} size="small" scroll={{ x: 'max-content' }} />
            </>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>No user details available</div>
      )}

      <Modal title="Edit user" open={editModalOpen} onCancel={() => setEditModalOpen(false)} onOk={() => editForm.submit()} okText="Save" cancelText="Cancel" confirmLoading={saving} width={520} destroyOnClose>
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="firstName" label="First name" rules={[{ required: true, message: 'Please enter first name' }]}><Input placeholder="First name" /></Form.Item>
          <Form.Item name="lastName" label="Last name" rules={[{ required: true, message: 'Please enter last name' }]}><Input placeholder="Last name" /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Please enter a valid email' }]}><Input placeholder="Email" type="email" /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input placeholder="Phone" /></Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select role' }]}>
            <Select placeholder="Select role">
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
              <Option value="superAdmin">Super Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isVerified" label="Verified" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Assign Manager" open={assignManagerModalOpen} onCancel={() => setAssignManagerModalOpen(false)} onOk={handleAssignManagerSubmit} okText="Assign" cancelText="Cancel" width={500} okButtonProps={{ disabled: !selectedManagerId }}>
        <Form form={form} layout="vertical">
          <Form.Item label="Select Manager" rules={[{ required: true, message: 'Please select a manager' }]}>
            <Select placeholder="Select a manager" showSearch loading={usersLoading} value={selectedManagerId} onChange={(v) => setSelectedManagerId(v)} filterOption={(input, option) => String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())} notFoundContent={usersLoading ? <Spin size="small" /> : 'No admin users found'}>
              {adminUsers.map((adminUser) => (
                <Option key={adminUser.id || adminUser._id} value={adminUser.id || adminUser._id}>
                  {adminUser.firstName && adminUser.lastName ? `${adminUser.firstName} ${adminUser.lastName} (${adminUser.email || 'No email'})` : adminUser.email || `Admin ${adminUser.id || adminUser._id}`}
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
