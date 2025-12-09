import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Typography, Breadcrumb, Card, Descriptions } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const PersonalData = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            title: 'User Settings',
          },
          {
            title: 'Personal Data',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <UserOutlined className="text-primary-500 text-2xl" />
          <Title level={2} style={{ margin: 0 }}>
            Personal Data
          </Title>
        </div>
      </div>

      {/* Content */}
      <Card>
        {user ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="First Name">
              {user.firstName || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Name">
              {user.lastName || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {user.email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {user.phone || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              {user.role || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {user.status === 1 ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-red-600">Inactive</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Verified">
              {user.isVerified ? (
                <span className="text-green-600">Yes</span>
              ) : (
                <span className="text-red-600">No</span>
              )}
            </Descriptions.Item>
            {user.bio && (
              <Descriptions.Item label="Bio">
                {user.bio}
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <p className="text-gray-600">No user data available.</p>
        )}
      </Card>
    </div>
  );
};

export default PersonalData;

