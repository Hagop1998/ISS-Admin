import React from 'react';
import { Modal, Descriptions, Tag, Divider, Button, Space } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';

const AddressDetailsModal = ({ open, onCancel, address, onViewUsers }) => {
  if (!address) return null;

  const lat = parseFloat(address.lat);
  const long = parseFloat(address.long);
  const hasValidCoordinates = !isNaN(lat) && !isNaN(long);

  const yandexMapsUrl = hasValidCoordinates
    ? `https://yandex.com/map-widget/v1/?ll=${long},${lat}&z=15`
    : null;

  const openInYandexMaps = () => {
    if (hasValidCoordinates) {
      window.open(`https://yandex.com/maps/?pt=${long},${lat}&z=15`, '_blank');
    }
  };

  return (
    <Modal
      title="Address Details"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      <div>
        {/* Address Information */}
        <Descriptions title="Address Information" bordered column={2} size="small">
          <Descriptions.Item label="Address ID">{address.id || address._id || '-'}</Descriptions.Item>
          <Descriptions.Item label="Address">{address.address || '-'}</Descriptions.Item>
          <Descriptions.Item label="City">{address.city || '-'}</Descriptions.Item>
          <Descriptions.Item label="Manager ID">{address.managerId || '-'}</Descriptions.Item>
          {address.manager && (
            <>
              <Descriptions.Item label="Manager Name">
                {address.manager.firstName && address.manager.lastName
                  ? `${address.manager.firstName} ${address.manager.lastName}`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Manager Email">{address.manager.email || '-'}</Descriptions.Item>
            </>
          )}
        </Descriptions>

        <Divider />

        {/* Coordinates */}
        <Descriptions title="Location Coordinates" bordered column={2} size="small">
          <Descriptions.Item label="Latitude">
            {hasValidCoordinates ? (
              <Space>
                <Tag color="blue">{lat.toFixed(6)}</Tag>
                <Button
                  type="link"
                  icon={<EnvironmentOutlined />}
                  onClick={openInYandexMaps}
                  size="small"
                >
                  Open in Yandex Maps
                </Button>
              </Space>
            ) : (
              <Tag color="default">Not available</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Longitude">
            {hasValidCoordinates ? (
              <Space>
                <Tag color="blue">{long.toFixed(6)}</Tag>
                <Button
                  type="link"
                  icon={<EnvironmentOutlined />}
                  onClick={openInYandexMaps}
                  size="small"
                >
                  Open in Yandex Maps
                </Button>
              </Space>
            ) : (
              <Tag color="default">Not available</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>

        {/* Map */}
        {hasValidCoordinates && (
          <>
            <Divider />
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 12 }}>Location on Map</h3>
              <div
                style={{
                  width: '100%',
                  height: '400px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={yandexMapsUrl}
                  allowFullScreen
                  title="Address Location"
                />
              </div>
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <Button
                  type="primary"
                  icon={<EnvironmentOutlined />}
                  onClick={openInYandexMaps}
                >
                  Open in Yandex Maps
                </Button>
              </div>
            </div>
          </>
        )}

        {!hasValidCoordinates && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <EnvironmentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p>Location coordinates are not available for this address.</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>
              Please update the address with valid latitude and longitude to view it on the map.
            </p>
          </div>
        )}

        <Divider />

        {/* Actions */}
        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => {
              if (onViewUsers) {
                onViewUsers();
              }
            }}
            size="large"
          >
            View Users at This Address
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddressDetailsModal;
