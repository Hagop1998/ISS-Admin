import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Typography, Breadcrumb, Card, Form, Input, Button, Space, message, Select, Row, Col, InputNumber, Alert, Table, Tag } from 'antd';
import { HomeOutlined, ReloadOutlined, CloudUploadOutlined, SettingOutlined, CloudServerOutlined, ApiOutlined, WarningOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchDevices, restartDevice, upgradeSoftware, upgradeConfig, setServerInfo, reloadSip } from '../store/slices/deviceSlice';
import { fetchAddresses } from '../store/slices/accessControlSlice';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DeviceConfig = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: devices, loading } = useSelector((state) => state.devices);
  const { items: accessControlDevices, addresses, addressesLoading } = useSelector((state) => state.accessControl);
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

  const { loading: deviceActionLoading } = useSelector((state) => state.devices);

  useEffect(() => {
    dispatch(fetchDevices({ page: 1, limit: 100 }));
    dispatch(fetchAddresses());
  }, [dispatch]);

  // Filter devices based on address selection
  useEffect(() => {
    let filtered = accessControlDevices || devices || [];
    
    if (selectedAddressId) {
      filtered = filtered.filter((dev) => {
        const devAddressId = dev.addressId || dev.address?.id || dev.address?._id;
        return devAddressId == selectedAddressId;
      });
    }
    
    setFilteredDevices(filtered);
  }, [selectedAddressId, accessControlDevices, devices]);

  // Filter devices based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDevices(selectedAddressId 
        ? (accessControlDevices || []).filter((dev) => {
            const devAddressId = dev.addressId || dev.address?.id || dev.address?._id;
            return devAddressId == selectedAddressId;
          })
        : (accessControlDevices || devices || [])
      );
    } else {
      const searchLower = searchTerm.toLowerCase();
      const baseDevices = selectedAddressId 
        ? (accessControlDevices || []).filter((dev) => {
            const devAddressId = dev.addressId || dev.address?.id || dev.address?._id;
            return devAddressId == selectedAddressId;
          })
        : (accessControlDevices || devices || []);
      
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
  }, [searchTerm, selectedAddressId, accessControlDevices, devices, addresses]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Set form values when device is selected
  useEffect(() => {
    if (selectedDeviceId) {
      const selectedDevice = filteredDevices.find(d => (d.id || d._id) == selectedDeviceId) || 
                            devices.find(d => (d.id || d._id) == selectedDeviceId) ||
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
  }, [selectedDeviceId, filteredDevices, devices, accessControlDevices, restartForm, reloadSipForm, serverInfoForm, upgradeSoftwareForm, upgradeConfigForm]);

  const handleRestart = async (values) => {
    try {
      await dispatch(restartDevice(values.localId)).unwrap();
      message.success('Device restart initiated successfully');
      restartForm.resetFields();
    } catch (error) {
      message.error(error || 'Failed to restart device');
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
      message.success('Software upgrade initiated successfully');
      upgradeSoftwareForm.resetFields();
    } catch (error) {
      message.error(error || 'Failed to upgrade software');
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
      message.success('Config upgrade initiated successfully');
      upgradeConfigForm.resetFields();
    } catch (error) {
      message.error(error || 'Failed to upgrade config');
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
      message.success('Server info set successfully');
      serverInfoForm.resetFields();
    } catch (error) {
      message.error(error || 'Failed to set server info');
    }
  };

  const handleReloadSip = async (values) => {
    try {
      await dispatch(reloadSip({ localId: values.localId })).unwrap();
      message.success('SIP reloaded successfully');
      reloadSipForm.resetFields();
    } catch (error) {
      message.error(error || 'Failed to reload SIP');
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
                    devices.find(d => (d.id || d._id) == selectedDeviceId);
      return device ? [device] : [];
    }
    if (selectedAddressId) {
      return (accessControlDevices || []).filter((dev) => {
        const devAddressId = dev.addressId || dev.address?.id || dev.address?._id;
        return devAddressId == selectedAddressId;
      });
    }
    return accessControlDevices || devices || [];
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

      {/* Address Selection Card - Always visible */}
      <Card 
        style={{ marginBottom: 24 }}
        styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
        title="Select Address"
      >
        <Form.Item label="Select Address" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Select an address to filter devices (or leave empty to see all)"
            size="large"
            value={selectedAddressId}
            onChange={handleAddressChange}
            style={{ width: '100%' }}
            loading={addressesLoading}
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
          title={selectedAddressId ? "Select Device" : "All Devices"}
        >
          {/* Search Input */}
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search devices by Local ID, Position, Label, or Address..."
              prefix={<SearchOutlined />}
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ width: '100%' }}
            />
          </div>
          
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
                  title: 'Local ID',
                  dataIndex: 'localId',
                  key: 'localId',
                  render: (text, record) => text || record.serialNumber || '-',
                },
                {
                  title: 'Installation Position / Label',
                  key: 'position',
                  render: (_, record) => {
                    const position = record.installationPosition || record.deviceType || '-';
                    const label = record.accessControlName || record.label || '';
                    return position && label ? `${position} / ${label}` : position || label || '-';
                  },
                },
                {
                  title: 'Address',
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
                  title: 'Status',
                  key: 'status',
                  render: (_, record) => {
                    const isOnline = record.isOnline;
                    const isEnabled = record.isEnabled;
                    return (
                      <Space>
                        <Tag color={isOnline ? 'green' : 'red'}>
                          {isOnline ? 'Online' : 'Offline'}
                        </Tag>
                        <Tag color={isEnabled ? 'blue' : 'default'}>
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </Tag>
                      </Space>
                    );
                  },
                },
                {
                  title: 'Action',
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
                      Configure
                    </Button>
                  ),
                },
              ]}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              {searchTerm 
                ? `No devices found matching "${searchTerm}"`
                : 'No devices found'}
            </div>
          )}
        </Card>
      )}

      {/* Show message when no devices found */}
      {!selectedDeviceId && filteredDevices.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            {searchTerm 
              ? `No devices found matching "${searchTerm}"`
              : selectedAddressId 
                ? 'No devices found for the selected address'
                : 'No devices found'}
          </div>
        </Card>
      )}

      {/* Device Config Grid - Show only when a device is selected */}
      {selectedDeviceId && (() => {
        const selectedDevice = filteredDevices.find(d => (d.id || d._id) == selectedDeviceId) || 
                              devices.find(d => (d.id || d._id) == selectedDeviceId) ||
                              accessControlDevices.find(d => (d.id || d._id) == selectedDeviceId);
        
        if (!selectedDevice) {
          return <div>Device not found</div>;
        }

        return (
          <div>
            {/* Back Button */}
            <Button
              icon={<HomeOutlined />}
              onClick={handleBackToTable}
              style={{ marginBottom: 16 }}
            >
              Back to Device List
            </Button>
            
            {/* Device Info Card */}
            <Card 
              style={{ marginBottom: 24 }}
              styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
              title={`Device: ${selectedDevice.localId || selectedDevice.serialNumber || 'Unknown'}`}
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Local ID">
                    <Input 
                      disabled 
                      size="large" 
                      value={selectedDevice.localId || selectedDevice.serialNumber || '-'}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Installation Position">
                    <Input 
                      disabled 
                      size="large" 
                      value={selectedDevice.installationPosition || selectedDevice.deviceType || '-'}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Status">
                    <Space>
                      <Tag color={selectedDevice.isOnline ? 'green' : 'red'}>
                        {selectedDevice.isOnline ? 'Online' : 'Offline'}
                      </Tag>
                      <Tag color={selectedDevice.isEnabled ? 'blue' : 'default'}>
                        {selectedDevice.isEnabled ? 'Enabled' : 'Disabled'}
                      </Tag>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

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
                  loading={deviceActionLoading}
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
                  loading={deviceActionLoading}
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
                  loading={deviceActionLoading}
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
      })()}
    </div>
  );
};

export default DeviceConfig;
