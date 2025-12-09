import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Typography, Breadcrumb, Card, Form, Input, Button, Space, message, Select, Row, Col, InputNumber, Alert } from 'antd';
import { HomeOutlined, ReloadOutlined, CloudUploadOutlined, SettingOutlined, CloudServerOutlined, ApiOutlined, WarningOutlined } from '@ant-design/icons';
import { fetchDevices } from '../store/slices/deviceSlice';
import { deviceService } from '../services/deviceService';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DeviceConfig = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: devices, loading } = useSelector((state) => state.devices);
  const token = useSelector((state) => state.auth.token);
  
  const [restartForm] = Form.useForm();
  const [upgradeSoftwareForm] = Form.useForm();
  const [upgradeConfigForm] = Form.useForm();
  const [serverInfoForm] = Form.useForm();
  const [reloadSipForm] = Form.useForm();

  const [loadingRestart, setLoadingRestart] = useState(false);
  const [loadingUpgradeSoftware, setLoadingUpgradeSoftware] = useState(false);
  const [loadingUpgradeConfig, setLoadingUpgradeConfig] = useState(false);
  const [loadingServerInfo, setLoadingServerInfo] = useState(false);
  const [loadingReloadSip, setLoadingReloadSip] = useState(false);

  useEffect(() => {
    dispatch(fetchDevices({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const handleRestart = async (values) => {
    setLoadingRestart(true);
    try {
      await deviceService.restartDevice(values.localId);
      message.success('Device restart initiated successfully');
      restartForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to restart device');
    } finally {
      setLoadingRestart(false);
    }
  };

  const handleUpgradeSoftware = async (values) => {
    setLoadingUpgradeSoftware(true);
    try {
      const payload = {
        localId: values.localId,
        url: String(values.url),
        size: Number(values.size),
        version: String(values.version),
        content: String(values.content || ''),
        verifCode: String(values.verifCode || ''),
      };
      await deviceService.upgradeSoftware(payload);
      message.success('Software upgrade initiated successfully');
      upgradeSoftwareForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to upgrade software');
    } finally {
      setLoadingUpgradeSoftware(false);
    }
  };

  const handleUpgradeConfig = async (values) => {
    setLoadingUpgradeConfig(true);
    try {
      const payload = {
        localId: values.localId,
        url: String(values.url),
        size: Number(values.size),
        version: String(values.version),
        content: String(values.content || ''),
        verifCode: String(values.verifCode || ''),
      };
      await deviceService.upgradeConfig(payload);
      message.success('Config upgrade initiated successfully');
      upgradeConfigForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to upgrade config');
    } finally {
      setLoadingUpgradeConfig(false);
    }
  };

  const handleSetServerInfo = async (values) => {
    setLoadingServerInfo(true);
    try {
      const payload = {
        localId: values.localId,
        ip: String(values.ip),
        port: Number(values.port),
      };
      await deviceService.setServerInfo(payload);
      message.success('Server info set successfully');
      serverInfoForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to set server info');
    } finally {
      setLoadingServerInfo(false);
    }
  };

  const handleReloadSip = async (values) => {
    setLoadingReloadSip(true);
    try {
      await deviceService.reloadSip({ localId: values.localId });
      message.success('SIP reloaded successfully');
      reloadSipForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to reload SIP');
    } finally {
      setLoadingReloadSip(false);
    }
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
            title: 'Device Manager',
          },
          {
            title: 'Device Config',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600, color: '#3C0056' }}>
          Device Config
        </Title>
      </div>

      {/* Warning Alert */}
      <Alert
        message="Device Configuration"
        description="Please be careful when configuring devices. These operations may affect device functionality."
        type="warning"
        icon={<WarningOutlined />}
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Device Config Grid */}
      <Row gutter={[24, 24]}>
        {/* Restart Device */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ReloadOutlined style={{ color: '#3C0056' }} />
                <span>Restart Device</span>
              </Space>
            }
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
          >
            <Form
              form={restartForm}
              layout="vertical"
              onFinish={handleRestart}
            >
              <Form.Item
                name="localId"
                label="Device ID"
                rules={[{ required: true, message: 'Please enter device ID' }]}
              >
                <Input
                  placeholder="Enter device ID"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingRestart}
                  icon={<ReloadOutlined />}
                  block
                  danger
                  style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
                >
                  Restart Device
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Reload SIP */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ApiOutlined style={{ color: '#3C0056' }} />
                <span>Reload SIP</span>
              </Space>
            }
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
          >
            <Form
              form={reloadSipForm}
              layout="vertical"
              onFinish={handleReloadSip}
            >
              <Form.Item
                name="localId"
                label="Local ID"
                rules={[{ required: true, message: 'Please select a device' }]}
              >
                <Select
                  placeholder="Select device"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={loading}
                >
                  {devices.map((device) => (
                    <Option key={device.id || device._id} value={device.localId}>
                      {device.localId} {device.deviceType ? `(${device.deviceType})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingReloadSip}
                  icon={<ApiOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  Reload SIP
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Set Server Info */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CloudServerOutlined style={{ color: '#3C0056' }} />
                <span>Set Server Info</span>
              </Space>
            }
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
          >
            <Form
              form={serverInfoForm}
              layout="vertical"
              onFinish={handleSetServerInfo}
            >
              <Form.Item
                name="localId"
                label="Local ID"
                rules={[{ required: true, message: 'Please select a device' }]}
              >
                <Select
                  placeholder="Select device"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={loading}
                >
                  {devices.map((device) => (
                    <Option key={device.id || device._id} value={device.localId}>
                      {device.localId} {device.deviceType ? `(${device.deviceType})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="ip"
                label="IP Address"
                rules={[
                  { required: true, message: 'Please enter IP address' },
                  {
                    pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
                    message: 'Please enter a valid IP address',
                  },
                ]}
              >
                <Input placeholder="e.g., 202.168.222.225" />
              </Form.Item>

              <Form.Item
                name="port"
                label="Port"
                rules={[
                  { required: true, message: 'Please enter port number' },
                  { type: 'number', min: 1, max: 65535, message: 'Port must be between 1 and 65535' },
                ]}
              >
                <InputNumber
                  placeholder="e.g., 9000"
                  min={1}
                  max={65535}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingServerInfo}
                  icon={<CloudServerOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  Set Server Info
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Upgrade Software */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CloudUploadOutlined style={{ color: '#3C0056' }} />
                <span>Upgrade Software</span>
              </Space>
            }
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
          >
            <Form
              form={upgradeSoftwareForm}
              layout="vertical"
              onFinish={handleUpgradeSoftware}
            >
              <Form.Item
                name="localId"
                label="Local ID"
                rules={[{ required: true, message: 'Please select a device' }]}
              >
                <Select
                  placeholder="Select device"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={loading}
                >
                  {devices.map((device) => (
                    <Option key={device.id || device._id} value={device.localId}>
                      {device.localId} {device.deviceType ? `(${device.deviceType})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="url"
                label="Download URL"
                rules={[
                  { required: true, message: 'Please enter download URL' },
                  { type: 'url', message: 'Please enter a valid URL' },
                ]}
              >
                <Input placeholder="e.g., http://open.trudian.com/1.zip" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="size"
                    label="File Size (bytes)"
                    rules={[{ required: true, message: 'Please enter file size' }]}
                  >
                    <InputNumber
                      placeholder="e.g., 108524"
                      min={1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="version"
                    label="Version"
                    rules={[{ required: true, message: 'Please enter version' }]}
                  >
                    <Input placeholder="e.g., v1.01" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="content"
                label="Content/Description"
              >
                <TextArea rows={2} placeholder="e.g., fix BUG" />
              </Form.Item>

              <Form.Item
                name="verifCode"
                label="Verification Code"
              >
                <Input placeholder="e.g., ABCDEFG" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingUpgradeSoftware}
                  icon={<CloudUploadOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  Upgrade Software
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Upgrade Config */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SettingOutlined style={{ color: '#3C0056' }} />
                <span>Upgrade Config</span>
              </Space>
            }
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
          >
            <Form
              form={upgradeConfigForm}
              layout="vertical"
              onFinish={handleUpgradeConfig}
            >
              <Form.Item
                name="localId"
                label="Local ID"
                rules={[{ required: true, message: 'Please select a device' }]}
              >
                <Select
                  placeholder="Select device"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={loading}
                >
                  {devices.map((device) => (
                    <Option key={device.id || device._id} value={device.localId}>
                      {device.localId} {device.deviceType ? `(${device.deviceType})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="url"
                label="Download URL"
                rules={[
                  { required: true, message: 'Please enter download URL' },
                  { type: 'url', message: 'Please enter a valid URL' },
                ]}
              >
                <Input placeholder="e.g., http://open.trudian.com/1.zip" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="size"
                    label="File Size (bytes)"
                    rules={[{ required: true, message: 'Please enter file size' }]}
                  >
                    <InputNumber
                      placeholder="e.g., 108524"
                      min={1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="version"
                    label="Version"
                    rules={[{ required: true, message: 'Please enter version' }]}
                  >
                    <Input placeholder="e.g., v1.01" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="content"
                label="Content/Description"
              >
                <TextArea rows={2} placeholder="e.g., fix BUG" />
              </Form.Item>

              <Form.Item
                name="verifCode"
                label="Verification Code"
              >
                <Input placeholder="e.g., ABCDEFG" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingUpgradeConfig}
                  icon={<SettingOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  Upgrade Config
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DeviceConfig;
