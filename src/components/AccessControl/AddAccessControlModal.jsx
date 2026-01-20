import React, { useEffect, useRef, useState } from 'react';
import { Modal, Form, Select, Button, Space, Input, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses } from '../../store/slices/accessControlSlice';
import { getDeviceById } from '../../store/slices/deviceSlice';

const { Option } = Select;
const { TextArea } = Input;

const AddAccessControlModal = ({ open, onCancel, onSubmit, deviceId = null, mode = 'add', deviceData = null }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { addresses, addressesLoading } = useSelector((state) => state.accessControl);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (open && !hasFetchedRef.current) {
      dispatch(fetchAddresses());
      hasFetchedRef.current = true;
    }
    if (!open) {
      hasFetchedRef.current = false;
      form.resetFields();
    }
  }, [open, dispatch, form]);

  useEffect(() => {
    if (open && mode === 'edit' && deviceId && !deviceData) {
      // Fetch device data if not provided
      setLoading(true);
      dispatch(getDeviceById(deviceId))
        .unwrap()
        .then((result) => {
          const device = result?.data || result?.device || result;
          form.setFieldsValue({
            community: device.addressId,
            localId: device.localId || device.serialNumber || '',
            sector: device.sector || 'Sector1',
            sectorPassword: device.sectorPassword || 'ABCDEF123456',
            deviceType: device.deviceType || 'door',
            settings: device.settings ? JSON.stringify(device.settings, null, 2) : '{}',
          });
          setLoading(false);
        })
        .catch((error) => {
          message.error(error.message || 'Failed to load device data');
          setLoading(false);
        });
    } else if (open && deviceData) {
      // Use provided device data
      form.setFieldsValue({
        community: deviceData.addressId,
        localId: deviceData.localId || deviceData.serialNumber || '',
        sector: deviceData.sector || 'Sector1',
        sectorPassword: deviceData.sectorPassword || 'ABCDEF123456',
        deviceType: deviceData.deviceType || 'door',
        settings: deviceData.settings ? JSON.stringify(deviceData.settings, null, 2) : '{}',
      });
    } else if (open && mode === 'add') {
      form.resetFields();
    }
  }, [open, deviceId, mode, deviceData, form, dispatch]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Parse settings if it's a string
      let settings = {};
      if (values.settings) {
        try {
          settings = typeof values.settings === 'string' ? JSON.parse(values.settings) : values.settings;
        } catch (e) {
          message.error('Invalid JSON format for settings');
          return;
        }
      }
      
      const formData = {
        ...values,
        settings,
      };
      
      onSubmit(formData);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Assign Device to Address"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {/* Community */}
        <Form.Item
          name="community"
          label="Community"
          rules={[{ required: true, message: 'Please select a community' }]}
        >
          <Select
            placeholder="Please Select A..."
            loading={addressesLoading}
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {addresses.map((address) => (
              <Option key={address.id || address._id} value={address.id || address._id}>
                {address.name || address.title || address.address || JSON.stringify(address)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Local ID */}
        <Form.Item
          name="localId"
          label="Local ID"
          rules={[{ required: true, message: 'Please enter local ID' }]}
        >
          <Input placeholder="Enter local ID (e.g., door001)" disabled />
        </Form.Item>

        {/* Sector */}
        <Form.Item
          name="sector"
          label="Sector"
          rules={[{ required: true, message: 'Please enter sector' }]}
        >
          <Input placeholder="Enter sector (e.g., Sector1)" />
        </Form.Item>

        {/* Sector Password */}
        <Form.Item
          name="sectorPassword"
          label="Sector Password"
          rules={[{ required: true, message: 'Please enter sector password' }]}
        >
          <Input.Password placeholder="Enter sector password" />
        </Form.Item>

        {/* Device Type */}
        <Form.Item
          name="deviceType"
          label="Device Type"
          rules={[{ required: true, message: 'Please select device type' }]}
        >
          <Select placeholder="Select device type">
            <Option value="door">Door</Option>
            <Option value="gate">Gate</Option>
            <Option value="building">Building</Option>
          </Select>
        </Form.Item>

        {/* Settings */}
        <Form.Item
          name="settings"
          label="Settings"
          help="Enter settings as JSON object"
        >
          <TextArea
            rows={4}
            placeholder='{"additionalProp1": "value"}'
          />
        </Form.Item>

        {/* Form Actions */}
        <Form.Item className="mb-0 mt-6">
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAccessControlModal;

