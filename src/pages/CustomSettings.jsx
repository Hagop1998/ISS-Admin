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
  Select
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
  SaveOutlined
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
  const [deviceSettings, setDeviceSettings] = useState({});
  const [selectedAddressId, setSelectedAddressId] = useState(null);
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
          }
        });
      }
    }
  }, [deviceId, token, dispatch]);

  useEffect(() => {
    if (selectedAddressId) {
      updateDevicesForAddress(selectedAddressId);
    } else {
      setDevices([]);
    }
  }, [selectedAddressId, accessControlDevices]);

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
    setSelectedAddressId(value);
    setDevices([]);
    setDeviceSettings({});
    setTempValues({}); 
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
      
      // Build complete settings object with ALL enum values
      // Get all enum values from SetDoorTypeEnum
      const allEnumValues = Object.values(SetDoorTypeEnum);
      const completeSettings = {};
      
      // For each enum value, use existing value if available, otherwise use default
      allEnumValues.forEach(enumValue => {
        const enumKey = String(enumValue);
        if (allExistingSettings[enumKey] !== undefined) {
          // Convert existing value to proper type (boolean for switches, number for others)
          completeSettings[enumKey] = convertValueToProperType(enumValue, allExistingSettings[enumKey]);
        } else {
          // Use default value
          completeSettings[enumKey] = getDefaultValue(enumValue);
        }
      });
      
      // Now update the specific key being changed (convert to proper type)
      completeSettings[String(type)] = convertValueToProperType(type, value);
      
      // Debug: Log the settings object being sent
      console.log('Sending complete settings object:', completeSettings);
      console.log('All enum values:', allEnumValues);
      console.log('Type being updated:', type, 'Value:', value);
      console.log('Device ID:', actualDeviceId);
      console.log('Local ID:', localId);
      
      // Step 1: First send to set_door middleware endpoint with individual type/value
      // Note: set_door expects { localId, type, value } format
      // For set_door, switch types should be 0/1 (numbers), not boolean
      let setDoorValue = value;
      if (isSwitchType(type)) {
        // Convert boolean to 0/1 for set_door endpoint
        setDoorValue = value === true || value === 1 ? 1 : 0;
      } else {
        // For numeric types, ensure it's a number
        setDoorValue = typeof value === 'number' ? value : Number(value) || 0;
      }
      
      await dispatch(setDoor({
        localId,
        type,
        value: setDoorValue,
      })).unwrap();
      
      // Step 2: If set_door succeeds, then send PATCH to device/{id} with complete settings
      await dispatch(updateDevice({
        id: actualDeviceId,
        deviceData: {
          settings: completeSettings
        }
      })).unwrap();
      
      // Update local state with the complete settings
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
    // Pass boolean value directly
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

      {/* Address Selection Card */}
      {!deviceId && (
        <Card 
          style={{ marginBottom: 24 }}
          styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
          title="Select Address"
        >
          <Form.Item label="Select Address" style={{ marginBottom: 0 }}>
            <Select
              placeholder="Select an address to configure devices"
              size="large"
              value={selectedAddressId}
              onChange={handleAddressChange}
              style={{ width: '100%' }}
              loading={addressesLoading}
              showSearch
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
      )}

      {/* Devices Configuration for Selected Address */}
      {selectedAddressId && devices.length > 0 && devices.map((dev) => {
        const devId = dev.id || dev._id;
        const deviceData = deviceSettings[devId] || dev;
        const deviceName = deviceData.name || deviceData.accessControlName || deviceData.localId || deviceData.serialNumber || `Device ${devId}`;
        
        return (
          <div key={devId} style={{ marginBottom: 32 }}>
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
      })}

      {selectedAddressId && devices.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            No devices found for the selected address
          </div>
        </Card>
      )}

      {!selectedAddressId && !deviceId && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            Please select an address to configure devices
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomSettings;
