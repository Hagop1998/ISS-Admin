import React from 'react';
import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined, DashboardOutlined } from '@ant-design/icons';

const { Title } = Typography;

const DeviceStatus = () => {
  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            title: 'Device Manager',
          },
          {
            title: 'Device Status',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0 }}>
          Device Status
        </Title>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Device Status page content will be displayed here.</p>
      </div>
    </div>
  );
};

export default DeviceStatus;

