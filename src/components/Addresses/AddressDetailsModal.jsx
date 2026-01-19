import React from 'react';
import { Modal, Descriptions, Tag, Divider, Button, Space } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';

const AddressDetailsModal = ({ open, onCancel, address, onViewUsers }) => {
  if (!address) return null;

  const lat = parseFloat(address.lat);
  const long = parseFloat(address.long);
  const hasValidCoordinates = !isNaN(lat) && !isNaN(long);

  const googleMapsUrl = hasValidCoordinates
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1841338848877!2d${long}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat}%2C${long}!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus`
    : null;

  const openInGoogleMaps = () => {
    if (hasValidCoordinates) {
      window.open(`https://www.google.com/maps?q=${lat},${long}`, '_blank');
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
                  onClick={openInGoogleMaps}
                  size="small"
                >
                  Open in Google Maps
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
                  onClick={openInGoogleMaps}
                  size="small"
                >
                  Open in Google Maps
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
                  src={`https://www.google.com/maps?q=${lat},${long}&z=15&output=embed`}
                  allowFullScreen
                  title="Address Location"
                />
              </div>
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <Button
                  type="primary"
                  icon={<EnvironmentOutlined />}
                  onClick={openInGoogleMaps}
                >
                  Open in Google Maps
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
