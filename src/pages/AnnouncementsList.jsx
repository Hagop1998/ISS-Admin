import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Breadcrumb,
  message,
  Table,
  Input,
  Select,
  Modal,
  Form,
  Switch,
} from 'antd';
import { HomeOutlined, PlusOutlined, BellOutlined, SearchOutlined } from '@ant-design/icons';
import { announcementService } from '../services/announcementService';
import { addressService } from '../services/addressService';
import { userService } from '../services/userService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EXPIRE_OPTIONS = [
  { value: '1day', label: '1 Day' },
  { value: '1week', label: '1 Week' },
  { value: '1month', label: '1 Month' },
];

function getExpireDate(option) {
  const now = new Date();
  switch (option) {
    case '1day':
      now.setDate(now.getDate() + 1);
      break;
    case '1week':
      now.setDate(now.getDate() + 7);
      break;
    case '1month':
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      now.setDate(now.getDate() + 1);
  }
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

const AnnouncementsList = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Filters
  const [filterIsActive, setFilterIsActive] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('');
  const [filterEntityId, setFilterEntityId] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const [usersForSelect, setUsersForSelect] = useState([]);
  const [addressesForSelect, setAddressesForSelect] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const lastFetchedRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    if (!token) return;
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
    };
    if (filterIsActive !== '') params.isActive = filterIsActive === 'true';
    if (filterEntityType) params.entityType = filterEntityType;
    if (filterEntityId) params.entityId = filterEntityId;
    if (filterSearch) params.search = filterSearch;

    try {
      setLoading(true);
      const response = await announcementService.getAnnouncements(params);
      const list = response?.results ?? response?.data ?? (Array.isArray(response) ? response : []);
      setAnnouncements(list);

      const total = response?.pages?.totalCount ?? response?.totalCount ?? list.length;
      setPagination((prev) => ({ ...prev, total }));
    } catch (error) {
      message.error(error?.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    const paramsKey = JSON.stringify({
      page: pagination.current,
      limit: pagination.pageSize,
      filterIsActive,
      filterEntityType,
      filterEntityId,
      filterSearch,
    });

    if (lastFetchedRef.current === paramsKey) return;
    lastFetchedRef.current = paramsKey;

    fetchAnnouncements();
  }, [token, pagination.current, pagination.pageSize, filterIsActive, filterEntityType, filterEntityId, filterSearch]);

  // Load users and addresses for add form (when modal opens)
  useEffect(() => {
    if (!isAddModalOpen) return;
    const loadOptions = async () => {
      try {
        const [usersRes, addressesRes] = await Promise.all([
          userService.getUsers({ page: 1, limit: 10 }),
          addressService.getAddresses({ page: 1, limit: 10 }),
        ]);
        const usersList = usersRes?.results ?? usersRes?.data ?? (Array.isArray(usersRes) ? usersRes : []);
        const addressesList = addressesRes?.results ?? addressesRes?.data ?? (Array.isArray(addressesRes) ? addressesRes : []);
        setUsersForSelect(usersList);
        setAddressesForSelect(addressesList);
      } catch (error) {
        console.error('Failed to load users/addresses:', error);
      }
    };
    loadOptions();
  }, [isAddModalOpen]);

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleAddSubmit = async (values) => {
    try {
      setSubmitting(true);
      const entityType = values.entityType || 'general';
      const expireOption = values.expireOption || '1day';
      const expireDate = getExpireDate(expireOption);

      const payload = {
        title: values.title?.trim() || '',
        message: values.message?.trim() || '',
        entityType,
        expireDate,
        isActive: values.isActive !== false,
      };

      // entityIds only when type is user or address (not general). Backend expects string e.g. "2" or "1,2,3"
      if (entityType === 'user' && values.entityIds != null) {
        const ids = Array.isArray(values.entityIds) ? values.entityIds : [values.entityIds];
        if (ids.length > 0) {
          payload.entityIds = ids.map((id) => String(id)).join(',');
        }
      } else if (entityType === 'address' && values.entityIds != null) {
        const ids = Array.isArray(values.entityIds) ? values.entityIds : [values.entityIds];
        if (ids.length > 0) {
          payload.entityIds = ids.map((id) => String(id)).join(',');
        }
      }
      // general: no entityIds

      await announcementService.createAnnouncement(payload);
      message.success('Announcement created successfully');
      form.resetFields();
      setIsAddModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      message.error(error?.message || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'No.',
      key: 'index',
      width: 70,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (text) => (text && text.length > 80 ? `${text.slice(0, 80)}...` : text),
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 100,
      render: (t) => t || 'general',
    },
    {
      title: 'Entity IDs',
      dataIndex: 'entityIds',
      key: 'entityIds',
      width: 120,
      render: (t) => t || '-',
    },
    {
      title: 'Expire Date',
      dataIndex: 'expireDate',
      key: 'expireDate',
      width: 180,
      render: (text) => {
        if (!text) return '-';
        try {
          return new Date(text).toLocaleString();
        } catch {
          return text;
        }
      },
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (v) => (v === true ? 'Yes' : 'No'),
    },
  ];

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden">
      <Breadcrumb
        items={[
          { href: '/', title: <HomeOutlined /> },
          { title: 'Announcements' },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0 }}>
          Announcements
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Announcement
        </Button>
      </div>

      <Card className="mb-4">
        <Space wrap size="middle" align="center">
          <Space>
            <Text strong>Active:</Text>
            <Select
              value={filterIsActive}
              onChange={setFilterIsActive}
              style={{ width: 100 }}
              placeholder="All"
              allowClear
            >
              <Option value="true">True</Option>
              <Option value="false">False</Option>
            </Select>
          </Space>
          <Space>
            <Text strong>Entity Type:</Text>
            <Select
              value={filterEntityType}
              onChange={(v) => {
                setFilterEntityType(v);
                setFilterEntityId('');
              }}
              style={{ width: 120 }}
              placeholder="All"
              allowClear
            >
              <Option value="general">General</Option>
              <Option value="user">User</Option>
              <Option value="address">Address</Option>
            </Select>
          </Space>
          <Space>
            <Text strong>Entity ID:</Text>
            <Input
              value={filterEntityId}
              onChange={(e) => setFilterEntityId(e.target.value)}
              placeholder="e.g. 1 or 1,2,3"
              style={{ width: 140 }}
            />
          </Space>
          <Space>
            <Text strong>Search (title/message):</Text>
            <Input
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search..."
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              allowClear
            />
          </Space>
          <Button onClick={fetchAnnouncements} loading={loading}>
            Apply
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={announcements}
          rowKey={(r) => r.id ?? r._id ?? Math.random()}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title="Add Announcement"
        open={isAddModalOpen}
        onCancel={() => {
          form.resetFields();
          setIsAddModalOpen(false);
        }}
        footer={null}
        width={560}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSubmit}
          initialValues={{ entityType: 'general', expireOption: '1day', isActive: true }}
        >
          <Form.Item
            name="title"
            label="Notification Title"
            rules={[{ required: true, message: 'Please enter title' }, { max: 200 }]}
          >
            <Input placeholder="e.g. System Maintenance" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message (actual content)"
            rules={[{ required: true, message: 'Please enter message' }]}
          >
            <TextArea rows={4} placeholder="e.g. Server maintenance at midnight" />
          </Form.Item>

          <Form.Item
            name="entityType"
            label="Entity Type"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select type">
              <Option value="general">General (for all)</Option>
              <Option value="user">User (send to specific users by ID)</Option>
              <Option value="address">Address (send to specific addresses by ID)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.entityType !== curr.entityType}
          >
            {({ getFieldValue }) => {
              const entityType = getFieldValue('entityType');
              if (entityType === 'user') {
                return (
                  <Form.Item
                    name="entityIds"
                    label="User IDs (comma-separated or select)"
                    rules={[{ required: true, message: 'Select at least one user' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select users"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={usersForSelect.map((u) => ({
                        value: String(u.id ?? u._id),
                        label: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || u.id,
                      }))}
                    />
                  </Form.Item>
                );
              }
              if (entityType === 'address') {
                return (
                  <Form.Item
                    name="entityIds"
                    label="Address IDs (comma-separated or select)"
                    rules={[{ required: true, message: 'Select at least one address' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select addresses"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={addressesForSelect.map((a) => ({
                        value: String(a.id ?? a._id),
                        label: (a.address || a.city || '').slice(0, 50) || `Address ${a.id ?? a._id}`,
                      }))}
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            name="expireOption"
            label="Expire"
            rules={[{ required: true, message: 'Select expire duration' }]}
          >
            <Select placeholder="Select duration">
              {EXPIRE_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Add
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setIsAddModalOpen(false);
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AnnouncementsList;
