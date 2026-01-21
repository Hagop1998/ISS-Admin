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
  InputNumber,
  Select,
  Table,
  Tag
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
  ClockCircleOutlined,
  SaveOutlined,
  SettingOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { setDoor, updateDevice, getDeviceById } from '../store/slices/deviceSlice';
import { fetchDevices, fetchAddresses } from '../store/slices/accessControlSlice';
import { SetDoorTypeEnum } from '../constants/enums';

const { Title } = Typography;
const { Option } = Select;

const CustomSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { deviceId } = useParams();
  const [form] = Form.useForm();
  const { loading } = useSelector((state) => state.devices);
  const { items: accessControlDevices, addresses, addressesLoading } = useSelector((state) => state.accessControl);
  const token = useSelector((state) => state.auth.token);
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [deviceSettings, setDeviceSettings] = useState({});
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempValues, setTempValues] = useState({}); // Store temporary values before saving

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      // Fetch addresses and devices
      dispatch(fetchAddresses());
      dispatch(fetchDevices({ page: 1, limit: 100 }));
      
      // If deviceId in URL, fetch device details and set address
      if (deviceId) {
        fetchDeviceDetails(deviceId).then((deviceData) => {
          if (deviceData?.addressId) {
            setSelectedAddressId(deviceData.addressId);
            updateDevicesForAddress(deviceData.addressId);
            setSelectedDeviceId(deviceId);
          }
        });
      }
    }
  }, [deviceId, token, dispatch]);

  useEffect(() => {
    // Show all devices by default, or filter by address if selected
    if (selectedAddressId) {
      updateDevicesForAddress(selectedAddressId);
    } else {
      // Show all devices when no address is selected
      const allDevices = accessControlDevices || [];
      setDevices(allDevices);
      // Initialize filtered devices
      if (!searchTerm.trim()) {
        setFilteredDevices(allDevices);
      }
    }
  }, [selectedAddressId, accessControlDevices]);

  // Filter devices based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDevices(devices);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = devices.filter((device) => {
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
  }, [searchTerm, devices, addresses]);

  const fetchDeviceDetails = async (id) => {
    try {
      const result = await dispatch(getDeviceById(id)).unwrap();
      const deviceData = result?.data || result?.device || result;
      return deviceData;
    } catch (error) {
      message.error(error || 'Failed to fetch device details');
      return null;
    }
  };

  const updateDevicesForAddress = (addressId) => {
    const filtered = accessControlDevices.filter((dev) => {
      const devAddressId = dev.addressId || dev.address?.id || dev.address?._id;
      return devAddressId == addressId;
    });
    setDevices(filtered);
    // Filtered devices will be updated by the search effect
    
    filtered.forEach((dev) => {
      const devId = dev.id || dev._id;
      if (devId && !deviceSettings[devId]) {
        fetchDeviceDetails(devId).then((deviceData) => {
          if (deviceData) {
            const settings = deviceData.settings || {};
            const normalizedSettings = {};
            Object.keys(settings).forEach(key => {
              normalizedSettings[String(key)] = settings[key];
            });
            
            setDeviceSettings(prev => ({
              ...prev,
              [devId]: {
                ...deviceData,
                settings: normalizedSettings
              }
            }));
          }
        });
      }
    });
  };

  const handleAddressChange = (value) => {
    setSelectedAddressId(value || null);
    setSelectedDeviceId(null); // Reset selected device when address changes
    setTempValues({}); 
    // Devices will be updated by useEffect
  };

  const handleDeviceSelect = (deviceId) => {
    setSelectedDeviceId(deviceId);
    // Fetch device details if not already loaded
    if (!deviceSettings[deviceId]) {
      fetchDeviceDetails(deviceId).then((deviceData) => {
        if (deviceData) {
          const settings = deviceData.settings || {};
          const normalizedSettings = {};
          Object.keys(settings).forEach(key => {
            normalizedSettings[String(key)] = settings[key];
          });
          
          setDeviceSettings(prev => ({
            ...prev,
            [deviceId]: {
              ...deviceData,
              settings: normalizedSettings
            }
          }));
        }
      });
    }
  };

  const handleBackToTable = () => {
    setSelectedDeviceId(null);
  };

  // Check if enum type is a switch type (returns boolean)
  const isSwitchType = (enumType) => {
    return enumType === SetDoorTypeEnum.LIVENESS_SWITCH ||
           enumType === SetDoorTypeEnum.CLOUD_INTERCOM_SWITCH ||
           enumType === SetDoorTypeEnum.QR_CODE_SWITCH ||
           enumType === SetDoorTypeEnum.AUTOMATIC_FACE_SWITCH ||
           enumType === SetDoorTypeEnum.CARD_SWIPE_FAILURE_VERIFICATION ||
           enumType === SetDoorTypeEnum.DIRECT_CALL_MOBILE ||
           enumType === SetDoorTypeEnum.UPLOAD_UNLOCK_RECORD_IMAGE;
  };

  // Default values for each enum type
  const getDefaultValue = (enumType) => {
    if (isSwitchType(enumType)) {
      return false; // boolean false
    } else if (enumType === SetDoorTypeEnum.LIVENESS_THRESHOLD ||
               enumType === SetDoorTypeEnum.FACE_RECOGNITION_THRESHOLD) {
      return 90;
    } else if (enumType === SetDoorTypeEnum.ADVERTISING_SLEEP_START) {
      return 0;
    } else if (enumType === SetDoorTypeEnum.ADVERTISING_SLEEP_END) {
      return 600;
    }
    return 0;
  };

  // Convert value to proper type based on enum type
  const convertValueToProperType = (enumType, value) => {
    if (isSwitchType(enumType)) {
      // Convert 0/1 to boolean, or keep boolean if already boolean
      if (typeof value === 'boolean') return value;
      return value === 1 || value === true;
    }
    // For numeric types, ensure it's a number
    return typeof value === 'number' ? value : Number(value) || 0;
  };

  const handleSave = async (deviceId, type, value) => {
    const device = devices.find(d => (d.id || d._id) === deviceId) || deviceSettings[deviceId];
    if (!device) {
      message.error('Device not found');
      return;
    }

    const localId = device.localId || device.serialNumber;
    if (!localId) {
      message.error('Device local ID is missing');
      return;
    }

    // Get the actual device ID (numeric ID, not localId)
    const actualDeviceId = device.id || device._id;
    if (!actualDeviceId) {
      message.error('Device ID is missing');
      return;
    }

    try {
      message.loading({ content: 'Saving configuration...', key: `save-${deviceId}-${type}` });
      
      // Get current settings from deviceSettings state
      const stateSettings = deviceSettings[deviceId]?.settings || {};
      
      // Also get original settings from device data (in case state is incomplete)
      const originalDevice = deviceSettings[deviceId] || device;
      const originalSettings = originalDevice.settings || {};
      
      // Merge both sources to get all existing settings
      const allExistingSettings = {};
      
      // First, add all settings from original device data
      Object.keys(originalSettings).forEach(key => {
        allExistingSettings[String(key)] = originalSettings[key];
      });
      
      // Then, add all settings from state (these might be more up-to-date)
      Object.keys(stateSettings).forEach(key => {
        allExistingSettings[String(key)] = stateSettings[key];
      });
      
  
      const allEnumValues = Object.values(SetDoorTypeEnum);
      const completeSettings = {};
      
      allEnumValues.forEach(enumValue => {
        const enumKey = String(enumValue);
        if (allExistingSettings[enumKey] !== undefined) {
          completeSettings[enumKey] = convertValueToProperType(enumValue, allExistingSettings[enumKey]);
        } else {
          completeSettings[enumKey] = getDefaultValue(enumValue);
        }
      });
      
      completeSettings[String(type)] = convertValueToProperType(type, value);
      
      console.log('Sending complete settings object:', completeSettings);
      console.log('All enum values:', allEnumValues);
      console.log('Type being updated:', type, 'Value:', value);
      console.log('Device ID:', actualDeviceId);
      console.log('Local ID:', localId);
  
      let setDoorValue = value;
      if (isSwitchType(type)) {
        setDoorValue = value === true || value === 1 ? 1 : 0;
      } else {
        setDoorValue = typeof value === 'number' ? value : Number(value) || 0;
      }
      
      await dispatch(setDoor({
        localId,
        type,
        value: setDoorValue,
      })).unwrap();
      
      await dispatch(updateDevice({
        id: actualDeviceId,
        deviceData: {
          settings: completeSettings
        }
      })).unwrap();
      
      setDeviceSettings(prev => ({
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          ...originalDevice,
          settings: completeSettings
        }
      }));
      message.success({ content: 'Configuration saved successfully', key: `save-${deviceId}-${type}` });
    } catch (error) {
      message.error({ content: error || 'Failed to save configuration', key: `save-${deviceId}-${type}` });
    }
  };

  const handleSwitchChange = (deviceId, type, value) => {
    handleSave(deviceId, type, value);
  };

  const handleThresholdChange = (deviceId, type, value) => {
    const numValue = parseInt(value) || 0;
    setTempValues(prev => ({
      ...prev,
      [`${deviceId}-${type}`]: numValue
    }));
  };

  const handleTimeChange = (deviceId, type, value) => {
    const numValue = parseInt(value) || 0;
    setTempValues(prev => ({
      ...prev,
      [`${deviceId}-${type}`]: numValue
    }));
  };

  const handleSaveThreshold = (deviceId, type) => {
    const key = `${deviceId}-${type}`;
    const value = tempValues[key];
    if (value !== undefined) {
      handleSave(deviceId, type, value);
      // Remove from temp values after saving
      setTempValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[key];
        return newTemp;
      });
    }
  };

  const handleSaveTime = (deviceId, type) => {
    const key = `${deviceId}-${type}`;
    const value = tempValues[key];
    if (value !== undefined) {
      handleSave(deviceId, type, value);
      // Remove from temp values after saving
      setTempValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[key];
        return newTemp;
      });
    }
  };

  const renderSwitchCard = (deviceId, title, icon, label, type, defaultValue = false) => {
    const deviceSetting = deviceSettings[deviceId];
    // Use string key to access settings (enum values are stored as string keys)
    const typeKey = String(type);
    const rawValue = deviceSetting?.settings?.[typeKey];
    // Convert boolean/0/1 to 0/1 for UI display
    const currentValue = rawValue !== undefined 
      ? (rawValue === true || rawValue === 1 ? 1 : 0)
      : (defaultValue ? 1 : 0);
    
    return (
      <Col xs={24} sm={12} lg={8} key={`${deviceId}-${type}`}>
        <Card
          className="h-full shadow-md hover:shadow-lg transition-shadow"
          styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {icon}
              <span style={{ fontWeight: 500 }}>{title}</span>
            </div>
            <Form.Item label={label} style={{ marginBottom: 0 }}>
              <Radio.Group
                value={currentValue}
                onChange={(e) => handleSwitchChange(deviceId, type, e.target.value === 1)}
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

  const renderThresholdCard = (deviceId, title, icon, label, type, defaultValue = 90, min = 0, max = 100) => {
    const deviceSetting = deviceSettings[deviceId];
    const tempKey = `${deviceId}-${type}`;
    const tempValue = tempValues[tempKey];
    // Use string key to access settings (enum values are stored as string keys)
    const typeKey = String(type);
    const savedValue = deviceSetting?.settings?.[typeKey];
    const baseValue = savedValue !== undefined ? savedValue : defaultValue;
    const currentValue = tempValue !== undefined ? tempValue : baseValue;
    const hasChanges = tempValue !== undefined && tempValue !== baseValue;
    
    return (
      <Col xs={24} sm={12} lg={12} key={`${deviceId}-${type}`}>
        <Card
          className="h-full shadow-md hover:shadow-lg transition-shadow"
          styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {icon}
              <span style={{ fontWeight: 500 }}>{title}</span>
            </div>
            <Form.Item label={label} style={{ marginBottom: 0 }}>
              <Space.Compact style={{ width: '100%' }}>
                <InputNumber
                  value={currentValue}
                  min={min}
                  max={max}
                  onChange={(value) => handleThresholdChange(deviceId, type, value)}
                  style={{ flex: 1 }}
                  size="large"
                />
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => handleSaveThreshold(deviceId, type)}
                  disabled={!hasChanges}
                  size="large"
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056', color: 'white' }}
                >
                  Save
                </Button>
              </Space.Compact>
            </Form.Item>
          </Space>
        </Card>
      </Col>
    );
  };

  const renderTimeCard = (deviceId, title, icon, label, type, defaultValue = 0) => {
    const deviceSetting = deviceSettings[deviceId];
    const tempKey = `${deviceId}-${type}`;
    const tempValue = tempValues[tempKey];
    // Use string key to access settings (enum values are stored as string keys)
    const typeKey = String(type);
    const savedValue = deviceSetting?.settings?.[typeKey];
    const baseValue = savedValue !== undefined ? savedValue : defaultValue;
    const currentValue = tempValue !== undefined ? tempValue : baseValue;
    const hasChanges = tempValue !== undefined && tempValue !== baseValue;
    
    return (
      <Col xs={24} sm={12} lg={12} key={`${deviceId}-${type}`}>
        <Card
          className="h-full shadow-md hover:shadow-lg transition-shadow"
          styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {icon}
              <span style={{ fontWeight: 500 }}>{title}</span>
            </div>
            <Form.Item label={label} style={{ marginBottom: 0 }}>
              <Space.Compact style={{ width: '100%' }}>
                <InputNumber
                  value={currentValue}
                  min={0}
                  onChange={(value) => handleTimeChange(deviceId, type, value)}
                  style={{ flex: 1 }}
                  size="large"
                />
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => handleSaveTime(deviceId, type)}
                  disabled={!hasChanges}
                  size="large"
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' , color: 'white'}}
                >
                  Save
                </Button>
              </Space.Compact>
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
            title: 'Device Control',
          },
          {
            title: 'Custom Settings',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600, color: '#3C0056' }}>
          Custom Settings
        </Title>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/access-control/list')}
        >
          Back to List
        </Button>
      </div>

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

      {/* Devices Table - Show only when no address is selected and no device is selected */}
      {!selectedAddressId && !selectedDeviceId && (
        <Card 
          style={{ marginBottom: 24 }}
          styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
          title="All Devices"
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
                    // If address is just an ID, try to find it in addresses list
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

      {/* Show message when address is selected but no devices */}
      {selectedAddressId && !selectedDeviceId && devices.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            No devices found for the selected address
          </div>
        </Card>
      )}

      {/* Device Configuration - Show when address is selected OR when a device is selected */}
      {(selectedAddressId || selectedDeviceId) && (() => {
        // If address is selected, show all devices for that address
        // If specific device is selected, show only that device
        const devicesToShow = selectedDeviceId 
          ? [devices.find(d => (d.id || d._id) == selectedDeviceId) || deviceSettings[selectedDeviceId]].filter(Boolean)
          : devices;
        
        if (devicesToShow.length === 0) {
          return <div>Loading device details...</div>;
        }
        
        return devicesToShow.map((dev) => {
          const devId = dev.id || dev._id;
          if (!devId) return null;
          
          const deviceData = deviceSettings[devId] || dev;
          const deviceName = deviceData.name || deviceData.accessControlName || deviceData.localId || deviceData.serialNumber || `Device ${devId}`;
          
          // Fetch device details if not already loaded
          if (!deviceSettings[devId]) {
            fetchDeviceDetails(devId).then((deviceData) => {
              if (deviceData) {
                const settings = deviceData.settings || {};
                const normalizedSettings = {};
                Object.keys(settings).forEach(key => {
                  normalizedSettings[String(key)] = settings[key];
                });
                
                setDeviceSettings(prev => ({
                  ...prev,
                  [devId]: {
                    ...deviceData,
                    settings: normalizedSettings
                  }
                }));
              }
            });
          }
          
          return (
            <div key={devId} style={{ marginBottom: 32 }}>
              {/* Back Button - Only show when specific device is selected from table */}
              {selectedDeviceId && !selectedAddressId && (
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToTable}
                  style={{ marginBottom: 16 }}
                >
                  Back to Device List
                </Button>
              )}
              {/* Device Information Card */}
            <Card 
              style={{ marginBottom: 24 }}
              styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
              title={`Device: ${deviceName}`}
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Installation Position">
                    <Input 
                      disabled 
                      size="large" 
                      value={deviceData.installationPosition || deviceData.deviceType || '-'}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Access Control Name">
                    <Input 
                      disabled 
                      size="large" 
                      value={deviceData.accessControlName || deviceData.localId || '-'}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="LocalId">
                    <Input 
                      disabled 
                      size="large" 
                      value={deviceData.localId || deviceData.serialNumber || '-'}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Switch Settings Section */}
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ marginBottom: 16, color: '#3C0056' }}>
                Switch Settings
              </Title>
              <Row gutter={[16, 16]}>
                {renderSwitchCard(
                  devId,
                  'Liveness Detection',
                  <PoweroffOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
                  'Living Switch',
                  SetDoorTypeEnum.LIVENESS_SWITCH
                )}
                {renderSwitchCard(
                  devId,
                  'Cloud Intercom',
                  <CloudOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
                  'Cloud Intercom Switch',
                  SetDoorTypeEnum.CLOUD_INTERCOM_SWITCH
                )}
                {renderSwitchCard(
                  devId,
                  'QR Code',
                  <QrcodeOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
                  'Qr Code Lock Switch',
                  SetDoorTypeEnum.QR_CODE_SWITCH
                )}
                {renderSwitchCard(
                  devId,
                  'Face Recognition',
                  <EyeOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
                  'Automatic Face Recognition Switch',
                  SetDoorTypeEnum.AUTOMATIC_FACE_SWITCH
                )}
                {renderSwitchCard(
                  devId,
                  'Card Verification',
                  <CreditCardOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
                  'Credit Card Check Switch Failure',
                  SetDoorTypeEnum.CARD_SWIPE_FAILURE_VERIFICATION
                )}
                {renderSwitchCard(
                  devId,
                  'Direct Call',
                  <PhoneOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
                  'Call Phone Switch Directly',
                  SetDoorTypeEnum.DIRECT_CALL_MOBILE
                )}
                {renderSwitchCard(
                  devId,
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
                  devId,
                  'Liveness Threshold',
                  <SlidersOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
                  'Living Threshold',
                  SetDoorTypeEnum.LIVENESS_THRESHOLD,
                  90
                )}
                {renderThresholdCard(
                  devId,
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
                  devId,
                  'Advertising Sleep Start',
                  <ClockCircleOutlined style={{ color: '#3C0056', fontSize: 18 }} />,
                  'Advertising Dormancy Start Time',
                  SetDoorTypeEnum.ADVERTISING_SLEEP_START,
                  0
                )}
                {renderTimeCard(
                  devId,
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
        });
      })()}

    </div>
  );
};

export default CustomSettings;
