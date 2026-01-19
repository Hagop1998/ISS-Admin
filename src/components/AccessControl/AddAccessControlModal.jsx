import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, Input, Select, Checkbox, Button, Space, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses } from '../../store/slices/accessControlSlice';
import { getDeviceById } from '../../store/slices/deviceSlice';

const { Option } = Select;
const { TextArea } = Input;

const AddAccessControlModal = ({ open, onCancel, onSubmit, deviceId = null, mode = 'add' }) => {
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
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && deviceId) {
        // Fetch device data for editing
        setLoading(true);
        dispatch(getDeviceById(deviceId))
          .unwrap()
          .then((device) => {
            // Map API response to form fields
            form.setFieldsValue({
              community: device.addressId,
              deviceName: device.deviceName || device.localId,
              serialNumber: device.localId,
              digitalIntercomTerminal: device.digitalIntercomTerminal || false,
              accessControlAddress: device.accessControlAddress,
              permissionValues: device.permissionValues || device.sectorPassword,
              deviceType: device.deviceType,
              sector: device.sector,
              sectorPassword: device.sectorPassword,
              description: device.description,
              ladderControlCoding: device.ladderControlCoding,
              ladderControlStartingFloors: device.ladderControlStartingFloors,
              supportDoorWay: device.supportDoorWay || [],
            });
            setLoading(false);
          })
          .catch((error) => {
            message.error(error.message || 'Failed to load device data');
            setLoading(false);
            onCancel();
          });
      } else {
        form.resetFields();
        setLoading(false);
      }
    }
  }, [open, deviceId, mode, form, onCancel]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
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
      title={mode === 'edit' ? 'Assign Device to Address' : 'Add Access Control'}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
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

        {/* Device Name */}
        <Form.Item
          name="deviceName"
          label="Device Name"
          rules={[
            { required: true, message: 'Please enter device name' },
            { max: 16, message: 'Most Input 16 Words' },
          ]}
          help="Most Input 16 Words"
        >
          <Input placeholder="Enter device name" />
        </Form.Item>

        {/* Serial Number */}
        <Form.Item
          name="serialNumber"
          label="Serial Number"
          rules={[
            { required: true, message: 'Please enter serial number' },
            { len: 16, message: 'Please enter the 16 equipment serial number' },
          ]}
          help="Please enter the 16 equipment serial number"
        >
          <div>
            <Form.Item name="digitalIntercomTerminal" valuePropName="checked" noStyle>
              <Checkbox style={{ marginBottom: 8 }}>Digital Intercom Terminal</Checkbox>
            </Form.Item>
            <Input
              placeholder="Enter 16-digit serial number"
              maxLength={16}
            />
          </div>
        </Form.Item>

        {/* Access Control Address */}
        <Form.Item
          name="accessControlAddress"
          label="Access Control Address"
          help="13 Device Address"
        >
          <Input placeholder="Enter access control address" maxLength={13} />
        </Form.Item>

        {/* Permission Values */}
        <Form.Item
          name="permissionValues"
          label="Permission Values"
          rules={[
            { required: true, message: 'Please enter permission values' },
            {
              type: 'number',
              min: 1,
              max: 320,
              message: 'Permission Values Range 1-320',
              transform: (value) => Number(value),
            },
          ]}
          help="Permission Values Range 1-320"
        >
          <Input
            type="number"
            placeholder="Enter permission values (1-320)"
            min={1}
            max={320}
            style={{ width: '100%' }}
          />
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
          </Select>
        </Form.Item>

        {/* Sector */}
        <Form.Item
          name="sector"
          label="Sector"
          rules={[{ required: true, message: 'Please enter sector' }]}
          initialValue="Sector1"
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

        {/* Entrance Guard Machine Description */}
        <Form.Item
          name="description"
          label="Entrance Guard Machine Description"
          help="Most Input 50 Words"
        >
          <TextArea
            rows={4}
            placeholder="Enter description"
            maxLength={50}
            showCount
          />
        </Form.Item>

        {/* Ladder Control Coding */}
        <Form.Item
          name="ladderControlCoding"
          label="Ladder Control Coding"
          help="Multiple Use [,] Space"
        >
          <Input placeholder="Enter ladder control coding (use comma or space)" />
        </Form.Item>

        {/* Ladder Control Starting Floors */}
        <Form.Item
          name="ladderControlStartingFloors"
          label="Ladder Control Starting Floors"
        >
          <Input placeholder="Enter starting floors" />
        </Form.Item>

        {/* Support the Door Way */}
        <Form.Item
          name="supportDoorWay"
          label="Support the Door Way"
          rules={[{ required: true, message: 'Please select at least one option' }]}
        >
          <Checkbox.Group>
            <Space direction="vertical">
              <Checkbox value="remote">Remote</Checkbox>
              <Checkbox value="authorizationCode">Authorization Code</Checkbox>
              <Checkbox value="bluetooth">Bluetooth</Checkbox>
              <Checkbox value="faceScan">Face Scan</Checkbox>
            </Space>
          </Checkbox.Group>
        </Form.Item>

        {/* Form Actions */}
        <Form.Item className="mb-0 mt-6">
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAccessControlModal;

