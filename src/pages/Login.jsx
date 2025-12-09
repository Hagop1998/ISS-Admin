import React, { useEffect } from 'react';
import { Form, Input, Button, Typography, Space, Card, message } from 'antd';
import { LockOutlined, MailOutlined, LoginOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, resetError, resetMessage } from '../store/slices/authSlice';

const { Title, Text } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error, token, message: authMessage } = useSelector((state) => state.auth);

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (error) {
      messageApi.error(error);
      dispatch(resetError());
    }
  }, [error, dispatch, messageApi]);

  useEffect(() => {
    if (status === 'succeeded' && token) {
      const redirectPath = location.state?.from?.pathname || '/access-control/list';
      navigate(redirectPath, { replace: true });
      messageApi.success(authMessage || 'Logged in successfully');
      dispatch(resetMessage());
    }
  }, [status, token, navigate, location.state, messageApi, authMessage, dispatch]);

  const handleSubmit = (values) => {
    dispatch(login(values));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      {contextHolder}
      <Card className="w-full max-w-md shadow-xl">
        <Space direction="vertical" size="large" className="w-full">
          <div className="text-center">
            <Title level={2} style={{ marginBottom: 8 }}>Welcome Back</Title>
            <Text type="secondary">Sign in to continue to ISS Admin Dashboard</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{ remember: true }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input
                size="large"
                prefix={<MailOutlined className="text-primary-600" />}
                placeholder="john@example.com"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-primary-600" />}
                placeholder="StrongPassword123"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              icon={<LoginOutlined />}
              loading={status === 'loading'}
            >
              Log In
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
