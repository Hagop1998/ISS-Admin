import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Space, Select, Spin } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers } from '../../store/slices/userSlice';

const { TextArea } = Input;
const { Option } = Select;

const AddAddressModal = ({ open, onCancel, onSubmit, mode = 'add', initialValues = null }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.addresses);
  const { users: allUsers, loading: usersLoading } = useSelector((state) => state.users);
  const user = useSelector((state) => state.auth.user);
  const [adminsFetched, setAdminsFetched] = useState(false);

  const adminUsers = allUsers.filter(u => u.role === 'admin' || u.role === 'superAdmin');

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setAdminsFetched(false);
      return;
    }

    if (mode === 'edit' && initialValues) {
      setTimeout(() => {
        form.setFieldsValue({
          address: initialValues.address || '',
          city: initialValues.city || '',
          managerId: initialValues.managerId || null,
        });
      }, 0);
    } else {
      form.resetFields();
    }
  }, [open, form, mode, initialValues]);

  const handleDropdownVisibleChange = async (open) => {
    if (open && !adminsFetched && adminUsers.length === 0) {
      try {
        await dispatch(fetchUsers({ page: 1, limit: 100, role: 'admin' })).unwrap();
        setAdminsFetched(true);
      } catch (error) {
        console.error('Failed to fetch admin users:', error);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Send managerId: 0 if not selected, otherwise send the selected managerId
      const submitData = {
        ...values,
        managerId: values.managerId ? Number(values.managerId) : 0,
      };
      onSubmit(submitData);
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
      title={mode === 'add' ? 'Add Address' : 'Edit Address'}
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
      >
        {/* Address */}
        <Form.Item
          name="address"
          label="Address"
          rules={[
            { required: true, message: 'Please enter address' },
            { max: 200, message: 'Maximum 200 characters' },
          ]}
        >
          <TextArea rows={3} placeholder="Enter full address" />
        </Form.Item>

        {/* City */}
        <Form.Item
          name="city"
          label="City"
          rules={[
            { required: true, message: 'Please enter city' },
            { max: 100, message: 'Maximum 100 characters' },
          ]}
        >
          <Input placeholder="Enter city name" />
        </Form.Item>

        {/* Manager Selection - Only for super admin */}
        {user?.role === 'superAdmin' && (
          <Form.Item
            name="managerId"
            label="Manager"
            help="Select a manager (optional)."
          >
            <Select
              placeholder="Select a manager (optional)"
              allowClear
              showSearch
              loading={usersLoading}
              onDropdownVisibleChange={handleDropdownVisibleChange}
              filterOption={(input, option) =>
                String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={usersLoading ? <Spin size="small" /> : 'No admin users found'}
            >
              {adminUsers.map((adminUser) => (
                <Option 
                  key={adminUser.id || adminUser._id} 
                  value={adminUser.id || adminUser._id}
                >
                  {adminUser.firstName && adminUser.lastName
                    ? `${adminUser.firstName} ${adminUser.lastName}`
                    : adminUser.email || `Admin ${adminUser.id || adminUser._id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {mode === 'add' ? 'Add' : 'Save'}
            </Button>
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAddressModal;

