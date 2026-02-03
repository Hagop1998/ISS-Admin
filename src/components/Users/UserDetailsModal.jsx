import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Descriptions, Tag, Table, Spin, message, Divider, Space, Button, Popconfirm, Select, Form, Input, Switch } from 'antd';
import { DeleteOutlined, UserSwitchOutlined, DisconnectOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, fetchUsers } from '../../store/slices/userSlice';
import { updateAddress } from '../../store/slices/addressSlice';
import { userService } from '../../services/userService';

const { Option } = Select;

const UserDetailsModal = ({ open, onCancel, userId, onUserDeleted, onUserUpdated }) => {
  const { t } = useTranslation();
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
      message.error(error?.message || t('pages.userDetailsModal.msgFailedFetchDetails'));
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
      message.success(t('pages.userDetailsModal.msgUserUpdated'));
      setEditModalOpen(false);
      fetchUserDetails();
      onUserUpdated?.();
    } catch (error) {
      message.error(error?.message || t('pages.userDetailsModal.msgFailedUpdateUser'));
    } finally {
      setSaving(false);
    }
  };

  const handleAssignManagerSubmit = async () => {
    if (!selectedManagerId || !userDetails?.address) return;
    try {
      const addressId = userDetails.address.id || userDetails.address._id;
      await dispatch(updateAddress({ id: addressId, addressData: { managerId: Number(selectedManagerId) } })).unwrap();
      message.success(t('pages.userDetailsModal.msgManagerAssigned'));
      setAssignManagerModalOpen(false);
      form.resetFields();
      setSelectedManagerId(null);
      fetchUserDetails();
    } catch (error) {
      message.error(error?.message || t('pages.userDetailsModal.msgFailedAssignManager'));
    }
  };

  useEffect(() => {
    if (assignManagerModalOpen && !adminsFetched && adminUsers.length === 0) {
      dispatch(fetchUsers({ page: 1, limit: 100, role: 'admin' }))
        .then(() => setAdminsFetched(true))
        .catch(() => {
          setAdminsFetched(true);
          message.error(t('pages.userDetailsModal.msgFailedLoadAdmins'));
        });
    }
  }, [assignManagerModalOpen, adminsFetched, adminUsers.length, dispatch]);

  const handleDelete = async () => {
    if (!userId) return;
    setDeleting(true);
    try {
      await dispatch(deleteUser(userId)).unwrap();
      message.success(t('pages.userDetailsModal.msgUserDeleted'));
      onCancel?.();
      onUserDeleted?.();
    } catch (error) {
      message.error(error?.message || t('pages.userDetailsModal.msgFailedDeleteUser'));
    } finally {
      setDeleting(false);
    }
  };

  const familyMembersColumns = [
    { title: t('pages.userDetailsModal.userId'), dataIndex: ['user', 'id'], key: 'id' },
    {
      title: t('pages.userDetailsModal.colName'),
      key: 'name',
      render: (_, record) => {
        const u = record.user;
        return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || '-' : '-';
      },
    },
    { title: t('pages.userDetailsModal.email'), dataIndex: ['user', 'email'], key: 'email' },
    { title: t('pages.userDetailsModal.role'), dataIndex: 'role', key: 'role', render: (r) => (r ? <Tag>{r}</Tag> : '-') },
    { title: t('pages.userDetailsModal.invitedAt'), dataIndex: 'invitedAt', key: 'invitedAt', render: (d) => (d ? new Date(d).toLocaleString() : '-') },
    { title: t('pages.userDetailsModal.acceptedAt'), dataIndex: 'acceptedAt', key: 'acceptedAt', render: (d) => (d ? new Date(d).toLocaleString() : '-') },
  ];

  return (
    <Modal
      title={t('pages.userDetailsModal.title')}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>{t('pages.userDetailsModal.close')}</Button>,
        <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchUserDetails} loading={loading} disabled={!userId}>{t('pages.userDetailsModal.refresh')}</Button>,
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={handleEditOpen} disabled={!userDetails}>{t('pages.userDetailsModal.editUser')}</Button>,
        <Popconfirm
          key="delete"
          title={t('pages.userDetailsModal.deleteConfirmTitle')}
          description={t('pages.userDetailsModal.deleteConfirmDesc')}
          onConfirm={handleDelete}
          okText={t('pages.userDetailsModal.yes')}
          cancelText={t('pages.userDetailsModal.no')}
          okType="danger"
        >
          <Button type="primary" danger icon={<DeleteOutlined />} loading={deleting}>{t('pages.userDetailsModal.deleteUser')}</Button>
        </Popconfirm>,
      ]}
      width={900}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>
      ) : userDetails ? (
        <div>
          <Descriptions title={t('pages.userDetailsModal.userInfo')} bordered column={2} size="small">
            <Descriptions.Item label={t('pages.userDetailsModal.userId')}>{userDetails.id || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('pages.userDetailsModal.firstName')}>{userDetails.firstName || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('pages.userDetailsModal.lastName')}>{userDetails.lastName || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('pages.userDetailsModal.email')}>{userDetails.email || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('pages.userDetailsModal.phone')}>{userDetails.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('pages.userDetailsModal.role')}><Tag>{userDetails.role || '-'}</Tag></Descriptions.Item>
            <Descriptions.Item label={t('pages.userDetailsModal.status')}>
              <Tag color={userDetails.status === 1 || userDetails.status === true ? 'success' : 'default'}>
                {userDetails.status === 1 || userDetails.status === true ? t('pages.users.active') : t('pages.users.inactive')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('pages.userDetailsModal.verified')}>
              <Tag color={userDetails.isVerified ? 'success' : 'default'}>{userDetails.isVerified ? t('pages.userDetailsModal.yes') : t('pages.userDetailsModal.no')}</Tag>
            </Descriptions.Item>
            {userDetails.bio && <Descriptions.Item label={t('pages.userDetailsModal.bio')} span={2}>{userDetails.bio}</Descriptions.Item>}
          </Descriptions>

          <Divider />
          <Descriptions title={t('pages.userDetailsModal.addressInfo')} bordered column={2} size="small">
            {userDetails.address ? (
              <>
                <Descriptions.Item label={t('pages.userDetailsModal.addressId')}>{userDetails.address.id || userDetails.address._id || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.address')}>{userDetails.address.address || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.city')}>{userDetails.address.city || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.managerId')}>
                  <Space>
                    <span>{userDetails.address.managerId ?? t('pages.userDetailsModal.notAssigned')}</span>
                    {userDetails.address.managerId ? (
                      <Popconfirm title={t('pages.userDetailsModal.unassignManagerConfirm')} onConfirm={async () => {
                        try {
                          const addressId = userDetails.address.id || userDetails.address._id;
                          await dispatch(updateAddress({ id: addressId, addressData: { managerId: null } })).unwrap();
                          message.success(t('pages.userDetailsModal.msgManagerUnassigned'));
                          fetchUserDetails();
                        } catch (e) { message.error(e?.message || t('common.loading')); }
                      }} okText={t('pages.userDetailsModal.yes')} cancelText={t('pages.userDetailsModal.no')}>
                        <Button type="default" size="small" icon={<DisconnectOutlined />} style={{ borderColor: '#1890ff', color: '#1890ff' }}>{t('pages.userDetailsModal.unassignManager')}</Button>
                      </Popconfirm>
                    ) : (
                      <Button type="default" size="small" icon={<UserSwitchOutlined />} onClick={() => setAssignManagerModalOpen(true)} style={{ borderColor: '#1890ff', color: '#1890ff' }}>{t('pages.userDetailsModal.assignManager')}</Button>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.latitude')}>{userDetails.address.lat ?? '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.longitude')}>{userDetails.address.long ?? '-'}</Descriptions.Item>
              </>
            ) : (
              <Descriptions.Item label={t('pages.userDetailsModal.address')} span={2}><span style={{ color: '#999' }}>{t('pages.userDetailsModal.noAddressLinked')}</span></Descriptions.Item>
            )}
          </Descriptions>

          <Divider />
          <Descriptions title={t('pages.userDetailsModal.deviceInfo')} bordered column={2} size="small">
            {userDetails.device ? (
              <>
                <Descriptions.Item label={t('pages.userDetailsModal.deviceId')}>{userDetails.device.id || userDetails.device._id || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.localId')}>{userDetails.device.localId || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.deviceType')}><Tag>{userDetails.device.deviceType || '-'}</Tag></Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.sector')}>{userDetails.device.sector || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.status')}>
                  <Space>
                    <Tag color={userDetails.device.isOnline ? 'success' : 'error'}>{userDetails.device.isOnline ? t('common.online') : t('common.offline')}</Tag>
                    <Tag color={userDetails.device.isEnabled ? 'success' : 'default'}>{userDetails.device.isEnabled ? t('pages.accessControl.enable') : t('pages.accessControl.disable')}</Tag>
                  </Space>
                </Descriptions.Item>
                {userDetails.device.address && (
                  <>
                    <Descriptions.Item label={t('pages.userDetailsModal.deviceAddress')}>{userDetails.device.address.address || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('pages.userDetailsModal.deviceCity')}>{userDetails.device.address.city || '-'}</Descriptions.Item>
                  </>
                )}
              </>
            ) : (
              <Descriptions.Item label={t('common.device')} span={2}><span style={{ color: '#999' }}>{t('pages.userDetailsModal.noDeviceLinked')}</span></Descriptions.Item>
            )}
          </Descriptions>

          {userDetails.chip && (
            <>
              <Divider />
              <Descriptions title={t('pages.userDetailsModal.chipInfo')} bordered column={2} size="small">
                <Descriptions.Item label={t('pages.userDetailsModal.chipId')}>{userDetails.chip.id || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.serialNumber')}>{userDetails.chip.serialNumber || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.cardSN')}>{userDetails.chip.cardSN || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.userId')}>{userDetails.chip.userId || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.deviceId')}>{userDetails.chip.deviceId || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.chipType')}><Tag>{userDetails.chip.chipType || '-'}</Tag></Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.status')}><Tag color={userDetails.chip.chipStatus === 'Active' ? 'success' : 'default'}>{userDetails.chip.chipStatus || '-'}</Tag></Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.assignedAt')}>{userDetails.chip.assignedAt ? new Date(userDetails.chip.assignedAt).toLocaleString() : '-'}</Descriptions.Item>
              </Descriptions>
            </>
          )}

          <Divider />
          <Descriptions title={t('pages.userDetailsModal.subscriptionInfo')} bordered column={2} size="small">
            {userDetails.userSubscription ? (
              <>
                <Descriptions.Item label={t('pages.userDetailsModal.subscriptionId')}>{userDetails.userSubscription.id || userDetails.userSubscription._id || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.userId')}>{userDetails.userSubscription.userId || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.deviceId')}>{userDetails.userSubscription.deviceId || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.status')}><Tag color={userDetails.userSubscription.status === 'active' ? 'success' : 'default'}>{userDetails.userSubscription.status || '-'}</Tag></Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.createdAt')}>{userDetails.userSubscription.createdAt ? new Date(userDetails.userSubscription.createdAt).toLocaleString() : '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.expireDate')}>{userDetails.userSubscription.expireDate ? new Date(userDetails.userSubscription.expireDate).toLocaleString() : '-'}</Descriptions.Item>
              </>
            ) : (
              <Descriptions.Item label={t('common.subscription')} span={2}><span style={{ color: '#999' }}>{t('pages.userDetailsModal.noSubscriptionLinked')}</span></Descriptions.Item>
            )}
          </Descriptions>

          {userDetails.userSubscription?.subscription && (
            <>
              <Divider />
              <Descriptions title={t('pages.userDetailsModal.subscriptionPlan')} bordered column={2} size="small">
                <Descriptions.Item label={t('pages.userDetailsModal.planId')}>{userDetails.userSubscription.subscription.id || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.planName')}>{userDetails.userSubscription.subscription.name || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.description')} span={2}>{userDetails.userSubscription.subscription.description || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('pages.userDetailsModal.price')}>{userDetails.userSubscription.subscription.price != null ? `$${userDetails.userSubscription.subscription.price}` : '-'}</Descriptions.Item>
              </Descriptions>
            </>
          )}

          {userDetails.userSubscription?.familyMembers?.length > 0 && (
            <>
              <Divider />
              <h3 style={{ marginBottom: 16 }}>{t('pages.userDetailsModal.familyMembers')} ({userDetails.userSubscription.familyMembers.length})</h3>
              <Table columns={familyMembersColumns} dataSource={userDetails.userSubscription.familyMembers.map((m) => ({ ...m, key: m.id }))} pagination={false} size="small" scroll={{ x: 'max-content' }} />
            </>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>{t('pages.userDetailsModal.noUserDetailsAvailable')}</div>
      )}

      <Modal title={t('pages.userDetailsModal.editModalTitle')} open={editModalOpen} onCancel={() => setEditModalOpen(false)} onOk={() => editForm.submit()} okText={t('pages.userDetailsModal.save')} cancelText={t('common.cancel')} confirmLoading={saving} width={520} destroyOnClose>
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="firstName" label={t('pages.userDetailsModal.firstName')} rules={[{ required: true, message: t('pages.userDetailsModal.pleaseEnterFirstName') }]}><Input placeholder={t('pages.userDetailsModal.firstNamePlaceholder')} /></Form.Item>
          <Form.Item name="lastName" label={t('pages.userDetailsModal.lastName')} rules={[{ required: true, message: t('pages.userDetailsModal.pleaseEnterLastName') }]}><Input placeholder={t('pages.userDetailsModal.lastNamePlaceholder')} /></Form.Item>
          <Form.Item name="email" label={t('pages.userDetailsModal.email')} rules={[{ required: true, message: t('pages.userDetailsModal.pleaseEnterEmail') }, { type: 'email', message: t('pages.userDetailsModal.pleaseEnterValidEmail') }]}><Input placeholder={t('pages.userDetailsModal.emailPlaceholder')} type="email" /></Form.Item>
          <Form.Item name="phone" label={t('pages.userDetailsModal.phone')}><Input placeholder={t('pages.userDetailsModal.phonePlaceholder')} /></Form.Item>
          <Form.Item name="role" label={t('pages.userDetailsModal.role')} rules={[{ required: true, message: t('pages.userDetailsModal.pleaseSelectRole') }]}>
            <Select placeholder={t('pages.userDetailsModal.selectRolePlaceholder')}>
              <Option value="user">{t('pages.users.roleUser')}</Option>
              <Option value="admin">{t('pages.users.roleAdmin')}</Option>
              <Option value="superAdmin">{t('pages.users.roleSuperAdmin')}</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isVerified" label={t('pages.userDetailsModal.verified')} valuePropName="checked"><Switch checkedChildren={t('pages.userDetailsModal.yes')} unCheckedChildren={t('pages.userDetailsModal.no')} /></Form.Item>
          <Form.Item name="isActive" label={t('pages.users.active')} valuePropName="checked"><Switch checkedChildren={t('pages.userDetailsModal.yes')} unCheckedChildren={t('pages.userDetailsModal.no')} /></Form.Item>
        </Form>
      </Modal>

      <Modal title={t('pages.userDetailsModal.assignManagerModalTitle')} open={assignManagerModalOpen} onCancel={() => setAssignManagerModalOpen(false)} onOk={handleAssignManagerSubmit} okText={t('pages.userDetailsModal.assign')} cancelText={t('common.cancel')} width={500} okButtonProps={{ disabled: !selectedManagerId }}>
        <Form form={form} layout="vertical">
          <Form.Item label={t('pages.userDetailsModal.selectManager')} rules={[{ required: true, message: t('pages.userDetailsModal.pleaseSelectManager') }]}>
            <Select placeholder={t('pages.userDetailsModal.selectManagerPlaceholder')} showSearch loading={usersLoading} value={selectedManagerId} onChange={(v) => setSelectedManagerId(v)} filterOption={(input, option) => String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())} notFoundContent={usersLoading ? <Spin size="small" /> : t('pages.userDetailsModal.noAdminUsersFound')}>
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
