import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Typography, Space, Card, message } from 'antd';
import { LockOutlined, MailOutlined, LoginOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, resetError, resetMessage } from '../store/slices/authSlice';

const { Title, Text } = Typography;

const Login = () => {
  const { t } = useTranslation();
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
      messageApi.success(authMessage || t('pages.login.loggedInSuccess'));
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
            <Title level={2} style={{ marginBottom: 8 }}>{t('pages.login.welcomeBack')}</Title>
            <Text type="secondary">{t('pages.login.signInSubtitle')}</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{ remember: true }}
          >
            <Form.Item
              label={t('pages.login.email')}
              name="email"
              rules={[{ required: true, message: t('pages.login.emailRequired') }, { type: 'email', message: t('pages.login.emailInvalid') }]}
            >
              <Input
                size="large"
                prefix={<MailOutlined className="text-primary-600" />}
                placeholder={t('pages.login.emailPlaceholder')}
              />
            </Form.Item>

            <Form.Item
              label={t('pages.login.password')}
              name="password"
              rules={[{ required: true, message: t('pages.login.passwordRequired') }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-primary-600" />}
                placeholder={t('pages.login.passwordPlaceholder')}
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
              {t('pages.login.signIn')}
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
