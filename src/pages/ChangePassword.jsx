import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Typography, Breadcrumb, Form, Input, Button, Space, message } from 'antd';
import { HomeOutlined, SwapOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import Captcha from '../components/Common/Captcha';

const { Title } = Typography;

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    } else {
      // Set login user name from user data
      if (user?.email) {
        form.setFieldsValue({ loginUserName: user.email });
      }
      // Generate initial captcha
      setCaptchaValue(generateCaptcha());
    }
  }, [token, navigate, user, form]);

  const handleRefreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaValue(newCaptcha);
    setCaptchaInput('');
    form.setFieldsValue({ verificationCode: '' });
  };

  const handleSubmit = async (values) => {
    // Validate captcha
    if (captchaInput.toLowerCase() !== captchaValue.toLowerCase()) {
      message.error('Verification code is incorrect. Please try again.');
      handleRefreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const payload = {
        oldPassword: values.originalPassword,
        newPassword: values.newPassword,
        newPasswordConfirm: values.confirmNewPassword,
      };

      await userService.changePassword(payload);
      message.success('Password changed successfully');
      form.resetFields();
      setCaptchaInput('');
      handleRefreshCaptcha();
    } catch (error) {
      message.error(error.message || 'Failed to change password');
      handleRefreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCaptchaInput('');
    handleRefreshCaptcha();
  };

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            title: 'User Settings',
          },
          {
            title: 'Change Password',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <SwapOutlined className="text-red-500 text-2xl" />
          <Title level={2} style={{ margin: 0, color: '#ff4d4f' }}>
            Change Password
          </Title>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Login User Name"
            name="loginUserName"
            rules={[{ required: true, message: 'Please enter login user name' }]}
          >
            <Input disabled size="large" />
          </Form.Item>

          <Form.Item
            label="Original Password"
            name="originalPassword"
            rules={[
              { required: true, message: 'Please enter your original password' },
            ]}
          >
            <Input.Password size="large" placeholder="Enter original password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password size="large" placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmNewPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item
            label="Verification Code"
            name="verificationCode"
            rules={[
              { required: true, message: 'Please enter verification code' },
            ]}
          >
            <div className="space-y-2">
              <Captcha
                value={captchaValue}
                onRefresh={handleRefreshCaptcha}
                width={120}
                height={40}
              />
              <Input
                size="large"
                placeholder="Enter verification code"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  form.setFieldsValue({ verificationCode: e.target.value });
                }}
              />
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                Submit
              </Button>
              <Button size="large" onClick={handleCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ChangePassword;

