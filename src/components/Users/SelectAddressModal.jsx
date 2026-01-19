import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Button, Space, Spin, Radio, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses } from '../../store/slices/addressSlice';

const { Option } = Select;
const { Text } = Typography;

const SelectAddressModal = ({ open, onCancel, onSubmit, user }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { items: addresses, loading } = useSelector((state) => state.addresses);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [subscriptionComplete, setSubscriptionComplete] = useState(null);

  useEffect(() => {
    if (open) {
      dispatch(fetchAddresses());
      form.resetFields();
      setCurrentStep(1);
      setSelectedAddress(null);
      setSubscriptionComplete(null);
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

  const handleBack = () => {
    setCurrentStep(1);
    setSubscriptionComplete(null);
  };

  const handleSubmit = async () => {
    try {
      // Validate subscription selection
      if (subscriptionComplete === null) {
        message.error('Please select a subscription option');
        return;
      }
      
      setLoadingSubscription(true);
      
      // Prepare form values with subscription info
      const formValues = {
        addressId: selectedAddress,
        hasSubscription: subscriptionComplete === 'yes',
        subscriptionId: subscriptionComplete === 'yes' ? 1 : null,
      };
      
      await onSubmit(formValues);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(1);
    setSelectedAddress(null);
    setSubscriptionComplete(null);
    onCancel();
  };

  const isNextDisabled = currentStep === 2 && subscriptionComplete === null;

  return (
    <Modal
      title={
        currentStep === 1 
          ? "Select Address for User" 
          : "Subscription Complete"
      }
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
              label={`Select address for ${user?.firstName || ''} ${user?.lastName || ''}`}
              name="addressId"
              rules={[{ required: true, message: 'Please select an address' }]}
            >
              <Select
                placeholder="Select an address"
                loading={loading}
                showSearch
                filterOption={(input, option) =>
                  String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={loading ? <Spin size="small" /> : 'No addresses found'}
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
                  Next
                </Button>
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </>
        )}

        {currentStep === 2 && (
          <>
            <Form.Item
              label="Subscription Complete?"
              name="subscriptionComplete"
              rules={[{ required: true, message: 'Please select an option' }]}
            >
              <Radio.Group 
                onChange={handleSubscriptionChange} 
                value={subscriptionComplete}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="yes">
                    <Text strong>Yes</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      Complete subscription for this user
                    </Text>
                  </Radio>
                  <Radio value="no">
                    <Text strong>No</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      Verify user without subscription
                    </Text>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  onClick={handleSubmit} 
                  loading={loadingSubscription}
                  disabled={isNextDisabled}
                >
                  Confirm & Verify User
                </Button>
                <Button onClick={handleBack} disabled={loadingSubscription}>
                  Back
                </Button>
                <Button onClick={handleCancel} disabled={loadingSubscription}>
                  Cancel
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

