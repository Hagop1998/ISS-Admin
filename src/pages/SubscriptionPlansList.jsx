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
  Modal,
  Descriptions,
  Spin,
} from 'antd';
import { HomeOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { subscriptionService } from '../services/subscriptionService';
import { userService } from '../services/userService';

const { Title, Text } = Typography;

const SubscriptionPlansList = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userNamesMap, setUserNamesMap] = useState({});
  const [userNamesLoading, setUserNamesLoading] = useState(false);
  const lastFetchedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (user?.role !== 'superAdmin') {
      message.error('Access denied. Only super admins can view subscription plans.');
      navigate('/access-control/list', { replace: true });
    }
  }, [token, user, navigate]);

  const fetchPlans = async () => {
    if (!token || user?.role !== 'superAdmin') return;
    try {
      setLoading(true);
      const response = await subscriptionService.getSubscriptionPlans({ page: 1, limit: 50 });
      const list = response?.results ?? response?.data ?? (Array.isArray(response) ? response : []);
      setPlans(list);
    } catch (error) {
      message.error(error?.message || 'Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || user?.role !== 'superAdmin') return;
    if (lastFetchedRef.current) return;
    lastFetchedRef.current = true;
    fetchPlans();
  }, [token, user]);

  const handleRowClick = async (record) => {
    const id = record.id ?? record._id;
    if (!id) return;
    try {
      setDetailLoading(true);
      setDetailModalOpen(true);
      const plan = await subscriptionService.getSubscriptionPlanById(id);
      setSelectedPlan(plan);
    } catch (error) {
      message.error(error?.message || 'Failed to load plan details');
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // When plan has userSubscriptions, fetch first/last name for each unique userId
  useEffect(() => {
    const list = selectedPlan?.userSubscriptions;
    if (!list || list.length === 0) {
      setUserNamesMap({});
      return;
    }
    const uniqueIds = [...new Set(list.map((us) => us.userId).filter(Boolean))];
    if (uniqueIds.length === 0) {
      setUserNamesMap({});
      return;
    }
    let cancelled = false;
    setUserNamesLoading(true);
    Promise.all(uniqueIds.map((uid) => userService.getUserById(uid)))
      .then((users) => {
        if (cancelled) return;
        const map = {};
        uniqueIds.forEach((uid, i) => {
          const u = users[i];
          if (u) {
            map[uid] = {
              firstName: u.firstName ?? '',
              lastName: u.lastName ?? '',
            };
          }
        });
        setUserNamesMap(map);
      })
      .catch(() => {
        if (!cancelled) setUserNamesMap({});
      })
      .finally(() => {
        if (!cancelled) setUserNamesLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedPlan?.id, selectedPlan?.userSubscriptions?.length]);

  const columns = [
    {
      title: 'No.',
      key: 'index',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (text && text.length > 60 ? `${text.slice(0, 60)}...` : text),
    },
    {
      title: 'Price (AMD)',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => (price != null ? `${Number(price).toLocaleString()} AMD` : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(record);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  if (user?.role !== 'superAdmin') {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden">
      <Breadcrumb
        items={[
          { href: '/', title: <HomeOutlined /> },
          { title: 'Subscription Management' },
          { title: 'Subscription Plans' },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0 }}>
          Subscription Plans
        </Title>
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => navigate('/subscriptions/create-plan')}>
            Create Plan
          </Button>
          <Button type="primary" onClick={() => navigate('/subscriptions/create')}>
            Assign to User
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={plans}
          rowKey={(r) => r.id ?? r._id ?? Math.random()}
          loading={loading}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} plans`,
          }}
        />
      </Card>

      <Modal
        title={selectedPlan ? `Plan: ${selectedPlan.name}` : 'Plan details'}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedPlan(null);
          setUserNamesMap({});
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="assign"
            type="primary"
            onClick={() => {
              setDetailModalOpen(false);
              navigate('/subscriptions/create');
            }}
          >
            Assign to User
          </Button>,
        ]}
        width={560}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin size="large" />
          </div>
        ) : selectedPlan ? (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Name">{selectedPlan.name}</Descriptions.Item>
              <Descriptions.Item label="Price">
                {selectedPlan.price != null ? `${Number(selectedPlan.price).toLocaleString()} AMD` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Description">{selectedPlan.description || '-'}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>
              Users on this plan
            </Title>
            {selectedPlan.userSubscriptions && selectedPlan.userSubscriptions.length > 0 ? (
              <Table
                size="small"
                dataSource={selectedPlan.userSubscriptions.map((us) => ({
                  ...us,
                  key: us.id ?? us._id ?? us.userId + '-' + us.deviceId,
                }))}
                loading={userNamesLoading}
                columns={[
                  { title: 'User subscription ID', dataIndex: 'id', key: 'id', width: 140, render: (v, r) => r.id ?? r._id ?? '-' },
                  {
                    title: 'User',
                    key: 'user',
                    width: 180,
                    render: (_, record) => {
                      const uid = record.userId;
                      const names = userNamesMap[uid];
                      if (userNamesLoading && !names) return <Text type="secondary">Loading...</Text>;
                      if (names) {
                        const full = `${(names.firstName || '').trim()} ${(names.lastName || '').trim()}`.trim();
                        return full || <Text type="secondary">User {uid}</Text>;
                      }
                      return <Text type="secondary">User {uid}</Text>;
                    },
                  },
                  { title: 'Device ID', dataIndex: 'deviceId', key: 'deviceId', width: 100 },
                  { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => (s ? <Text type="secondary">{s}</Text> : '-') },
                ]}
                pagination={false}
                scroll={{ x: 400 }}
              />
            ) : (
              <Text type="secondary">No users assigned to this plan.</Text>
            )}
          </>
        ) : null}
      </Modal>
    </div>
  );
};

export default SubscriptionPlansList;
