import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, Input, Button, Space, Select, Spin, AutoComplete } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers } from '../../store/slices/userSlice';
import { useDebounce } from '../../hooks/useDebounce';

const { TextArea } = Input;
const { Option } = Select;

const AddAddressModal = ({ open, onCancel, onSubmit, mode = 'add', initialValues = null }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.addresses);
  const { users: allUsers, loading: usersLoading } = useSelector((state) => state.users);
  const user = useSelector((state) => state.auth.user);
  const [adminsFetched, setAdminsFetched] = useState(false);
  const [addressSearchValue, setAddressSearchValue] = useState('');
  const [addressOptions, setAddressOptions] = useState([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const debouncedAddressSearch = useDebounce(addressSearchValue, 500);

  const adminUsers = allUsers.filter(u => u.role === 'admin' || u.role === 'superAdmin');

  // Search addresses using OpenStreetMap Nominatim API (FREE - Armenia only)
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setAdminsFetched(false);
      setAddressSearchValue('');
      setAddressOptions([]);
      return;
    }

    if (mode === 'edit' && initialValues) {
      setTimeout(() => {
        form.setFieldsValue({
          address: initialValues.address || '',
          city: initialValues.city || '',
          lat: initialValues.lat || '',
          long: initialValues.long || '',
          managerId: initialValues.managerId || null,
        });
        setAddressSearchValue(initialValues.address || '');
      }, 0);
    } else {
      form.resetFields();
      setAddressSearchValue('');
    }
  }, [open, form, mode, initialValues]);

  // Search addresses when user types (debounced)
  useEffect(() => {
    if (!debouncedAddressSearch || debouncedAddressSearch.length < 3) {
      setAddressOptions([]);
      return;
    }

    const searchAddresses = async () => {
      setSearchingAddress(true);
      try {
        // OpenStreetMap Nominatim API - FREE, no API key needed
        // Restrict to Armenia only (country code: am)
        const url = `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(debouncedAddressSearch)}` +
          `&countrycodes=am` + // Armenia only
          `&format=json` +
          `&addressdetails=1` +
          `&limit=5` +
          `&accept-language=en`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'ISS-Admin-App', // Required by Nominatim
          },
        });

        if (!response.ok) {
          throw new Error('Failed to search addresses');
        }

        const data = await response.json();
        
        // Format results for AutoComplete
        const options = data.map((item, index) => {
          const address = item.display_name || '';
          const city = item.address?.city || 
                      item.address?.town || 
                      item.address?.village || 
                      item.address?.municipality || 
                      '';
          
          return {
            value: address,
            label: address,
            lat: item.lat,
            lon: item.lon,
            city: city,
            // Store full data for easy access
            fullData: item,
          };
        });

        setAddressOptions(options);
      } catch (error) {
        console.error('Error searching addresses:', error);
        setAddressOptions([]);
      } finally {
        setSearchingAddress(false);
      }
    };

    searchAddresses();
  }, [debouncedAddressSearch]);

  const handleAddressSelect = (value, option) => {
    // Find the selected option from addressOptions
    const selectedOption = addressOptions.find(opt => opt.value === value);
    
    if (selectedOption && selectedOption.lat && selectedOption.lon) {
      const lat = parseFloat(selectedOption.lat);
      const lon = parseFloat(selectedOption.lon);
      const city = selectedOption.city || '';
      
      // Update form fields
      form.setFieldsValue({
        address: value,
        city: city,
        lat: lat.toFixed(6),
        long: lon.toFixed(6),
      });
      
      // Also update the search value
      setAddressSearchValue(value);
    }
  };

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
      
      // Ensure lat and long are numbers, not strings
      let lat = null;
      let long = null;
      
      if (values.lat) {
        lat = typeof values.lat === 'string' ? parseFloat(values.lat) : Number(values.lat);
        if (isNaN(lat)) lat = null;
      }
      
      if (values.long) {
        long = typeof values.long === 'string' ? parseFloat(values.long) : Number(values.long);
        if (isNaN(long)) long = null;
      }
      
      // Prepare submit data
      const submitData = {
        address: values.address || '',
        city: values.city || '',
        lat: lat,
        long: long,
        managerId: values.managerId ? Number(values.managerId) : null,
      };
      
      // Log for debugging
      console.log('Submitting address data:', submitData);
      
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
          <AutoComplete
            value={addressSearchValue}
            onChange={(value) => {
              setAddressSearchValue(value);
              form.setFieldsValue({ address: value });
            }}
            onSelect={(value, option) => {
              handleAddressSelect(value, option);
            }}
            options={addressOptions.map(opt => ({
              value: opt.value,
              label: (
                <div>
                  <div style={{ fontWeight: 500 }}>{opt.value}</div>
                  {opt.city && <div style={{ fontSize: '12px', color: '#999' }}>{opt.city}</div>}
                </div>
              ),
            }))}
            placeholder="Type an address "
            notFoundContent={searchingAddress ? <Spin size="small" /> : 'No addresses found'}
            style={{ width: '100%' }}
            filterOption={false}
          />
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

        {/* Latitude */}
        <Form.Item
          name="lat"
          label="Latitude"
          rules={[
            { 
              pattern: /^-?([1-8]?[0-9](\.\d+)?|90(\.0+)?)$/, 
              message: 'Please enter a valid latitude (-90 to 90)' 
            },
          ]}
        >
          <Input 
            placeholder="Enter latitude" 
            type="number"
            step="any"
          />
        </Form.Item>

        {/* Longitude */}
        <Form.Item
          name="long"
          label="Longitude"
          rules={[
            { 
              pattern: /^-?((1[0-7][0-9]|[0-9]?[0-9])(\.\d+)?|180(\.0+)?)$/, 
              message: 'Please enter a valid longitude (-180 to 180)' 
            },
          ]}
        >
          <Input 
            placeholder="Enter longitude" 
            type="number"
            step="any"
          />
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

