import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import { useSelector } from 'react-redux';

const { TextArea } = Input;

const AddAddressModal = ({ open, onCancel, onSubmit, mode = 'add', initialValues = null }) => {
  const [form] = Form.useForm();
  const { loading } = useSelector((state) => state.addresses);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

      if (mode === 'edit' && initialValues) {
        // Use setTimeout to ensure form is mounted before setting values
        setTimeout(() => {
          form.setFieldsValue({
            address: initialValues.address || '',
            city: initialValues.city || '',
          });
        }, 0);
      } else {
        form.resetFields();
      }
  }, [open, form, mode, initialValues]);

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
      title={mode === 'add' ? 'Add Address' : 'Edit Address'}
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
        {/* Address */}
        <Form.Item
          name="address"
          label="Address"
          rules={[
            { required: true, message: 'Please enter address' },
            { max: 200, message: 'Maximum 200 characters' },
          ]}
        >
          <TextArea rows={3} placeholder="Enter full address" />
        </Form.Item>

        {/* City */}
        <Form.Item
          name="city"
          label="City"
          rules={[
            { required: true, message: 'Please enter city' },
            { max: 100, message: 'Maximum 100 characters' },
          ]}
        >
          <Input placeholder="Enter city name" />
        </Form.Item>


        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {mode === 'add' ? 'Add' : 'Save'}
            </Button>
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAddressModal;

