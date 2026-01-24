import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import { useSelector } from 'react-redux';

const AddUserModal = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const { loading } = useSelector((state) => state.users);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

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
      title="Add User"
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
        initialValues={{ role: 'admin' }}
      >
        {/* First Name */}
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[
            { required: true, message: 'Please enter first name' },
            { max: 100, message: 'Maximum 100 characters' },
          ]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        {/* Last Name */}
        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[
            { required: true, message: 'Please enter last name' },
            { max: 100, message: 'Maximum 100 characters' },
          ]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="Enter email address" type="email" />
        </Form.Item>

        {/* Password */}
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        {/* Phone */}
        <Form.Item
          name="phone"
          label="Phone"
          rules={[
            { required: true, message: 'Please enter phone number' },
          ]}
        >
          <Input placeholder="Enter phone number (e.g., +1234567890)" />
        </Form.Item>

        {/* Role */}
        <Form.Item
          name="role"
          label="Role"
          initialValue="admin"
        >
          <Input value="admin" disabled />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add User
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

export default AddUserModal;

