import React from 'react';
import { Typography } from 'antd';
import { SafetyOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 pt-16 lg:pt-6">
      <div className="max-w-4xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white rounded-full p-6 shadow-lg">
            <img
              src="/assets/logo.jpeg"
              alt="ISS Admin Logo"
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-full"
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 mb-8">
          <Title level={1} className="text-primary-600 mb-4">
            Welcome to ISS Admin Portal
          </Title>
          <Paragraph className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Your comprehensive management platform for access control, community management, and device configuration.
            Manage your entire security infrastructure from one centralized dashboard.
          </Paragraph>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
              <SafetyOutlined className="text-4xl text-primary-600 mb-4" />
              <Title level={4} className="text-primary-700 mb-2">
                Access Control
              </Title>
              <Paragraph className="text-gray-600 text-sm">
                Manage user access, devices, and security settings with ease
              </Paragraph>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <TeamOutlined className="text-4xl text-blue-600 mb-4" />
              <Title level={4} className="text-blue-700 mb-2">
                Community Management
              </Title>
              <Paragraph className="text-gray-600 text-sm">
                Oversee addresses, managers, and community resources efficiently
              </Paragraph>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <SettingOutlined className="text-4xl text-purple-600 mb-4" />
              <Title level={4} className="text-purple-700 mb-2">
                Device Configuration
              </Title>
              <Paragraph className="text-gray-600 text-sm">
                Configure and manage your security devices and card settings
              </Paragraph>
            </div>
          </div>
        </div>

        {/* Quick Stats or Additional Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Paragraph className="text-gray-500 text-sm">
            Navigate through the sidebar to access different sections of the admin portal.
            All your management tools are just a click away.
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default Home;

