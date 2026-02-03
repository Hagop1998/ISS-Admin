import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Select, Button, Space, Input, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses } from '../../store/slices/accessControlSlice';
import { getDeviceById } from '../../store/slices/deviceSlice';

const { Option } = Select;
const { TextArea } = Input;

const AddAccessControlModal = ({ open, onCancel, onSubmit, deviceId = null, mode = 'add', deviceData = null }) => {
  const { t } = useTranslation();
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
          message.error(error.message || t('pages.addAccessControlModal.msgFailedLoadDevice'));
          setLoading(false);
        });
    } else if (open && deviceData) {
      // Use provided device data
      let settingsValue = '{}';
      if (deviceData.settings) {
        if (typeof deviceData.settings === 'string') {
          // If it's already a string, try to parse and re-stringify to validate
          try {
            const parsed = JSON.parse(deviceData.settings);
            settingsValue = JSON.stringify(parsed, null, 2);
          } catch (e) {
            // If parsing fails, use empty object
            settingsValue = '{}';
          }
        } else if (typeof deviceData.settings === 'object') {
          // If it's an object, stringify it
          settingsValue = JSON.stringify(deviceData.settings, null, 2);
        }
      }
      
      form.setFieldsValue({
        community: deviceData.addressId || deviceData.address?.id || deviceData.address?._id,
        localId: deviceData.localId || deviceData.serialNumber || '',
        sector: deviceData.sector || 'Sector1',
        sectorPassword: deviceData.sectorPassword || 'ABCDEF123456',
        deviceType: deviceData.deviceType || 'door',
        settings: settingsValue,
      });
    } else if (open && mode === 'add') {
      form.resetFields();
    }
  }, [open, deviceId, mode, deviceData, form, dispatch]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Parse settings if it's a string, otherwise use empty object
      let settings = {};
      if (values.settings) {
        if (typeof values.settings === 'string') {
          // Remove any whitespace
          const trimmed = values.settings.trim();
          if (trimmed) {
            try {
              settings = JSON.parse(trimmed);
            } catch (e) {
              message.error(t('pages.addAccessControlModal.invalidJson'));
              return;
            }
          }
        } else if (typeof values.settings === 'object' && values.settings !== null) {
          settings = values.settings;
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
      if (error.errorFields) {
        return;
      }
      message.error(t('pages.addAccessControlModal.pleaseCheckForm'));
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const modalTitle = mode === 'edit' ? t('pages.addAccessControlModal.titleEdit') : t('pages.addAccessControlModal.titleAdd');

  return (
    <Modal
      title={modalTitle}
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
        <Form.Item
          name="community"
          label={t('pages.addAccessControlModal.community')}
          rules={[{ required: true, message: t('pages.addAccessControlModal.communityPlaceholder') }]}
        >
          <Select
            placeholder={t('pages.addAccessControlModal.communityPlaceholder')}
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

        <Form.Item
          name="localId"
          label={t('pages.addAccessControlModal.localId')}
          rules={[{ required: true, message: t('pages.addAccessControlModal.localIdPlaceholder') }]}
        >
          <Input placeholder={t('pages.addAccessControlModal.localIdPlaceholder')} disabled />
        </Form.Item>

        <Form.Item
          name="sector"
          label={t('pages.addAccessControlModal.sector')}
          rules={[{ required: true }]}
        >
          <Input placeholder={t('pages.addAccessControlModal.sector')} />
        </Form.Item>

        <Form.Item
          name="sectorPassword"
          label={t('pages.addAccessControlModal.sectorPassword')}
          rules={[{ required: true }]}
        >
          <Input.Password placeholder={t('pages.addAccessControlModal.sectorPassword')} />
        </Form.Item>

        <Form.Item
          name="deviceType"
          label={t('pages.addAccessControlModal.deviceType')}
          rules={[{ required: true }]}
        >
          <Select placeholder={t('pages.addAccessControlModal.deviceTypePlaceholder')}>
            <Option value="door">Door</Option>
            <Option value="gate">Gate</Option>
            <Option value="building">Building</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="settings"
          label={t('pages.addAccessControlModal.settings')}
          help={t('pages.addAccessControlModal.settings')}
          rules={[
            {
              validator: (_, value) => {
                if (!value || value.trim() === '') {
                  return Promise.resolve();
                }
                try {
                  JSON.parse(value);
                  return Promise.resolve();
                } catch (e) {
                  return Promise.reject(new Error(t('pages.addAccessControlModal.invalidJson')));
                }
              },
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder={t('pages.addAccessControlModal.settingsPlaceholder')}
          />
        </Form.Item>

        <Form.Item className="mb-0 mt-6">
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              {t('pages.addAccessControlModal.cancel')}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('pages.addAccessControlModal.submit')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAccessControlModal;

