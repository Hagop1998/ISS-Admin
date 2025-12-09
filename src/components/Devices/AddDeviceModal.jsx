import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Space, message, Select } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAddresses } from '../../store/slices/addressSlice';
import { deviceService } from '../../services/deviceService';

const { Option } = Select;

const AddDeviceModal = ({ open, onCancel, onSubmit, mode = 'add', initialValues = null }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.devices);
  const { items: addresses } = useSelector((state) => state.addresses);
  const [loadingDevice, setLoadingDevice] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchAddresses());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    if (mode === 'edit' && initialValues) {
      setLoadingDevice(true);
      const deviceId = initialValues.id || initialValues._id;
      
      if (deviceId) {
        deviceService.getDeviceById(deviceId)
          .then((device) => {
            form.setFieldsValue({
              addressId: device.addressId || device.address?.id,
              localId: device.localId || '',
              deviceType: device.deviceType || 'door',
              sector: device.sector || '',
              sectorPassword: device.sectorPassword || '',
              isEnabled: device.isEnabled !== undefined ? device.isEnabled : true,
            });
            setLoadingDevice(false);
          })
          .catch((error) => {
            console.error('Error loading device:', error);
            message.error('Failed to load device data');
            setLoadingDevice(false);
            onCancel();
          });
      } else {
        // If no deviceId, use initialValues directly
        form.setFieldsValue({
          addressId: initialValues.addressId || initialValues.address?.id,
          localId: initialValues.localId || '',
          deviceType: initialValues.deviceType || 'door',
          sector: initialValues.sector || '',
          sectorPassword: initialValues.sectorPassword || '',
          isEnabled: initialValues.isEnabled !== undefined ? initialValues.isEnabled : true,
        });
        setLoadingDevice(false);
      }
    } else {
      form.resetFields();
      setLoadingDevice(false);
    }
  }, [open, form, mode, initialValues, onCancel]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
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
      title={mode === 'add' ? 'Add Device' : 'Edit Device'}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {/* Address Selection */}
        <Form.Item
          name="addressId"
          label="Address"
          rules={[{ required: true, message: 'Please select an address' }]}
        >
          <Select
            placeholder="Select an address"
            loading={loadingDevice}
            showSearch
            filterOption={(input, option) =>
              String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {addresses.map((address) => (
              <Option key={address.id || address._id} value={address.id || address._id}>
                {address.address || address.name || `Address ${address.id}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Local ID / Serial Number */}
        <Form.Item
          name="localId"
          label="Local ID / Serial Number"
          rules={[
            { required: true, message: 'Please enter local ID' },
            { max: 50, message: 'Maximum 50 characters' },
          ]}
        >
          <Input placeholder="Enter local ID or serial number" />
        </Form.Item>

        {/* Device Type */}
        <Form.Item
          name="deviceType"
          label="Device Type"
          rules={[{ required: true, message: 'Please select device type' }]}
          initialValue="door"
        >
          <Select placeholder="Select device type">
            <Option value="door">Door</Option>
            <Option value="gate">Gate</Option>
            <Option value="building">Building</Option>
            <Option value="intercom">Intercom</Option>
          </Select>
        </Form.Item>

        {/* Sector */}
        <Form.Item
          name="sector"
          label="Sector"
          rules={[
            { required: true, message: 'Please enter sector' },
            { max: 50, message: 'Maximum 50 characters' },
          ]}
        >
          <Input placeholder="Enter sector name" />
        </Form.Item>

        {/* Sector Password */}
        <Form.Item
          name="sectorPassword"
          label="Sector Password"
          rules={[
            { required: true, message: 'Please enter sector password' },
            { max: 50, message: 'Maximum 50 characters' },
          ]}
        >
          <Input.Password placeholder="Enter sector password" />
        </Form.Item>

        {/* Is Enabled */}
        <Form.Item
          name="isEnabled"
          label="Status"
          initialValue={true}
        >
          <Select>
            <Option value={true}>Enabled</Option>
            <Option value={false}>Disabled</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading || loadingDevice}>
              {mode === 'add' ? 'Add' : 'Save'}
            </Button>
            <Button onClick={handleCancel} disabled={loading || loadingDevice}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDeviceModal;

