import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Select, Button, Space, Spin, Radio, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses } from '../../store/slices/addressSlice';
import { fetchChips } from '../../store/slices/deviceSlice';

const { Option } = Select;
const { Text } = Typography;

const SelectAddressModal = ({ open, onCancel, onSubmit, user }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { items: addresses, loading } = useSelector((state) => state.addresses);
  const { chips, chipsLoading } = useSelector((state) => state.devices);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [subscriptionComplete, setSubscriptionComplete] = useState(null);
  const [assignChip, setAssignChip] = useState(null);

  const hasFetchedRef = useRef(false);
  const hasFetchedChipsRef = useRef(false);

  useEffect(() => {
    if (open) {
      // Only fetch addresses when modal opens, not on page load
      if (!hasFetchedRef.current) {
        dispatch(fetchAddresses());
        hasFetchedRef.current = true;
      }
      form.resetFields();
      setCurrentStep(1);
      setSelectedAddress(null);
      setSubscriptionComplete(null);
      setAssignChip(null);
    } else {
      // Reset the ref when modal closes so it can fetch fresh data next time
      hasFetchedRef.current = false;
      hasFetchedChipsRef.current = false;
    }
  }, [open, dispatch, form]);

  const handleAddressNext = async () => {
    try {
      const values = await form.validateFields(['addressId']);
      setSelectedAddress(values.addressId);
      setCurrentStep(2);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleSubscriptionChange = (e) => {
    const value = e.target.value;
    setSubscriptionComplete(value);
    form.setFieldsValue({ subscriptionComplete: value });
  };

  const handleSubscriptionNext = () => {
    // Fetch chips for the selected address when moving to step 3
    if (!hasFetchedChipsRef.current) {
      dispatch(fetchChips({ page: 1, limit: 100 }));
      hasFetchedChipsRef.current = true;
    }
    setCurrentStep(3);
  };

  const handleChipChange = (e) => {
    const value = e.target.value;
    setAssignChip(value);
    form.setFieldsValue({ assignChip: value });
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
      setAssignChip(null);
    } else {
      setCurrentStep(1);
      setSubscriptionComplete(null);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate chip selection
      if (assignChip === null) {
        message.error(t('pages.selectAddressModal.pleaseSelectChipOption'));
        return;
      }

      if (assignChip === 'yes') {
        const chipId = form.getFieldValue('chipId');
        if (!chipId) {
          message.error(t('pages.selectAddressModal.pleaseSelectChipToAssign'));
          return;
        }
      }
      
      setLoadingSubscription(true);
      
      // Prepare form values with subscription and chip info
      const formValues = {
        addressId: selectedAddress,
        hasSubscription: subscriptionComplete === 'yes',
        subscriptionId: subscriptionComplete === 'yes' ? 1 : null,
        assignChip: assignChip === 'yes',
        chipId: assignChip === 'yes' ? form.getFieldValue('chipId') : null,
      };
      
      await onSubmit(formValues);
      
      // Reset modal state after successful submission
      form.resetFields();
      setCurrentStep(1);
      setSelectedAddress(null);
      setSubscriptionComplete(null);
      setAssignChip(null);
    } catch (error) {
      console.error('Verification submission error:', error);
      message.error(t('pages.selectAddressModal.msgFailedVerify') + (error?.message || 'Unknown error'));
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(1);
    setSelectedAddress(null);
    setSubscriptionComplete(null);
    setAssignChip(null);
    onCancel();
  };

  const isNextDisabled = currentStep === 2 && subscriptionComplete === null;
  // Allow confirm if "No" is selected, or if "Yes" is selected and a chip is chosen
  const isConfirmDisabled = currentStep === 3 && assignChip === null;

  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '';
  const modalTitle = currentStep === 1 ? t('pages.selectAddressModal.titleSelectAddress') : currentStep === 2 ? t('pages.selectAddressModal.titleSubscription') : t('pages.selectAddressModal.titleAssignChip');

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        {currentStep === 1 && (
          <>
        <Form.Item
          label={t('pages.selectAddressModal.selectAddressFor', { name: userName })}
          name="addressId"
          rules={[{ required: true, message: t('pages.selectAddressModal.pleaseSelectAddress') }]}
        >
          <Select
            placeholder={t('pages.selectAddressModal.selectAddressPlaceholder')}
            loading={loading}
            showSearch
            filterOption={(input, option) =>
              String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={loading ? <Spin size="small" /> : t('pages.selectAddressModal.noAddressesFound')}
          >
            {addresses.map((address) => (
              <Option key={address.id || address._id} value={address.id || address._id}>
                {address.address || address.name || `Address ${address.id || address._id}`}
                {address.city && ` - ${address.city}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
                <Button type="primary" onClick={handleAddressNext}>
                  {t('pages.selectAddressModal.next')}
                </Button>
                <Button onClick={handleCancel}>
                  {t('common.cancel')}
                </Button>
              </Space>
            </Form.Item>
          </>
        )}

        {currentStep === 2 && (
          <>
            <Form.Item
              label={t('pages.selectAddressModal.subscriptionCompleteQuestion')}
              name="subscriptionComplete"
              rules={[{ required: true, message: t('pages.selectAddressModal.pleaseSelectOption') }]}
            >
              <Radio.Group 
                onChange={handleSubscriptionChange} 
                value={subscriptionComplete}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="yes">
                    <Text strong>{t('pages.userDetailsModal.yes')}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      {t('pages.selectAddressModal.yesCompleteSubscription')}
                    </Text>
                  </Radio>
                  <Radio value="no">
                    <Text strong>{t('pages.userDetailsModal.no')}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      {t('pages.selectAddressModal.noVerifyWithoutSubscription')}
                    </Text>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  onClick={handleSubscriptionNext} 
                  disabled={isNextDisabled}
                >
                  {t('pages.selectAddressModal.next')}
                </Button>
                <Button onClick={handleBack}>
                  {t('pages.selectAddressModal.back')}
                </Button>
                <Button onClick={handleCancel}>
                  {t('common.cancel')}
                </Button>
              </Space>
            </Form.Item>
          </>
        )}

        {currentStep === 3 && (
          <>
            <Form.Item
              label={t('pages.selectAddressModal.assignChipQuestion')}
              name="assignChip"
              rules={[{ required: true, message: t('pages.selectAddressModal.pleaseSelectOption') }]}
            >
              <Radio.Group 
                onChange={handleChipChange} 
                value={assignChip}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="yes">
                    <Text strong>{t('pages.userDetailsModal.yes')}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      {t('pages.selectAddressModal.yesAssignChip')}
                    </Text>
                  </Radio>
                  <Radio value="no">
                    <Text strong>{t('pages.userDetailsModal.no')}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      {t('pages.selectAddressModal.noSkipChip')}
                    </Text>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            {assignChip === 'yes' && (
              <Form.Item
                name="chipId"
                label={t('pages.selectAddressModal.selectChip')}
                rules={[{ required: true, message: t('pages.selectAddressModal.pleaseSelectChip') }]}
              >
                <Select
                  placeholder={t('pages.selectAddressModal.selectChipPlaceholder')}
                  loading={chipsLoading}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={chipsLoading ? <Spin size="small" /> : t('pages.selectAddressModal.noUnassignedChipsFound')}
                >
                  {chips?.filter(chip => 
                    (chip.chipStatus?.toLowerCase() === 'unassigned' || chip.chipStatus === 'unAssigned')
                  ).map((chip) => (
                    <Option key={chip.id || chip._id} value={chip.id || chip._id}>
                      {chip.serialNumber || `Chip ${chip.id || chip._id}`}
                      {chip.device?.localId && ` - Device: ${chip.device.localId}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  onClick={handleSubmit} 
                  loading={loadingSubscription}
                  disabled={isConfirmDisabled}
                >
                  {t('pages.selectAddressModal.confirmVerifyUser')}
                </Button>
                <Button onClick={handleBack} disabled={loadingSubscription}>
                  {t('pages.selectAddressModal.back')}
                </Button>
                <Button onClick={handleCancel} disabled={loadingSubscription}>
                  {t('common.cancel')}
                </Button>
              </Space>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default SelectAddressModal;

