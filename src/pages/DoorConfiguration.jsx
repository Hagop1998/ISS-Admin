import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Radio, 
  Button, 
  Typography, 
  Breadcrumb, 
  message, 
  Space,
  Row,
  Col,
  InputNumber
} from 'antd';
import { 
  HomeOutlined, 
  ArrowLeftOutlined,
  PoweroffOutlined,
  CloudOutlined,
  QrcodeOutlined,
  EyeOutlined,
  CreditCardOutlined,
  PhoneOutlined,
  CameraOutlined,
  SlidersOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { setDoor, getDeviceById } from '../store/slices/deviceSlice';
import { SetDoorTypeEnum } from '../constants/enums';

const { Title } = Typography;

const DoorConfiguration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { deviceId } = useParams();
  const [form] = Form.useForm();
  const { loading } = useSelector((state) => state.devices);
  const token = useSelector((state) => state.auth.token);
  const [device, setDevice] = useState(null);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (deviceId && token) {
      fetchDeviceDetails();
    }
  }, [deviceId, token]);

  const fetchDeviceDetails = async () => {
    try {
      const result = await dispatch(getDeviceById(deviceId)).unwrap();
      // Handle different response formats
      const deviceData = result?.data || result?.device || result;
      setDevice(deviceData);
      
      // Set form initial values if available
      if (deviceData) {
        form.setFieldsValue({
          installationPosition: deviceData.installationPosition || deviceData.name || '',
          accessControlName: deviceData.accessControlName || deviceData.localId || '',
          localId: deviceData.localId || deviceData.serialNumber || '',
        });
      }
    } catch (error) {
      message.error(error || 'Failed to fetch device details');
    }
  };

  const handleSave = async (type, value) => {
    if (!device) {
      message.error('Device information not loaded');
      return;
    }

    const localId = device.localId || device.serialNumber;
    if (!localId) {
      message.error('Device local ID is missing');
      return;
    }

    try {
      message.loading({ content: 'Saving configuration...', key: 'save' });
      await dispatch(setDoor({
        localId,
        type,
        value,
      })).unwrap();
      
      // Update local state
      setSettings(prev => ({ ...prev, [type]: value }));
      message.success({ content: 'Configuration saved successfully', key: 'save' });
    } catch (error) {
      message.error({ content: error || 'Failed to save configuration', key: 'save' });
    }
  };

  const handleSwitchChange = (type, value) => {
    handleSave(type, value ? 1 : 0);
  };

  const handleThresholdChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    handleSave(type, numValue);
  };

  const handleTimeChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    handleSave(type, numValue);
  };

  const renderSwitchCard = (title, icon, label, type, defaultValue = false) => {
    const currentValue = settings[type] !== undefined ? settings[type] : (defaultValue ? 1 : 0);
    
    return (
      <Col xs={24} sm={12} lg={8} key={type}>
        <Card
          className="h-full shadow-md hover:shadow-lg transition-shadow"
          headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {icon}
              <span style={{ fontWeight: 500 }}>{title}</span>
            </div>
            <Form.Item label={label} style={{ marginBottom: 0 }}>
              <Radio.Group
                value={currentValue}
                onChange={(e) => handleSwitchChange(type, e.target.value === 1)}
                buttonStyle="solid"
                style={{ width: '100%' }}
              >
                <Radio.Button value={1} style={{ flex: 1, textAlign: 'center' }}>
                  Open
                </Radio.Button>
                <Radio.Button value={0} style={{ flex: 1, textAlign: 'center' }}>
                  Close
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Space>
        </Card>
      </Col>
    );
  };

  const renderThresholdCard = (title, icon, label, type, defaultValue = 90, min = 0, max = 100) => {
    const currentValue = settings[type] !== undefined ? settings[type] : defaultValue;
    
    return (
      <Col xs={24} sm={12} lg={12} key={type}>
        <Card
          className="h-full shadow-md hover:shadow-lg transition-shadow"
          headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {icon}
              <span style={{ fontWeight: 500 }}>{title}</span>
            </div>
            <Form.Item label={label} style={{ marginBottom: 0 }}>
              <InputNumber
                value={currentValue}
                min={min}
                max={max}
                onChange={(value) => handleThresholdChange(type, value)}
                style={{ width: '100%' }}
                size="large"
              />
            </Form.Item>
          </Space>
        </Card>
      </Col>
    );
  };

  const renderTimeCard = (title, icon, label, type, defaultValue = 0) => {
    const currentValue = settings[type] !== undefined ? settings[type] : defaultValue;
    
    return (
      <Col xs={24} sm={12} lg={12} key={type}>
        <Card
          className="h-full shadow-md hover:shadow-lg transition-shadow"
          headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {icon}
              <span style={{ fontWeight: 500 }}>{title}</span>
            </div>
            <Form.Item label={label} style={{ marginBottom: 0 }}>
              <InputNumber
                value={currentValue}
                min={0}
                onChange={(value) => handleTimeChange(type, value)}
                style={{ width: '100%' }}
                size="large"
              />
            </Form.Item>
          </Space>
        </Card>
      </Col>
    );
  };

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
            title: 'Access Control Mgt',
          },
          {
            title: 'Access Control List',
            onClick: () => navigate('/access-control/list'),
            className: 'cursor-pointer',
          },
          {
            title: 'Configuring Digital Intercom Terminal',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600, color: '#ff4d4f' }}>
          # Configuring Digital Intercom Terminal
        </Title>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/access-control/list')}
        >
          Back to List
        </Button>
      </div>

      {/* Device Information Card */}
      <Card 
        style={{ marginBottom: 24 }}
        headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Installation Position" name="installationPosition">
                <Input disabled size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Access Control Name" name="accessControlName">
                <Input disabled size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="LocalId" name="localId">
                <Input disabled size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Switch Settings Section */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 16, color: '#3C0056' }}>
          Switch Settings
        </Title>
        <Row gutter={[16, 16]}>
          {renderSwitchCard(
            'Liveness Detection',
            <PoweroffOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
            'Living Switch',
            SetDoorTypeEnum.LIVENESS_SWITCH
          )}
          {renderSwitchCard(
            'Cloud Intercom',
            <CloudOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
            'Cloud Intercom Switch',
            SetDoorTypeEnum.CLOUD_INTERCOM_SWITCH
          )}
          {renderSwitchCard(
            'QR Code',
            <QrcodeOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
            'Qr Code Lock Switch',
            SetDoorTypeEnum.QR_CODE_SWITCH
          )}
          {renderSwitchCard(
            'Face Recognition',
            <EyeOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
            'Automatic Face Recognition Switch',
            SetDoorTypeEnum.AUTOMATIC_FACE_SWITCH
          )}
          {renderSwitchCard(
            'Card Verification',
            <CreditCardOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
            'Credit Card Check Switch Failure',
            SetDoorTypeEnum.CARD_SWIPE_FAILURE_VERIFICATION
          )}
          {renderSwitchCard(
            'Direct Call',
            <PhoneOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
            'Call Phone Switch Directly',
            SetDoorTypeEnum.DIRECT_CALL_MOBILE
          )}
          {renderSwitchCard(
            'Unlock Record',
            <CameraOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
            'Whether to upload a picture of the unlocking record',
            SetDoorTypeEnum.UPLOAD_UNLOCK_RECORD_IMAGE
          )}
        </Row>
      </div>

      {/* Threshold Settings Section */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 16, color: '#3C0056' }}>
          Threshold Settings
        </Title>
        <Row gutter={[16, 16]}>
          {renderThresholdCard(
            'Liveness Threshold',
            <SlidersOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
            'Living Threshold',
            SetDoorTypeEnum.LIVENESS_THRESHOLD,
            90
          )}
          {renderThresholdCard(
            'Recognition Threshold',
            <SlidersOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
            'Recognition Threshold',
            SetDoorTypeEnum.FACE_RECOGNITION_THRESHOLD,
            90
          )}
        </Row>
      </div>

      {/* Time Settings Section */}
      <div>
        <Title level={4} style={{ marginBottom: 16, color: '#3C0056' }}>
          Time Settings
        </Title>
        <Row gutter={[16, 16]}>
          {renderTimeCard(
            'Advertising Sleep Start',
            <ClockCircleOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
            'Advertising Dormancy Start Time',
            SetDoorTypeEnum.ADVERTISING_SLEEP_START,
            0
          )}
          {renderTimeCard(
            'Advertising Sleep End',
            <ClockCircleOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
            'Advertising Sleep Over Time',
            SetDoorTypeEnum.ADVERTISING_SLEEP_END,
            600
          )}
        </Row>
      </div>
    </div>
  );
};

export default DoorConfiguration;
