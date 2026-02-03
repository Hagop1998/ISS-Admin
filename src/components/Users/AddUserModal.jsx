import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Button, Space } from 'antd';
import { useSelector } from 'react-redux';

const AddUserModal = ({ open, onCancel, onSubmit }) => {
  const { t } = useTranslation();
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
      title={t('pages.addUserModal.title')}
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
        <Form.Item
          name="firstName"
          label={t('pages.addUserModal.firstName')}
          rules={[
            { required: true, message: t('pages.addUserModal.pleaseEnterFirstName') },
            { max: 100, message: t('pages.addUserModal.max100Chars') },
          ]}
        >
          <Input placeholder={t('pages.addUserModal.enterFirstName')} />
        </Form.Item>

        <Form.Item
          name="lastName"
          label={t('pages.addUserModal.lastName')}
          rules={[
            { required: true, message: t('pages.addUserModal.pleaseEnterLastName') },
            { max: 100, message: t('pages.addUserModal.max100Chars') },
          ]}
        >
          <Input placeholder={t('pages.addUserModal.enterLastName')} />
        </Form.Item>

        <Form.Item
          name="email"
          label={t('pages.addUserModal.email')}
          rules={[
            { required: true, message: t('pages.addUserModal.pleaseEnterEmail') },
            { type: 'email', message: t('pages.addUserModal.pleaseEnterValidEmail') },
          ]}
        >
          <Input placeholder={t('pages.addUserModal.enterEmail')} type="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label={t('pages.addUserModal.password')}
          rules={[
            { required: true, message: t('pages.addUserModal.pleaseEnterPassword') },
            { min: 6, message: t('pages.addUserModal.passwordMin6') },
          ]}
        >
          <Input.Password placeholder={t('pages.addUserModal.enterPassword')} />
        </Form.Item>

        <Form.Item
          name="phone"
          label={t('pages.addUserModal.phone')}
          rules={[
            { required: true, message: t('pages.addUserModal.pleaseEnterPhone') },
          ]}
        >
          <Input placeholder={t('pages.addUserModal.enterPhone')} />
        </Form.Item>

        <Form.Item
          name="role"
          label={t('pages.addUserModal.role')}
          initialValue="admin"
        >
          <Input value="admin" disabled />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('pages.addUserModal.addUser')}
            </Button>
            <Button onClick={handleCancel} disabled={loading}>
              {t('common.cancel')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;

