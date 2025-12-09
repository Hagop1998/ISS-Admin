import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Typography, Breadcrumb, Spin, Card, Statistic, Row, Col } from 'antd';
import { HomeOutlined, UserOutlined, EnvironmentOutlined, SafetyOutlined, TeamOutlined } from '@ant-design/icons';
import { fetchAddresses } from '../store/slices/addressSlice';
import UserSubscriptionsModal from '../components/Addresses/UserSubscriptionsModal';

const { Title, Text } = Typography;

const CommunityOverview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.addresses);
  const token = useSelector((state) => state.auth.token);
  const [hoveredBubble, setHoveredBubble] = useState(null);
  const [isUserSubscriptionsModalOpen, setIsUserSubscriptionsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Calculate statistics
  const totalAddresses = items.length;
  const totalManagers = new Set(items.map(item => item.managerId).filter(Boolean)).size;
  const totalDevices = items.filter(item => item.device).length;
  
  // Calculate total users from userSubscriptions
  const totalUsers = items.reduce((sum, item) => {
    if (item?.device?.userSubscriptions && Array.isArray(item.device.userSubscriptions)) {
      return sum + item.device.userSubscriptions.length;
    }
    return sum;
  }, 0);

  const bubbleData = [
    {
      id: 1,
      title: 'Total Addresses',
      value: totalAddresses,
      icon: <EnvironmentOutlined />,
      color: 'from-blue-500 to-cyan-500',
      hoverColor: 'from-blue-600 to-cyan-600',
      route: '/addresses',
      description: 'Manage all community addresses',
    },
    {
      id: 2,
      title: 'Active Managers',
      value: totalManagers,
      icon: <UserOutlined />,
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'from-purple-600 to-pink-600',
      route: null,
      description: 'Community managers',
    },
    {
      id: 3,
      title: 'Devices',
      value: totalDevices,
      icon: <SafetyOutlined />,
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'from-green-600 to-emerald-600',
      route: null,
      description: 'Connected devices',
    },
    {
      id: 4,
      title: 'Total Users',
      value: totalUsers || 0,
      icon: <TeamOutlined />,
      color: 'from-orange-500 to-red-500',
      hoverColor: 'from-orange-600 to-red-600',
      route: null,
      action: 'showUsers',
      description: 'Registered users',
    },
  ];

  const handleBubbleClick = (bubble) => {
    if (bubble.route) {
      navigate(bubble.route);
    } else if (bubble.action === 'showUsers') {
      setIsUserSubscriptionsModalOpen(true);
    }
  };

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            title: 'Community Mgt',
          },
          {
            title: 'Overview',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="mb-8">
        <Title level={2} style={{ margin: 0, fontWeight: 600, color: '#3C0056' }}>
          Community Overview
        </Title>
        <Text type="secondary" className="text-base">
          Interactive dashboard for community management
        </Text>
      </div>

      {/* Interactive Bubbles */}
      <Spin spinning={loading}>
        <div className="relative">
          {/* Background decorative circles */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

          {/* Bubbles Grid */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {bubbleData.map((bubble) => (
              <div
                key={bubble.id}
                className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10 ${
                  hoveredBubble === bubble.id ? 'scale-105 z-10' : ''
                }`}
                onMouseEnter={() => setHoveredBubble(bubble.id)}
                onMouseLeave={() => setHoveredBubble(null)}
                onClick={() => handleBubbleClick(bubble)}
              >
                <div
                  className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${bubble.color} shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    hoveredBubble === bubble.id ? `bg-gradient-to-br ${bubble.hoverColor}` : ''
                  }`}
                  style={{
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl opacity-80 transform group-hover:scale-110 transition-transform duration-300">
                        {bubble.icon}
                      </div>
                      <div className="text-5xl font-bold transform group-hover:scale-110 transition-transform duration-300">
                        {bubble.value}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{bubble.title}</h3>
                    <p className="text-sm opacity-90">{bubble.description}</p>
                  </div>

                  {/* Hover effect overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${bubble.hoverColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}
                  ></div>

                  {/* Click indicator */}
                  {(bubble.route || bubble.action) && (
                    <div className="absolute bottom-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Statistics Cards */}
          <Row gutter={[16, 16]} className="mt-8">
            <Col xs={24} sm={12} lg={8}>
              <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <Statistic
                  title="Active Communities"
                  value={totalAddresses}
                  prefix={<EnvironmentOutlined />}
                  valueStyle={{ color: '#3C0056' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <Statistic
                  title="Connected Devices"
                  value={totalDevices}
                  prefix={<SafetyOutlined />}
                  valueStyle={{ color: '#3C0056' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <Statistic
                  title="Management Team"
                  value={totalManagers}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#3C0056' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Spin>

      {/* User Subscriptions Modal */}
      <UserSubscriptionsModal
        open={isUserSubscriptionsModalOpen}
        onCancel={() => setIsUserSubscriptionsModalOpen(false)}
        addresses={items}
      />

      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default CommunityOverview;

