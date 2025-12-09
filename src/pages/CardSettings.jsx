import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Typography, Breadcrumb, Card, Form, Input, Button, Space, message, Select, Row, Col, InputNumber } from 'antd';
import { HomeOutlined, CreditCardOutlined, UserOutlined, IdcardOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { fetchDevices } from '../store/slices/deviceSlice';
import { deviceService } from '../services/deviceService';

const { Title } = Typography;
const { Option } = Select;

const CardSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: devices, loading } = useSelector((state) => state.devices);
  const token = useSelector((state) => state.auth.token);
  
  const [managerCardForm] = Form.useForm();
  const [liveCardForm] = Form.useForm();
  const [icCardForm] = Form.useForm();
  const [idCardForm] = Form.useForm();

  const [loadingManager, setLoadingManager] = useState(false);
  const [loadingLive, setLoadingLive] = useState(false);
  const [loadingIC, setLoadingIC] = useState(false);
  const [loadingID, setLoadingID] = useState(false);

  useEffect(() => {
    dispatch(fetchDevices({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const handleSetManagerCard = async (values) => {
    setLoadingManager(true);
    try {
      const payload = {
        localId: values.localId,
        sectionId: Number(values.sectionId),
        sectionPwd: String(values.sectionPwd),
      };
      await deviceService.setManagerCard(payload);
      message.success('Manager card set successfully');
      managerCardForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to set manager card');
    } finally {
      setLoadingManager(false);
    }
  };

  const handleSetLiveCard = async (values) => {
    setLoadingLive(true);
    try {
      const payload = {
        localId: values.localId,
        cardOpt: Number(values.cardOpt),
        cardSN: String(values.cardSN),
      };
      await deviceService.setLiveCard(payload);
      message.success('Live card set successfully');
      liveCardForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to set live card');
    } finally {
      setLoadingLive(false);
    }
  };

  const handleSetICCard = async (values) => {
    setLoadingIC(true);
    try {
      const payload = {
        localId: values.localId,
        cardOpt: Number(values.cardOpt),
        cardSN: String(values.cardSN),
      };
      await deviceService.setICCard(payload);
      message.success('IC card set successfully');
      icCardForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to set IC card');
    } finally {
      setLoadingIC(false);
    }
  };

  const handleSetIDCard = async (values) => {
    setLoadingID(true);
    try {
      const payload = {
        localId: values.localId,
        cardOpt: Number(values.cardOpt),
        cardSN: String(values.cardSN),
      };
      await deviceService.setIDCard(payload);
      message.success('ID card set successfully');
      idCardForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to set ID card');
    } finally {
      setLoadingID(false);
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
            title: 'Card Settings',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600, color: '#3C0056' }}>
          Card Settings
        </Title>
      </div>

      {/* Card Settings Grid */}
      <Row gutter={[24, 24]}>
        {/* Manager Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <UserOutlined style={{ color: '#3C0056' }} />
                <span>Set Manager Card</span>
              </Space>
            }
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
          >
            <Form
              form={managerCardForm}
              layout="vertical"
              onFinish={handleSetManagerCard}
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
                name="sectionId"
                label="Section ID"
                rules={[{ required: true, message: 'Please enter section ID' }]}
              >
                <InputNumber
                  placeholder="Enter section ID"
                  min={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="sectionPwd"
                label="Section Password"
                rules={[
                  { required: true, message: 'Please enter section password' },
                  { max: 50, message: 'Maximum 50 characters' },
                ]}
              >
                <Input.Password placeholder="Enter section password" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingManager}
                  icon={<CheckCircleOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  Set Manager Card
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Live Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CreditCardOutlined style={{ color: '#3C0056' }} />
                <span>Set Live Card</span>
              </Space>
            }
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
          >
            <Form
              form={liveCardForm}
              layout="vertical"
              onFinish={handleSetLiveCard}
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
                name="cardOpt"
                label="Card Option"
                rules={[{ required: true, message: 'Please enter card option' }]}
              >
                <InputNumber
                  placeholder="Enter card option"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="cardSN"
                label="Card Serial Number"
                rules={[
                  { required: true, message: 'Please enter card serial number' },
                  { max: 50, message: 'Maximum 50 characters' },
                ]}
              >
                <Input placeholder="Enter card serial number" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingLive}
                  icon={<CheckCircleOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  Set Live Card
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* IC Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SafetyOutlined style={{ color: '#3C0056' }} />
                <span>Set IC Card</span>
              </Space>
            }
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
          >
            <Form
              form={icCardForm}
              layout="vertical"
              onFinish={handleSetICCard}
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
                name="cardOpt"
                label="Card Option"
                rules={[{ required: true, message: 'Please enter card option' }]}
              >
                <InputNumber
                  placeholder="Enter card option"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="cardSN"
                label="Card Serial Number"
                rules={[
                  { required: true, message: 'Please enter card serial number' },
                  { max: 50, message: 'Maximum 50 characters' },
                ]}
              >
                <Input placeholder="Enter card serial number" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingIC}
                  icon={<CheckCircleOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  Set IC Card
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* ID Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <IdcardOutlined style={{ color: '#3C0056' }} />
                <span>Set ID Card</span>
              </Space>
            }
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            headStyle={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' }}
          >
            <Form
              form={idCardForm}
              layout="vertical"
              onFinish={handleSetIDCard}
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
                name="cardOpt"
                label="Card Option"
                rules={[{ required: true, message: 'Please enter card option' }]}
              >
                <InputNumber
                  placeholder="Enter card option"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="cardSN"
                label="Card Serial Number"
                rules={[
                  { required: true, message: 'Please enter card serial number' },
                  { max: 50, message: 'Maximum 50 characters' },
                ]}
              >
                <Input placeholder="Enter card serial number" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingID}
                  icon={<CheckCircleOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  Set ID Card
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CardSettings;
