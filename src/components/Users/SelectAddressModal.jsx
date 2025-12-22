import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Button, Space, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses } from '../../store/slices/addressSlice';

const { Option } = Select;

const SelectAddressModal = ({ open, onCancel, onSubmit, user }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { items: addresses, loading } = useSelector((state) => state.addresses);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchAddresses());
      form.resetFields();
    }
  }, [open, dispatch, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoadingSubscription(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Select Address for User"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
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
            <Button type="primary" htmlType="submit" loading={loadingSubscription}>
              Confirm & Verify User
            </Button>
            <Button onClick={handleCancel} disabled={loadingSubscription}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SelectAddressModal;

