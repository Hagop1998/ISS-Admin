import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const DeviceSettings = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden">
      <Breadcrumb
        items={[
          { href: '/', title: <HomeOutlined /> },
          { title: t('pages.deviceSettings.breadcrumbMgt') },
          { title: t('pages.deviceSettings.breadcrumbList') },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0 }}>
          {t('pages.deviceSettings.title')}
        </Title>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">{t('pages.deviceSettings.contentPlaceholder')}</p>
      </div>
    </div>
  );
};

export default DeviceSettings;

