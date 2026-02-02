import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Space, Typography, Breadcrumb, message, Popconfirm, Tooltip, Table } from 'antd';
import { HomeOutlined, DeleteOutlined, PlusOutlined, EditOutlined, UserOutlined, UserSwitchOutlined, EnvironmentOutlined, DisconnectOutlined } from '@ant-design/icons';
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from '../store/slices/addressSlice';
import AddAddressModal from '../components/Addresses/AddAddressModal';
import AddressUsersModal from '../components/Addresses/AddressUsersModal';
import AddressDetailsModal from '../components/Addresses/AddressDetailsModal';

const { Title, Text } = Typography;

const AddressesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, loading, error, pagination } = useSelector((state) => state.addresses);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [detailsAddress, setDetailsAddress] = useState(null);
  const hasFetchedRef = React.useRef(false);
  const hasHandledNavigationRef = React.useRef(false);

  // Fetch addresses on mount (prevent duplicate calls from React.StrictMode)
  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    dispatch(fetchAddresses());
  }, [dispatch]);

  // Handle navigation from Device Details modal to open address details
  useEffect(() => {
    if (location.state?.addressId && location.state?.openDetails && !hasHandledNavigationRef.current && items.length > 0) {
      const addressId = location.state.addressId;
      const address = items.find(addr => (addr.id || addr._id) == addressId);
      
      if (address) {
        setDetailsAddress(address);
        setIsDetailsModalOpen(true);
        hasHandledNavigationRef.current = true;
        
        // If openAssignManager is true, trigger assign manager after modal opens
        if (location.state?.openAssignManager) {
          setTimeout(() => {
            // This will be handled by the AddressDetailsModal component
          }, 100);
        }
        
        // Clear the navigation state
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, items, navigate, location.pathname]);

  // Redirect to login if token is cleared
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Show error messages
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleDelete = async (address) => {
    try {
      // Use _id if available, otherwise use id
      const addressId = address._id || address.id;
      await dispatch(deleteAddress(addressId)).unwrap();
      message.success('Address deleted successfully');
      dispatch(fetchAddresses());
    } catch (error) {
      message.error(error || 'Failed to delete address');
    }
  };

  const handleAdd = async (values) => {
    try {
      let lat = null;
      let long = null;
      
      if (values.lat !== null && values.lat !== undefined && values.lat !== '') {
        const latNum = typeof values.lat === 'string' ? parseFloat(values.lat) : Number(values.lat);
        if (!isNaN(latNum) && latNum >= -90 && latNum <= 90) {
          lat = latNum;
        }
      }
      
      if (values.long !== null && values.long !== undefined && values.long !== '') {
        const longNum = typeof values.long === 'string' ? parseFloat(values.long) : Number(values.long);
        if (!isNaN(longNum) && longNum >= -180 && longNum <= 180) {
          long = longNum;
        }
      }
      
      const addressData = {
        address: values.address || '',
        city: values.city || '',
        lat: lat,
        long: long,
        managerId: values.managerId && values.managerId !== 0 ? Number(values.managerId) : null,
      };
      
      
      await dispatch(createAddress(addressData)).unwrap();
      message.success('Address created successfully');
      setIsAddModalOpen(false);
      dispatch(fetchAddresses());
    } catch (error) {
      console.error('Address creation error:', error);
      const errorMsg = error?.message || error?.toString() || 'Failed to create address';
      message.error(errorMsg);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (values) => {
    try {
      // Use _id if available, otherwise use id
      const addressId = editingAddress._id || editingAddress.id;
      
      // Prepare form values with proper types
      let lat = null;
      let long = null;
      
      if (values.lat !== null && values.lat !== undefined && values.lat !== '') {
        const latNum = typeof values.lat === 'string' ? parseFloat(values.lat) : Number(values.lat);
        if (!isNaN(latNum) && latNum >= -90 && latNum <= 90) {
          lat = latNum;
        }
      }
      
      if (values.long !== null && values.long !== undefined && values.long !== '') {
        const longNum = typeof values.long === 'string' ? parseFloat(values.long) : Number(values.long);
        if (!isNaN(longNum) && longNum >= -180 && longNum <= 180) {
          long = longNum;
        }
      }
      
      const managerId = values.managerId ? Number(values.managerId) : null;
      
      // Compare with initial values and only include changed fields
      const changedFields = {};
      
      // Compare address
      if (values.address !== (editingAddress.address || '')) {
        changedFields.address = values.address || '';
      }
      
      // Compare city
      if (values.city !== (editingAddress.city || '')) {
        changedFields.city = values.city || '';
      }
      
      // Compare lat (handle null/undefined cases)
      const initialLat = editingAddress.lat !== null && editingAddress.lat !== undefined 
        ? (typeof editingAddress.lat === 'string' ? parseFloat(editingAddress.lat) : Number(editingAddress.lat))
        : null;
      if (lat !== initialLat && (lat !== null || initialLat !== null)) {
        changedFields.lat = lat;
      }
      
      // Compare long (handle null/undefined cases)
      const initialLong = editingAddress.long !== null && editingAddress.long !== undefined 
        ? (typeof editingAddress.long === 'string' ? parseFloat(editingAddress.long) : Number(editingAddress.long))
        : null;
      if (long !== initialLong && (long !== null || initialLong !== null)) {
        changedFields.long = long;
      }
      
      // Compare managerId
      const initialManagerId = editingAddress.managerId || null;
      if (managerId !== initialManagerId) {
        changedFields.managerId = managerId;
      }
      
      // Only send request if there are changes
      if (Object.keys(changedFields).length === 0) {
        message.info('No changes detected');
        setIsEditModalOpen(false);
        setEditingAddress(null);
        return;
      }
      
      await dispatch(updateAddress({ id: addressId, addressData: changedFields })).unwrap();
      message.success('Address updated successfully');
      setIsEditModalOpen(false);
      setEditingAddress(null);
      dispatch(fetchAddresses());
    } catch (error) {
      console.error('Update error:', error);
      const errorMsg = error?.message || error?.toString() || 'Failed to update address';
      message.error(errorMsg);
    }
  };

  const handleViewUsers = (address) => {
    setSelectedAddress(address);
    setIsUsersModalOpen(true);
  };

  const handleViewDetails = (address) => {
    setDetailsAddress(address);
    setIsDetailsModalOpen(true);
  };

  const handleViewUsersFromDetails = () => {
    if (detailsAddress) {
      setIsDetailsModalOpen(false);
      setSelectedAddress(detailsAddress);
      setIsUsersModalOpen(true);
    }
  };

  const handleAssignToManager = async (address) => {
    try {
      const addressId = address._id || address.id;
      const managerId = address.managerId;
      
      if (!managerId) {
        message.error('Manager ID is required');
        return;
      }
      
      await dispatch(updateAddress({ 
        id: addressId, 
        addressData: { managerId: Number(managerId) } 
      })).unwrap();
      
      message.success('Address assigned to manager successfully');
      dispatch(fetchAddresses());
      
      if (detailsAddress && (detailsAddress.id === addressId || detailsAddress._id === addressId)) {
        const updatedAddress = { ...detailsAddress, managerId: Number(managerId) };
        setDetailsAddress(updatedAddress);
      }
    } catch (error) {
      const errorMsg = error?.message || error?.toString() || 'Failed to assign address to manager';
      message.error(errorMsg);
    }
  };

  const handleUnassignManager = async (address) => {
    try {
      const addressId = address._id || address.id;
      
      await dispatch(updateAddress({ 
        id: addressId, 
        addressData: { managerId: null } 
      })).unwrap();
      
      message.success('Manager unassigned from address successfully');
      dispatch(fetchAddresses());
    } catch (error) {
      const errorMsg = error?.message || error?.toString() || 'Failed to unassign manager from address';
      message.error(errorMsg);
    }
  };

  const openInYandexMaps = (lat, long) => {
    if (lat && long) {
      const url = `https://yandex.com/maps/?pt=${long},${lat}&z=15`;
      window.open(url, '_blank');
    }
  };

  const formatCoordinates = (value) => {
    if (!value) return '-';
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toFixed(6);
  };

  const columns = [
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text, record) => (
        <Text 
          className="cursor-pointer hover:text-blue-500" 
          onClick={() => handleViewDetails(record)}
          ellipsis={{ tooltip: text }}
        >
          {text || 'No address provided'}
        </Text>
      ),
    },
    {
      title: 'Manager',
      dataIndex: ['manager', 'firstName'],
      key: 'manager',
      render: (_, record) => {
        const manager = record.manager;
        if (!manager) return '-';
        const fullName = `${manager.firstName || ''} ${manager.lastName || ''}`.trim();
        return fullName || manager.email || '-';
      },
    },
    {
      title: 'Latitude',
      dataIndex: 'lat',
      key: 'lat',
      render: (lat, record) => {
        if (!lat) return '-';
        const formatted = formatCoordinates(lat);
        return (
          <a
            href={`https://yandex.com/maps/?pt=${record?.long || lat},${lat}&z=15`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 flex items-center"
            onClick={(e) => {
              e.preventDefault();
              if (record?.lat && record?.long) {
                openInYandexMaps(record.lat, record.long);
              } else if (lat) {
                openInYandexMaps(lat, lat);
              }
            }}
          >
            <EnvironmentOutlined className="mr-1" />
            {formatted}
          </a>
        );
      },
    },
    {
      title: 'Longitude',
      dataIndex: 'long',
      key: 'long',
      render: (long, record) => {
        if (!long) return '-';
        const formatted = formatCoordinates(long);
        return (
          <a
            href={`https://yandex.com/maps/?pt=${long},${record?.lat || long}&z=15`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 flex items-center"
            onClick={(e) => {
              e.preventDefault();
              if (record?.lat && record?.long) {
                openInYandexMaps(record.lat, record.long);
              } else if (long) {
                openInYandexMaps(long, long);
              }
            }}
          >
            <EnvironmentOutlined className="mr-1" />
            {formatted}
          </a>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Users">
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => handleViewUsers(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit Address">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          {record.managerId ? (
            <Popconfirm
              title="Unassign manager from this address?"
              description="Are you sure you want to unassign the manager from this address?"
              onConfirm={() => handleUnassignManager(record)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Unassign Manager">
                <Button
                  type="text"
                  icon={<DisconnectOutlined />}
                  size="small"
                />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Assign Manager">
              <Button
                type="text"
                icon={<UserSwitchOutlined />}
                onClick={() => handleViewDetails(record)}
                size="small"
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Delete this address?"
            description="Are you sure you want to delete this address?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Address">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            title: 'Community Mgt',
          },
          {
            title: 'Addresses',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          Addresses
        </Title>
        <Space size="middle">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Address
          </Button>
        </Space>
      </div>

      {/* Addresses Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={items}
          rowKey={(record) => record.id || record._id}
          loading={loading}
          pagination={{
            current: pagination.currentPage,
            pageSize: pagination.itemsPerPage,
            total: pagination.totalItems,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} addresses`,
            onChange: (page, pageSize) => {
              // You can add pagination logic here if needed
            },
          }}
          onRow={(record) => ({
            onClick: (e) => {
              // Don't trigger if clicking on button or action
              if (
                e.target.closest('button') ||
                e.target.closest('.ant-popover') ||
                e.target.closest('.ant-tooltip')
              ) {
                return;
              }
              handleViewDetails(record);
            },
            style: { cursor: 'pointer' },
          })}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No addresses found. Click "+ Add Address" to create one.',
          }}
        />
      </Card>

      {/* Add Address Modal */}
      <AddAddressModal
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        mode="add"
        onSubmit={handleAdd}
      />

      {/* Edit Address Modal */}
      <AddAddressModal
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingAddress(null);
        }}
        mode="edit"
        initialValues={editingAddress}
        onSubmit={handleUpdate}
      />

      {/* Users Modal */}
      <AddressUsersModal
        open={isUsersModalOpen}
        onCancel={() => {
          setIsUsersModalOpen(false);
          setSelectedAddress(null);
        }}
        address={selectedAddress}
      />

      {/* Address Details Modal */}
      <AddressDetailsModal
        open={isDetailsModalOpen}
        onCancel={() => {
          setIsDetailsModalOpen(false);
          setDetailsAddress(null);
        }}
        address={detailsAddress}
        onViewUsers={handleViewUsersFromDetails}
        onAssignManager={handleAssignToManager}
        onUnassignManager={handleUnassignManager}
      />
    </div>
  );
};

export default AddressesList;
