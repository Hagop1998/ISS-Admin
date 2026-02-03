import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Typography,
  Breadcrumb,
  message,
  Space,
  Select,
} from 'antd';
import { HomeOutlined, SaveOutlined } from '@ant-design/icons';
import { subscriptionService } from '../services/subscriptionService';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PLAN_KEYS = ['Basic', 'Basic + Camera', 'Basic + Barrier', 'Basic + Camera + Barrier', 'Family & Friends'];

const CreateSubscriptionPlan = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (user?.role !== 'superAdmin') {
      message.error(t('pages.createSubscription.msgAccessDenied'));
      navigate('/access-control/list', { replace: true });
    }
  }, [token, user, navigate]);

  const presets = subscriptionService.getPlanPresets();

  const handlePlanSelect = (planKey) => {
    if (!planKey) return;
    const preset = presets[planKey];
    if (preset) {
      form.setFieldsValue({
        name: preset.name,
        description: preset.description,
        price: preset.price,
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = {
        name: values.name?.trim() || '',
        description: values.description?.trim() || '',
        price: Number(values.price),
      };
      await subscriptionService.createSubscriptionPlan(payload);
      message.success(t('pages.createPlan.msgCreated'));
      form.resetFields();
    } catch (error) {
      message.error(error?.message || t('pages.createPlan.msgFailedCreate'));
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'superAdmin') {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 w-full max-w-full overflow-x-hidden">
      <Breadcrumb
        items={[
          { href: '/', title: <HomeOutlined /> },
          { title: t('pages.createPlan.breadcrumbMgt') },
          { title: t('pages.createPlan.breadcrumbCreate') },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="mb-6">
        <Title level={2} style={{ margin: 0 }}>
          {t('pages.createPlan.title')}
        </Title>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          {t('pages.createPlan.planDetails')}
        </Typography.Text>
      </div>

      <Card className="w-full">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ planPreset: undefined, price: 0 }}
        >
          <Form.Item
            name="planPreset"
            label={t('pages.createPlan.quickSelect')}
            help={t('pages.createPlan.planDetails')}
          >
            <Select
              placeholder={t('pages.createPlan.quickSelect')}
              allowClear
              onChange={handlePlanSelect}
            >
              {PLAN_KEYS.map((key) => (
                <Option key={key} value={key}>
                  {key} – {presets[key]?.price ?? 0} AMD
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label={t('pages.createPlan.planName')}
            rules={[{ required: true, message: t('pages.createPlan.planName') }, { max: 100 }]}
          >
            <Input placeholder="e.g. Basic, Premium, Max" />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('pages.createPlan.description')}
            rules={[{ required: true, message: t('pages.createPlan.description') }]}
          >
            <TextArea
              rows={4}
              placeholder="e.g. Premium plan - 800 AMD"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label={t('pages.createPlan.price')}
            rules={[{ required: true, message: t('pages.createPlan.price') }]}
          >
            <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="e.g. 800 or 0" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                {t('pages.createPlan.submit')}
              </Button>
              <Button onClick={() => form.resetFields()}>{t('common.reset')}</Button>
              <Button onClick={() => navigate(-1)}>{t('common.cancel')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateSubscriptionPlan;
