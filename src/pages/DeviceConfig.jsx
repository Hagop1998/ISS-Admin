import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Typography, Breadcrumb, Card, Form, Input, Button, Space, message, Select, Row, Col, InputNumber, Alert, Table, Tag } from 'antd';
import { HomeOutlined, ReloadOutlined, CloudUploadOutlined, SettingOutlined, CloudServerOutlined, ApiOutlined, WarningOutlined, SearchOutlined } from '@ant-design/icons';
import { restartDevice, upgradeSoftware, upgradeConfig, setServerInfo, reloadSip } from '../store/slices/deviceSlice';
import { fetchAddresses } from '../store/slices/accessControlSlice';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DeviceConfig = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: accessControlDevices, devicesLoading } = useSelector((state) => state.accessControl);
  const token = useSelector((state) => state.auth.token);
  
  const [restartForm] = Form.useForm();
  const [upgradeSoftwareForm] = Form.useForm();
  const [upgradeConfigForm] = Form.useForm();
  const [serverInfoForm] = Form.useForm();
  const [reloadSipForm] = Form.useForm();

  const [filteredDevices, setFilteredDevices] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const hasFetchedRef = useRef(false);

  const { devicesLoading: deviceActionLoading } = useSelector((state) => state.devices);

  // Extract unique addresses from devices (devices already have address info)
  const addresses = useMemo(() => {
    const addressMap = new Map();
    const allDevices = accessControlDevices || [];
    allDevices.forEach((device) => {
      const address = device.address;
      if (address && typeof address === 'object') {
        const addressId = address.id || address._id || device.addressId;
        if (addressId && !addressMap.has(addressId)) {
          addressMap.set(addressId, {
            id: addressId,
            _id: addressId,
            address: address.address || address.name || '',
            name: address.name || address.address || '',
            city: address.city || '',
          });
        }
      } else if (device.addressId) {
        // If address is not an object but we have addressId, create a minimal address entry
        if (!addressMap.has(device.addressId)) {
          addressMap.set(device.addressId, {
            id: device.addressId,
            _id: device.addressId,
            address: `Address ${device.addressId}`,
            name: `Address ${device.addressId}`,
          });
        }
      }
    });
    return Array.from(addressMap.values());
  }, [accessControlDevices]);

  useEffect(() => {
    if (!token) {
      return;
    }

    // Prevent duplicate calls from React.StrictMode double render
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    // Fetch addresses (devices are already included in address response)
    dispatch(fetchAddresses({ page: 1, limit: 10 }));
  }, [dispatch, token]);

  // Filter devices based on address selection
  useEffect(() => {
    let filtered = accessControlDevices || [];
    
    if (selectedAddressId) {
      filtered = filtered.filter((dev) => {
        const devAddressId = dev.addressId || dev.address?.id || dev.address?._id;
        return devAddressId == selectedAddressId;
      });
    }
    
    setFilteredDevices(filtered);
  }, [selectedAddressId, accessControlDevices]);

  // Filter devices based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDevices(selectedAddressId 
        ? (accessControlDevices || []).filter((dev) => {
            const devAddressId = dev.addressId || dev.address?.id || dev.address?._id;
            return devAddressId == selectedAddressId;
          })
        : (accessControlDevices || [])
      );
    } else {
      const searchLower = searchTerm.toLowerCase();
      const baseDevices = selectedAddressId 
        ? (accessControlDevices || []).filter((dev) => {
            const devAddressId = dev.addressId || dev.address?.id || dev.address?._id;
            return devAddressId == selectedAddressId;
          })
        : (accessControlDevices || []);
      
      const filtered = baseDevices.filter((device) => {
        const localId = (device.localId || device.serialNumber || '').toLowerCase();
        const position = (device.installationPosition || device.deviceType || '').toLowerCase();
        const label = (device.accessControlName || device.label || '').toLowerCase();
        const address = device.address;
        let addressName = '';
        if (typeof address === 'object' && address) {
          addressName = (address.address || address.name || '').toLowerCase();
        } else if (device.addressId) {
          const foundAddress = addresses.find(a => (a.id || a._id) == device.addressId);
          if (foundAddress) {
            addressName = (foundAddress.address || foundAddress.name || '').toLowerCase();
          }
        }
        
        return localId.includes(searchLower) ||
               position.includes(searchLower) ||
               label.includes(searchLower) ||
               addressName.includes(searchLower);
      });
      setFilteredDevices(filtered);
    }
  }, [searchTerm, selectedAddressId, accessControlDevices, addresses]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Set form values when device is selected
  useEffect(() => {
    if (selectedDeviceId) {
      const selectedDevice = filteredDevices.find(d => (d.id || d._id) == selectedDeviceId) || 
                            accessControlDevices.find(d => (d.id || d._id) == selectedDeviceId) ||
                            accessControlDevices.find(d => (d.id || d._id) == selectedDeviceId);
      
      if (selectedDevice) {
        const deviceLocalId = selectedDevice.localId || selectedDevice.serialNumber;
        restartForm.setFieldsValue({ localId: deviceLocalId });
        reloadSipForm.setFieldsValue({ localId: deviceLocalId });
        serverInfoForm.setFieldsValue({ localId: deviceLocalId });
        upgradeSoftwareForm.setFieldsValue({ localId: deviceLocalId });
        upgradeConfigForm.setFieldsValue({ localId: deviceLocalId });
      }
    } else {
      // Reset forms when no device is selected
      restartForm.resetFields();
      reloadSipForm.resetFields();
      serverInfoForm.resetFields();
      upgradeSoftwareForm.resetFields();
      upgradeConfigForm.resetFields();
    }
  }, [selectedDeviceId, filteredDevices, accessControlDevices, restartForm, reloadSipForm, serverInfoForm, upgradeSoftwareForm, upgradeConfigForm]);

  const handleRestart = async (values) => {
    try {
      await dispatch(restartDevice(values.localId)).unwrap();
      message.success(t('pages.deviceConfig.msgRestartSuccess'));
      restartForm.resetFields();
    } catch (error) {
      message.error(error || t('pages.deviceConfig.msgRestartFailed'));
    }
  };

  const handleUpgradeSoftware = async (values) => {
    try {
      const payload = {
        localId: values.localId,
        url: String(values.url),
        size: Number(values.size),
        version: String(values.version),
        content: String(values.content || ''),
        verifCode: String(values.verifCode || ''),
      };
      await dispatch(upgradeSoftware(payload)).unwrap();
      message.success(t('pages.deviceConfig.msgUpgradeSoftwareSuccess'));
      upgradeSoftwareForm.resetFields();
    } catch (error) {
      message.error(error || t('pages.deviceConfig.msgUpgradeSoftwareFailed'));
    }
  };

  const handleUpgradeConfig = async (values) => {
    try {
      const payload = {
        localId: values.localId,
        url: String(values.url),
        size: Number(values.size),
        version: String(values.version),
        content: String(values.content || ''),
        verifCode: String(values.verifCode || ''),
      };
      await dispatch(upgradeConfig(payload)).unwrap();
      message.success(t('pages.deviceConfig.msgUpgradeConfigSuccess'));
      upgradeConfigForm.resetFields();
    } catch (error) {
      message.error(error || t('pages.deviceConfig.msgUpgradeConfigFailed'));
    }
  };

  const handleSetServerInfo = async (values) => {
    try {
      const payload = {
        localId: values.localId,
        ip: String(values.ip),
        port: Number(values.port),
      };
      await dispatch(setServerInfo(payload)).unwrap();
      message.success(t('pages.deviceConfig.msgServerInfoSuccess'));
      serverInfoForm.resetFields();
    } catch (error) {
      message.error(error || t('pages.deviceConfig.msgServerInfoFailed'));
    }
  };

  const handleReloadSip = async (values) => {
    try {
      await dispatch(reloadSip({ localId: values.localId })).unwrap();
      message.success(t('pages.deviceConfig.msgReloadSipSuccess'));
      reloadSipForm.resetFields();
    } catch (error) {
      message.error(error || t('pages.deviceConfig.msgReloadSipFailed'));
    }
  };

  const handleAddressChange = (value) => {
    setSelectedAddressId(value || null);
    setSelectedDeviceId(null); // Reset selected device when address changes
  };

  const handleDeviceSelect = (deviceId) => {
    setSelectedDeviceId(deviceId);
  };

  const handleBackToTable = () => {
    setSelectedDeviceId(null);
  };

  // Get devices to show in forms - when device is selected, show only that device
  const getDevicesForForms = () => {
    if (selectedDeviceId) {
      const device = filteredDevices.find(d => (d.id || d._id) == selectedDeviceId) || 
                    accessControlDevices.find(d => (d.id || d._id) == selectedDeviceId);
      return device ? [device] : [];
    }
    if (selectedAddressId) {
      return (accessControlDevices || []).filter((dev) => {
        const devAddressId = dev.addressId || dev.address?.id || dev.address?._id;
        return devAddressId == selectedAddressId;
      });
    }
    return accessControlDevices || [];
  };

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden">
      <Breadcrumb
        items={[
          { href: '/', title: <HomeOutlined /> },
          { title: t('pages.deviceConfig.breadcrumbMgt') },
          { title: t('pages.deviceConfig.breadcrumbList') },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600, color: '#3C0056' }}>
          {t('pages.deviceConfig.title')}
        </Title>
      </div>

      <Alert
        message={t('pages.deviceConfig.alertTitle')}
        description={t('pages.deviceConfig.alertDesc')}
        type="warning"
        icon={<WarningOutlined />}
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card 
        style={{ marginBottom: 24 }}
        styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
        title={t('pages.deviceConfig.selectAddress')}
      >
        <Form.Item label={t('pages.deviceConfig.selectAddress')} style={{ marginBottom: 0 }}>
          <Select
            placeholder={t('pages.deviceConfig.selectAddressPlaceholder')}
            size="large"
            value={selectedAddressId}
            onChange={handleAddressChange}
            style={{ width: '100%' }}
            showSearch
            allowClear
            filterOption={(input, option) => {
              const label = option?.label || option?.children || '';
              const labelStr = typeof label === 'string' ? label : String(label);
              return labelStr.toLowerCase().includes(input.toLowerCase());
            }}
            optionLabelProp="label"
          >
            {addresses.map((address) => {
              const addressLabel = address.address || address.name || `Address ${address.id || address._id}`;
              return (
                <Option key={address.id || address._id} value={address.id || address._id} label={addressLabel}>
                  {addressLabel}
                  {address.city && ` - ${address.city}`}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
      </Card>

      {/* Devices Table - Show when no device is selected */}
      {!selectedDeviceId && (
        <Card 
          style={{ marginBottom: 24 }}
          styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
          title={selectedAddressId ? t('pages.deviceConfig.selectDevice') : t('pages.deviceConfig.allDevices')}
        >
          {filteredDevices.length > 0 ? (
            <Table
              dataSource={filteredDevices}
              rowKey={(record) => record.id || record._id}
              pagination={false}
              onRow={(record) => ({
                onClick: () => handleDeviceSelect(record.id || record._id),
                style: { cursor: 'pointer' }
              })}
              columns={[
                {
                  title: t('pages.deviceConfig.colLocalId'),
                  dataIndex: 'localId',
                  key: 'localId',
                  render: (text, record) => text || record.serialNumber || '-',
                },
                {
                  title: t('pages.deviceConfig.colPosition'),
                  key: 'position',
                  render: (_, record) => {
                    const position = record.installationPosition || record.deviceType || '-';
                    const label = record.accessControlName || record.label || '';
                    return position && label ? `${position} / ${label}` : position || label || '-';
                  },
                },
                {
                  title: t('pages.deviceConfig.colAddress'),
                  key: 'address',
                  render: (_, record) => {
                    const address = record.address || record.addressId;
                    if (typeof address === 'object' && address) {
                      return address.address || address.name || `Address ${address.id || address._id}`;
                    }
                    const addressId = record.addressId || address;
                    if (addressId) {
                      const foundAddress = addresses.find(a => (a.id || a._id) == addressId);
                      if (foundAddress) {
                        return foundAddress.address || foundAddress.name || `Address ${addressId}`;
                      }
                    }
                    return '-';
                  },
                },
                {
                  title: t('pages.deviceConfig.colStatus'),
                  key: 'status',
                  render: (_, record) => {
                    const isOnline = record.isOnline;
                    const isEnabled = record.isEnabled;
                    return (
                      <Space>
                        <Tag color={isOnline ? 'green' : 'red'}>
                          {isOnline ? t('common.online') : t('common.offline')}
                        </Tag>
                        <Tag color={isEnabled ? 'blue' : 'default'}>
                          {isEnabled ? t('pages.accessControl.enable') : t('pages.accessControl.disable')}
                        </Tag>
                      </Space>
                    );
                  },
                },
                {
                  title: t('pages.deviceConfig.colAction'),
                  key: 'action',
                  render: (_, record) => (
                    <Button
                      type="primary"
                      icon={<SettingOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeviceSelect(record.id || record._id);
                      }}
                      style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                    >
                      {t('pages.deviceConfig.configure')}
                    </Button>
                  ),
                },
              ]}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              {searchTerm 
                ? t('pages.deviceConfig.noDevicesMatching', { term: searchTerm })
                : t('pages.deviceConfig.noDevicesFound')}
            </div>
          )}
        </Card>
      )}

      {!selectedDeviceId && filteredDevices.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            {searchTerm 
              ? t('pages.deviceConfig.noDevicesMatching', { term: searchTerm })
              : selectedAddressId 
                ? t('pages.deviceConfig.noDevicesForAddress')
                : t('pages.deviceConfig.noDevicesFound')}
          </div>
        </Card>
      )}

      {selectedDeviceId && (() => {
        const selectedDevice = filteredDevices.find(d => (d.id || d._id) == selectedDeviceId) || 
                              accessControlDevices.find(d => (d.id || d._id) == selectedDeviceId) ||
                              accessControlDevices.find(d => (d.id || d._id) == selectedDeviceId);
        
        if (!selectedDevice) {
          return <div>{t('pages.deviceConfig.deviceNotFound')}</div>;
        }

        return (
          <div>
            <Button
              icon={<HomeOutlined />}
              onClick={handleBackToTable}
              style={{ marginBottom: 16 }}
            >
              {t('pages.deviceConfig.backToDeviceList')}
            </Button>
            
            <Card 
              style={{ marginBottom: 24 }}
              styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
              title={t('pages.deviceConfig.deviceLabel', { name: selectedDevice.localId || selectedDevice.serialNumber || 'Unknown' })}
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label={t('pages.deviceConfig.colLocalId')}>
                    <Input 
                      disabled 
                      size="large" 
                      value={selectedDevice.localId || selectedDevice.serialNumber || '-'}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label={t('pages.deviceConfig.colPosition')}>
                    <Input 
                      disabled 
                      size="large" 
                      value={selectedDevice.installationPosition || selectedDevice.deviceType || '-'}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label={t('pages.deviceConfig.colStatus')}>
                    <Space>
                      <Tag color={selectedDevice.isOnline ? 'green' : 'red'}>
                        {selectedDevice.isOnline ? t('common.online') : t('common.offline')}
                      </Tag>
                      <Tag color={selectedDevice.isEnabled ? 'blue' : 'default'}>
                        {selectedDevice.isEnabled ? t('pages.accessControl.enable') : t('pages.accessControl.disable')}
                      </Tag>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ReloadOutlined style={{ color: '#3C0056' }} />
                <span>{t('pages.deviceConfig.restartDevice')}</span>
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
                label={t('pages.deviceConfig.deviceId')}
                rules={[{ required: true, message: t('pages.deviceConfig.pleaseEnterDeviceId') }]}
              >
                <Input
                  placeholder={t('pages.deviceConfig.enterDeviceId')}
                  size="large"
                  disabled
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={deviceActionLoading}
                  icon={<ReloadOutlined />}
                  block
                  danger
                  style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
                >
                  {t('pages.deviceConfig.restartDevice')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ApiOutlined style={{ color: '#3C0056' }} />
                <span>{t('pages.deviceConfig.reloadSip')}</span>
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
                label={t('pages.deviceConfig.colLocalId')}
                rules={[{ required: true, message: t('pages.deviceConfig.pleaseSelectDevice') }]}
              >
                <Select
                  placeholder={t('pages.deviceConfig.selectDevicePlaceholder')}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={devicesLoading}
                  disabled
                >
                  {selectedDevice && (
                    <Option value={selectedDevice.localId || selectedDevice.serialNumber}>
                      {selectedDevice.localId || selectedDevice.serialNumber} {selectedDevice.deviceType ? `(${selectedDevice.deviceType})` : ''}
                    </Option>
                  )}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={deviceActionLoading}
                  icon={<ApiOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  {t('pages.deviceConfig.reloadSip')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CloudServerOutlined style={{ color: '#3C0056' }} />
                <span>{t('pages.deviceConfig.setServerInfo')}</span>
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
                label={t('pages.deviceConfig.colLocalId')}
                rules={[{ required: true, message: t('pages.deviceConfig.pleaseSelectDevice') }]}
              >
                <Select
                  placeholder={t('pages.deviceConfig.selectDevicePlaceholder')}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={devicesLoading}
                  disabled
                >
                  {selectedDevice && (
                    <Option value={selectedDevice.localId || selectedDevice.serialNumber}>
                      {selectedDevice.localId || selectedDevice.serialNumber} {selectedDevice.deviceType ? `(${selectedDevice.deviceType})` : ''}
                    </Option>
                  )}
                </Select>
              </Form.Item>

              <Form.Item
                name="ip"
                label={t('pages.deviceConfig.ipAddress')}
                rules={[
                  { required: true, message: t('pages.deviceConfig.pleaseEnterIp') },
                  {
                    pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
                    message: t('pages.deviceConfig.validIp'),
                  },
                ]}
              >
                <Input placeholder="e.g., 202.168.222.225" />
              </Form.Item>

              <Form.Item
                name="port"
                label={t('pages.deviceConfig.port')}
                rules={[
                  { required: true, message: t('pages.deviceConfig.pleaseEnterPort') },
                  { type: 'number', min: 1, max: 65535, message: t('pages.deviceConfig.portRange') },
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
                  loading={deviceActionLoading}
                  icon={<CloudServerOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  {t('pages.deviceConfig.setServerInfo')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CloudUploadOutlined style={{ color: '#3C0056' }} />
                <span>{t('pages.deviceConfig.upgradeSoftware')}</span>
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
                label={t('pages.deviceConfig.colLocalId')}
                rules={[{ required: true, message: t('pages.deviceConfig.pleaseSelectDevice') }]}
              >
                <Select
                  placeholder={t('pages.deviceConfig.selectDevicePlaceholder')}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={devicesLoading}
                  disabled
                >
                  {selectedDevice && (
                    <Option value={selectedDevice.localId || selectedDevice.serialNumber}>
                      {selectedDevice.localId || selectedDevice.serialNumber} {selectedDevice.deviceType ? `(${selectedDevice.deviceType})` : ''}
                    </Option>
                  )}
                </Select>
              </Form.Item>

              <Form.Item
                name="url"
                label={t('pages.deviceConfig.downloadUrl')}
                rules={[
                  { required: true, message: t('pages.deviceConfig.pleaseEnterUrl') },
                  { type: 'url', message: t('pages.deviceConfig.validUrl') },
                ]}
              >
                <Input placeholder="e.g., http://open.trudian.com/1.zip" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="size"
                    label={t('pages.deviceConfig.fileSize')}
                    rules={[{ required: true, message: t('pages.deviceConfig.pleaseEnterFileSize') }]}
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
                    label={t('pages.deviceConfig.version')}
                    rules={[{ required: true, message: t('pages.deviceConfig.pleaseEnterVersion') }]}
                  >
                    <Input placeholder="e.g., v1.01" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="content"
                label={t('pages.deviceConfig.contentDesc')}
              >
                <TextArea rows={2} placeholder="e.g., fix BUG" />
              </Form.Item>

              <Form.Item
                name="verifCode"
                label={t('pages.deviceConfig.verificationCode')}
              >
                <Input placeholder="e.g., ABCDEFG" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={deviceActionLoading}
                  icon={<CloudUploadOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  {t('pages.deviceConfig.upgradeSoftware')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SettingOutlined style={{ color: '#3C0056' }} />
                <span>{t('pages.deviceConfig.upgradeConfig')}</span>
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
                label={t('pages.deviceConfig.colLocalId')}
                rules={[{ required: true, message: t('pages.deviceConfig.pleaseSelectDevice') }]}
              >
                <Select
                  placeholder={t('pages.deviceConfig.selectDevicePlaceholder')}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={devicesLoading}
                  disabled
                >
                  {selectedDevice && (
                    <Option value={selectedDevice.localId || selectedDevice.serialNumber}>
                      {selectedDevice.localId || selectedDevice.serialNumber} {selectedDevice.deviceType ? `(${selectedDevice.deviceType})` : ''}
                    </Option>
                  )}
                </Select>
              </Form.Item>

              <Form.Item
                name="url"
                label={t('pages.deviceConfig.downloadUrl')}
                rules={[
                  { required: true, message: t('pages.deviceConfig.pleaseEnterUrl') },
                  { type: 'url', message: t('pages.deviceConfig.validUrl') },
                ]}
              >
                <Input placeholder="e.g., http://open.trudian.com/1.zip" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="size"
                    label={t('pages.deviceConfig.fileSize')}
                    rules={[{ required: true, message: t('pages.deviceConfig.pleaseEnterFileSize') }]}
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
                    label={t('pages.deviceConfig.version')}
                    rules={[{ required: true, message: t('pages.deviceConfig.pleaseEnterVersion') }]}
                  >
                    <Input placeholder="e.g., v1.01" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="content"
                label={t('pages.deviceConfig.contentDesc')}
              >
                <TextArea rows={2} placeholder="e.g., fix BUG" />
              </Form.Item>

              <Form.Item
                name="verifCode"
                label={t('pages.deviceConfig.verificationCode')}
              >
                <Input placeholder="e.g., ABCDEFG" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={deviceActionLoading}
                  icon={<SettingOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  {t('pages.deviceConfig.upgradeConfig')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
          </div>
        );
      })()}
    </div>
  );
};

export default DeviceConfig;
