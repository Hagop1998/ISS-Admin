import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';
import { SafetyOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home = () => {
  const { t } = useTranslation();
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
            {t('pages.home.welcomeTitle')}
          </Title>
          <Paragraph className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            {t('pages.home.welcomeSubtitle')}
          </Paragraph>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
              <SafetyOutlined className="text-4xl text-primary-600 mb-4" />
              <Title level={4} className="text-primary-700 mb-2">
                {t('pages.home.accessControl')}
              </Title>
              <Paragraph className="text-gray-600 text-sm">
                {t('pages.home.accessControlDesc')}
              </Paragraph>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <TeamOutlined className="text-4xl text-blue-600 mb-4" />
              <Title level={4} className="text-blue-700 mb-2">
                {t('pages.home.communityManagement')}
              </Title>
              <Paragraph className="text-gray-600 text-sm">
                {t('pages.home.communityManagementDesc')}
              </Paragraph>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <SettingOutlined className="text-4xl text-purple-600 mb-4" />
              <Title level={4} className="text-purple-700 mb-2">
                {t('pages.home.deviceConfiguration')}
              </Title>
              <Paragraph className="text-gray-600 text-sm">
                {t('pages.home.deviceConfigurationDesc')}
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

