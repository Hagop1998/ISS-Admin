import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, Select, Button, Space, Spin, Radio, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses } from '../../store/slices/addressSlice';
import { fetchChips } from '../../store/slices/deviceSlice';

const { Option } = Select;
const { Text } = Typography;

const SelectAddressModal = ({ open, onCancel, onSubmit, user }) => {
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
        message.error('Please select a chip assignment option');
        return;
      }

      // If "Yes" is selected, validate chip selection
      if (assignChip === 'yes') {
        const chipId = form.getFieldValue('chipId');
        if (!chipId) {
          message.error('Please select a chip to assign');
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
      message.error('Failed to verify user: ' + (error?.message || 'Unknown error'));
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

  return (
    <Modal
      title={
        currentStep === 1 
          ? "Select Address for User" 
          : currentStep === 2
          ? "Subscription Complete"
          : "Assign Chip"
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
                  onClick={handleSubscriptionNext} 
                  disabled={isNextDisabled}
                >
                  Next
                </Button>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </>
        )}

        {currentStep === 3 && (
          <>
            <Form.Item
              label="Assign Chip?"
              name="assignChip"
              rules={[{ required: true, message: 'Please select an option' }]}
            >
              <Radio.Group 
                onChange={handleChipChange} 
                value={assignChip}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="yes">
                    <Text strong>Yes</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      Assign a chip to this user
                    </Text>
                  </Radio>
                  <Radio value="no">
                    <Text strong>No</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      Skip chip assignment
                    </Text>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            {assignChip === 'yes' && (
              <Form.Item
                name="chipId"
                label="Select Chip"
                rules={[{ required: true, message: 'Please select a chip' }]}
              >
                <Select
                  placeholder="Select an unassigned chip"
                  loading={chipsLoading}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={chipsLoading ? <Spin size="small" /> : 'No unassigned chips found'}
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

