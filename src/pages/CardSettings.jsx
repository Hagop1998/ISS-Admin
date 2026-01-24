import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { Typography, Breadcrumb, Card, Form, Input, Button, Space, message, Select, Row, Col, Table, Tag, Modal, Popconfirm, Descriptions, Divider, Spin } from 'antd';
import { HomeOutlined, SafetyOutlined, CheckCircleOutlined, PlusOutlined, ReloadOutlined, StopOutlined, CheckOutlined, UserOutlined, UserDeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { setICCard, fetchChips, createChip, updateChip } from '../store/slices/deviceSlice';
import { deviceService } from '../services/deviceService';
import { fetchUsers } from '../store/slices/userSlice';
import { fetchAddresses } from '../store/slices/accessControlSlice';
import { ChipCardOperationEnum } from '../constants/enums';

const { Title } = Typography;
const { Option } = Select;

const CardSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chips, chipsLoading, chipsPagination } = useSelector((state) => state.devices);
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { addresses, addressesLoading } = useSelector((state) => state.accessControl);
  const token = useSelector((state) => state.auth.token);
  
  const [icCardForm] = Form.useForm();
  const [createChipForm] = Form.useForm();
  const [assignChipForm] = Form.useForm();
  const [isCreateChipModalOpen, setIsCreateChipModalOpen] = useState(false);
  const [isAssignChipModalOpen, setIsAssignChipModalOpen] = useState(false);
  const [isChipDetailsModalOpen, setIsChipDetailsModalOpen] = useState(false);
  const [chipDetails, setChipDetails] = useState(null);
  const [chipDetailsLoading, setChipDetailsLoading] = useState(false);
  const [assigningChip, setAssigningChip] = useState(null);
  const [selectedAddressDeviceId, setSelectedAddressDeviceId] = useState(null);
  const [selectedAddressDeviceLocalId, setSelectedAddressDeviceLocalId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userSearchValue, setUserSearchValue] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { loading: deviceActionLoading } = useSelector((state) => state.devices);

  const lastFetchedChipsRef = useRef({ page: null, limit: null });
  const hasFetchedUsersForAssignRef = useRef(false);
  const lastUserSearchRef = useRef(null);
  
  const debouncedUserSearch = useDebounce(userSearchValue, 300);

  useEffect(() => {
    // Fetch chips only if page or limit changed
    const currentPage = pagination.current;
    const currentLimit = pagination.pageSize;
    if (
      lastFetchedChipsRef.current.page !== currentPage ||
      lastFetchedChipsRef.current.limit !== currentLimit
    ) {
      dispatch(fetchChips({ page: currentPage, limit: currentLimit }));
      lastFetchedChipsRef.current = { page: currentPage, limit: currentLimit };
    }
  }, [dispatch, pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (isCreateChipModalOpen) {
      dispatch(fetchAddresses());
      dispatch(fetchUsers({ page: 1, limit: 10 }));
      // Initialize chipStatus to unAssigned when modal opens
      createChipForm.setFieldsValue({ chipStatus: 'unAssigned' });
      setSelectedUserId(null);
    }
  }, [isCreateChipModalOpen, dispatch, createChipForm]);

  useEffect(() => {
    if (isAssignChipModalOpen) {
      // Fetch users when Assign Chip modal opens (only once)
      if (!hasFetchedUsersForAssignRef.current) {
        dispatch(fetchUsers({ page: 1, limit: 10, search: '' }));
        hasFetchedUsersForAssignRef.current = true;
        lastUserSearchRef.current = '';
      }
      assignChipForm.setFieldsValue({ userId: null });
      setUserSearchValue('');
    } else {
      // Reset ref when modal closes
      hasFetchedUsersForAssignRef.current = false;
      lastUserSearchRef.current = null;
    }
  }, [isAssignChipModalOpen, dispatch, assignChipForm]);

  // Handle search with phone number prefix logic
  const handleUserSearch = (value) => {
    // Remove Armenian flag emoji if present
    let cleanedValue = value.replace(/🇦🇲\s*/g, '').trim();
    
    if (!cleanedValue) {
      setUserSearchValue('');
      return;
    }
    
    if (cleanedValue.startsWith('+374')) {
      setUserSearchValue(cleanedValue);
      return;
    }
    
    // Check if the input starts with digits (phone number)
    const isPhoneNumber = /^\d/.test(cleanedValue);
    
    if (isPhoneNumber) {
      // If it's a phone number and doesn't already have +374, add it
      const searchValue = `+374${cleanedValue}`;
      setUserSearchValue(searchValue);
    } else {
      // For text searches (name, email), use as is
      setUserSearchValue(cleanedValue);
    }
  };

  // Fetch users when debounced search value changes
  // useEffect(() => {
  //   if (isAssignChipModalOpen && debouncedUserSearch !== undefined) {
  //     // Only fetch if search value actually changed
  //     if (lastUserSearchRef.current !== debouncedUserSearch) {
  //       let searchQuery = debouncedUserSearch || '';
        
  //       // Use the search query as is, including the + prefix for phone numbers
  //       if (searchQuery) {
  //         dispatch(fetchUsers({ page: 1, limit: 10, search: searchQuery }));
  //       } else {
  //         // Empty search - fetch all users
  //         dispatch(fetchUsers({ page: 1, limit: 10, search: '' }));
  //       }
        
  //       lastUserSearchRef.current = debouncedUserSearch;
  //     }
  //   }
  // }, [debouncedUserSearch, isAssignChipModalOpen, dispatch]);

  useEffect(() => {
    if (isAssignChipModalOpen && debouncedUserSearch !== undefined) {
      if (lastUserSearchRef.current !== debouncedUserSearch) {
        let searchQuery = debouncedUserSearch || '';
  
        // If user types only numbers → prefix +374 for display
        if (/^\d+$/.test(searchQuery)) {
          searchQuery = `+374${searchQuery}`;
        }
  
        // If phone number starts with +374, convert to local format (0...)
        if (searchQuery.startsWith('+374')) {
          // Remove +374 and add 0 at the beginning
          const phoneWithoutPrefix = searchQuery.substring(4); // Remove '+374'
          const localFormat = `${phoneWithoutPrefix.replace(/^0/, '')}`;
          dispatch(fetchUsers({ page: 1, limit: 10, search: localFormat }));
        } else if (searchQuery) {
          // name / email search - use as is
          dispatch(fetchUsers({ page: 1, limit: 10, search: searchQuery }));
        } else {
          // Empty search - fetch all users
          dispatch(fetchUsers({ page: 1, limit: 10, search: '' }));
        }
  
        lastUserSearchRef.current = debouncedUserSearch;
      }
    }
  }, [debouncedUserSearch, isAssignChipModalOpen, dispatch]);

  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleCreateChip = async (values) => {
    try {
      if (!selectedAddressDeviceId || !selectedAddressDeviceLocalId) {
        message.error('Please select an address with a device');
        return;
      }

      const chipStatus = values.userId ? 'active' : 'unAssigned';

      const chipPayload = {
        serialNumber: values.serialNumber,
        deviceId: Number(selectedAddressDeviceId),
        chipType: values.chipType,
        chipStatus: chipStatus,
      };

      if (values.userId) {
        chipPayload.userId = Number(values.userId);
      }

      await dispatch(createChip(chipPayload)).unwrap();
      message.success('Chip created successfully');

      try {
        const icCardPayload = {
          localId: selectedAddressDeviceLocalId,
          cardOpt: ChipCardOperationEnum.ADD, // 1
          cardSN: values.serialNumber,
        };
        await dispatch(setICCard(icCardPayload)).unwrap();
        message.success('IC card set successfully');
      } catch (icCardError) {
        message.warning(icCardError.message || 'Chip created but failed to set IC card');
      }

      setIsCreateChipModalOpen(false);
      createChipForm.resetFields();
      setSelectedAddressDeviceId(null);
      setSelectedAddressDeviceLocalId(null);
      setSelectedUserId(null);
      dispatch(fetchChips({ page: pagination.current, limit: pagination.pageSize }));
    } catch (error) {
      message.error(error.message || error || 'Failed to create chip');
    }
  };

  const handleAddressChange = (addressId) => {
    const selectedAddress = addresses.find(addr => (addr.id || addr._id) === addressId);
    if (selectedAddress?.device?.id) {
      setSelectedAddressDeviceId(selectedAddress.device.id);
      setSelectedAddressDeviceLocalId(selectedAddress.device.localId || null);
      createChipForm.setFieldsValue({ deviceId: selectedAddress.device.localId });
    } else {
      setSelectedAddressDeviceId(null);
      setSelectedAddressDeviceLocalId(null);
      createChipForm.setFieldsValue({ deviceId: undefined });
      message.warning('Selected address does not have a device');
    }
  };

  const handleBlockChip = async (chipId, serialNumber, deviceLocalId) => {
    try {
      // Step 1: Update chip status to blocked
      await dispatch(updateChip({ 
        chipId, 
        chipData: { chipStatus: 'blocked' } 
      })).unwrap();
      
      // Step 2: Call setICCard with cardOpt: 2 (DELETE)
      try {
        const icCardPayload = {
          localId: deviceLocalId,
          cardOpt: ChipCardOperationEnum.DELETE, // 2
          cardSN: serialNumber,
        };
        await dispatch(setICCard(icCardPayload)).unwrap();
        message.success('Chip blocked successfully');
      } catch (icCardError) {
        message.warning('Chip status updated but failed to set IC card');
      }

      dispatch(fetchChips({ page: pagination.current, limit: pagination.pageSize }));
    } catch (error) {
      message.error(error.message || error || 'Failed to block chip');
    }
  };

  const handleUnblockChip = async (chipId, serialNumber, deviceLocalId, userId) => {
    try {
      // Determine chipStatus: active if userId exists, unAssigned if not
      const chipStatus = userId ? 'active' : 'unAssigned';

      // Step 1: Update chip status
      await dispatch(updateChip({ 
        chipId, 
        chipData: { chipStatus } 
      })).unwrap();
      
      try {
        const icCardPayload = {
          localId: deviceLocalId,
          cardOpt: ChipCardOperationEnum.ADD, // 1
          cardSN: serialNumber,
        };
        await dispatch(setICCard(icCardPayload)).unwrap();
        message.success('Chip unblocked successfully');
      } catch (icCardError) {
        message.warning('Chip status updated but failed to set IC card');
      }

      dispatch(fetchChips({ page: pagination.current, limit: pagination.pageSize }));
    } catch (error) {
      message.error(error.message || error || 'Failed to unblock chip');
    }
  };

  const handleAssignChip = (chip) => {
    setAssigningChip(chip);
    setIsAssignChipModalOpen(true);
    assignChipForm.setFieldsValue({ userId: null });
  };

  const handleAssignChipSubmit = async (values) => {
    if (!assigningChip || !values.userId) {
      message.error('Please select a user');
      return;
    }

    try {
      const chipId = assigningChip.id || assigningChip._id;
      const deviceLocalId = assigningChip.device?.localId;

      if (!deviceLocalId) {
        message.error('Device local ID not found');
        return;
      }

      // Step 1: Update chip with userId and status to active
      await dispatch(updateChip({ 
        chipId, 
        chipData: { 
          userId: Number(values.userId),
          chipStatus: 'active'
        } 
      })).unwrap();

      // Step 2: Call setICCard with cardOpt: 2 (DELETE/Assign)
      try {
        const icCardPayload = {
          localId: deviceLocalId,
          cardOpt: ChipCardOperationEnum.DELETE, // 2 (Assign)
          cardSN: assigningChip.serialNumber,
        };
        await dispatch(setICCard(icCardPayload)).unwrap();
        message.success('Chip assigned to user successfully');
      } catch (icCardError) {
        message.warning('Chip assigned but failed to set IC card');
      }

      setIsAssignChipModalOpen(false);
      setAssigningChip(null);
      assignChipForm.resetFields();
      dispatch(fetchChips({ page: pagination.current, limit: pagination.pageSize }));
    } catch (error) {
      message.error(error.message || error || 'Failed to assign chip');
    }
  };

  const handleViewChipDetails = async (chip) => {
    const chipId = chip.id || chip._id;
    if (!chipId) {
      message.error('Chip ID is missing');
      return;
    }

    setChipDetailsLoading(true);
    setIsChipDetailsModalOpen(true);
    setChipDetails(null);

    try {
      const data = await deviceService.getChipById(chipId);
      const chipData = data?.data || data?.chip || data;
      setChipDetails(chipData);
    } catch (error) {
      message.error(error?.message || 'Failed to fetch chip details');
      setIsChipDetailsModalOpen(false);
    } finally {
      setChipDetailsLoading(false);
    }
  };

  const handleUnassignChip = async (chipId, serialNumber, deviceLocalId) => {
    try {
      // Don't send userId at all - omit it from the payload
      await dispatch(updateChip({ 
        chipId, 
        chipData: { 
          chipStatus: 'unAssigned'
        } 
      })).unwrap();
      
      try {
        const icCardPayload = {
          localId: deviceLocalId,
          cardOpt: ChipCardOperationEnum.CLEAR, 
          cardSN: serialNumber,
        };
        await dispatch(setICCard(icCardPayload)).unwrap();
        message.success('Chip unassigned successfully');
      } catch (icCardError) {
        message.warning('Chip status updated but failed to set IC card');
      }

      dispatch(fetchChips({ page: pagination.current, limit: pagination.pageSize }));
    } catch (error) {
      message.error(error.message || error || 'Failed to unassign chip');
    }
  };

  const handleSetICCard = async (values) => {
    try {
      const payload = {
        localId: values.localId,
        cardOpt: Number(values.cardOpt),
        cardSN: String(values.cardSN),
      };
      await dispatch(setICCard(payload)).unwrap();
      message.success('IC card set successfully');

      const selectedChip = chips?.find(chip => chip.device?.localId === values.localId);
      const deviceId = selectedChip?.device?.id || selectedChip?.device?._id;
      
      if (!deviceId) {
        message.error('Device not found. Please ensure the device is associated with a chip.');
        return;
      }
      const userId = Number(values.userId);

      if (!deviceId || !userId) {
        message.error('Device ID or User ID is missing');
        return;
      }

      const chipPayload = {
        serialNumber: values.serialNumber, 
        userId: userId,
        deviceId: deviceId,
        chipType: 'ic',
        chipStatus: 'unAssigned',
      };

      await dispatch(createChip(chipPayload)).unwrap();
      message.success('Chip created successfully');
      icCardForm.resetFields();
      dispatch(fetchChips({ page: pagination.current, limit: pagination.pageSize }));
    } catch (error) {
      message.error(error.message || error || 'Failed to set IC card');
    }
  };

  const chipColumns = [
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => handleViewChipDetails(record)}
          style={{ padding: 0 }}
        >
          {text || '-'}
        </Button>
      ),
    },
    {
      title: 'Address',
      key: 'address',
      render: (_, record) => {
        const address = record.device?.address?.address || 
                       record.device?.address?.name || 
                       record.device?.address?.title ||
                       '-';
        return address;
      },
    },
    {
      title: 'Device Local ID',
      key: 'deviceLocalId',
      render: (_, record) => {
        const localId = record.device?.localId || '-';
        return localId;
      },
    },
    {
      title: 'Chip Type',
      dataIndex: 'chipType',
      key: 'chipType',
      render: (text) => <Tag>{text || '-'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'chipStatus',
      key: 'chipStatus',
      render: (status) => {
        let color = 'default';
        const statusLower = status?.toLowerCase();
        if (statusLower === 'active') color = 'green';
        else if (statusLower === 'unassigned') color = 'orange';
        else if (statusLower === 'blocked') color = 'red';
        return (
          <Tag color={color}>
            {status || '-'}
          </Tag>
        );
      },
    },
    {
      title: 'Assigned At',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date) => (date ? new Date(date).toLocaleString() : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => {
        const chipId = record.id || record._id;
        const deviceLocalId = record.device?.localId;
        
        const chipStatusLower = record.chipStatus?.toLowerCase();
        
        return (
          <Space>
            {(chipStatusLower === 'unassigned' || record.chipStatus === 'unAssigned') && (
              <Button
                type="link"
                icon={<UserOutlined />}
                size="small"
                onClick={() => handleAssignChip(record)}
              >
                Assign
              </Button>
            )}
            {(chipStatusLower === 'active' || record.chipStatus === 'Active') && (
              <Popconfirm
                title="Are you sure you want to unassign this chip from the user?"
                onConfirm={() => handleUnassignChip(chipId, record.serialNumber, deviceLocalId)}
                okText="Yes"
                cancelText="No"
                disabled={!deviceLocalId}
              >
                <Button
                  type="link"
                  icon={<UserDeleteOutlined />}
                  size="small"
                  style={{ color: '#ff9800' }}
                  disabled={!deviceLocalId}
                  title={!deviceLocalId ? 'Device local ID not found' : ''}
                >
                  Unassign
                </Button>
              </Popconfirm>
            )}
            {chipStatusLower !== 'blocked' && deviceLocalId && (
              <Popconfirm
                title="Are you sure you want to block this chip?"
                onConfirm={() => handleBlockChip(chipId, record.serialNumber, deviceLocalId)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  danger
                  icon={<StopOutlined />}
                  size="small"
                >
                  Block
                </Button>
              </Popconfirm>
            )}
            {chipStatusLower === 'blocked' && deviceLocalId && (
              <Popconfirm
                title="Are you sure you want to unblock this chip?"
                onConfirm={() => handleUnblockChip(chipId, record.serialNumber, deviceLocalId, record.userId)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  icon={<CheckOutlined />}
                  size="small"
                  style={{ color: '#52c41a' }}
                >
                  Unblock
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
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
            title: 'Device Manager',
          },
          {
            title: 'Card Settings',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600, color: '#3C0056' }}>
          Card Settings
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => dispatch(fetchChips({ page: pagination.current, limit: pagination.pageSize }))}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateChipModalOpen(true)}
            style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
          >
            Create Chip
          </Button>
        </Space>
      </div>

      {/* Chips Table */}
          <Card
        title="Chips"
        className="mb-6 shadow-md"
        styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
      >
        <Table
          columns={chipColumns}
          dataSource={chips || []}
          loading={chipsLoading}
          rowKey={(record) => record.id || record._id || record.serialNumber}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: chipsPagination?.totalItems || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} chips`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Set IC Card Form */}
      {/* <Card
            title={
              <Space>
            <SafetyOutlined style={{ color: '#3C0056' }} />
            <span>Set IC Cardssss</span>
              </Space>
            }
        className="shadow-md hover:shadow-lg transition-shadow"
        styles={{ header: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #3C0056' } }}
          >
            <Form
          form={icCardForm}
              layout="vertical"
          onFinish={handleSetICCard}
            >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="localId"
                label="Local ID"
                rules={[{ required: true, message: 'Please select a device' }]}
              >
                <Select
                  placeholder="Select device"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={loading}
                >
                  {devices.map((device) => (
                    <Option key={device.id || device._id} value={device.localId}>
                      {device.localId} {device.deviceType ? `(${device.deviceType})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
        </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="userId"
                label="Select User"
                rules={[{ required: true, message: 'Please select a user' }]}
              >
                <Select
                  placeholder="Select user"
                  showSearch
                  filterOption={(input, option) => {
                    const label = option?.label || option?.children || '';
                    const labelStr = typeof label === 'string' ? label : String(label);
                    return labelStr.toLowerCase().includes(input.toLowerCase());
                  }}
                  loading={usersLoading}
                  optionLabelProp="label"
                >
                  {Array.isArray(users) && users.map((user) => {
                    const userId = user.id || user._id;
                    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || `User ${userId}`;
                    const userLabel = `${userName} (${user.email || 'No email'})`;
                    return (
                      <Option key={userId} value={userId} label={userLabel}>
                        <div>
                          <div style={{ fontWeight: 500 }}>{userName}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>{user.email || 'No email'}</div>
                        </div>
                    </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cardOpt"
                label="Card Option"
                rules={[{ required: true, message: 'Please select card option' }]}
              >
                <Select
                  placeholder="Select card option"
                  style={{ width: '100%' }}
                >
                  <Option value={ChipCardOperationEnum.ADD}>Add</Option>
                  <Option value={ChipCardOperationEnum.DELETE}>Assign</Option>
                  <Option value={ChipCardOperationEnum.CLEAR}>Unassign</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="cardSN"
                label="Card Serial Number"
                rules={[
                  { required: true, message: 'Please enter card serial number' },
                  { max: 50, message: 'Maximum 50 characters' },
                ]}
              >
                <Input placeholder="Enter card serial number" />
              </Form.Item>
            </Col>
          </Row>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={deviceActionLoading}
                  icon={<CheckCircleOutlined />}
                  block
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                  Set IC Card
                </Button>
              </Form.Item>
            </Form>
      </Card> */}

      {/* Create Chip Modal */}
      <Modal
        title="Create Chip"
        open={isCreateChipModalOpen}
        onCancel={() => {
          setIsCreateChipModalOpen(false);
          createChipForm.resetFields();
          setSelectedAddressDeviceId(null);
          setSelectedAddressDeviceLocalId(null);
          setSelectedUserId(null);
        }}
        footer={null}
        width={600}
          >
            <Form
          form={createChipForm}
              layout="vertical"
          onFinish={handleCreateChip}
          className="mt-4"
        >
          <Form.Item
            name="addressId"
            label="Select Address"
            rules={[{ required: true, message: 'Please select an address' }]}
          >
            <Select
              placeholder="Select address"
              showSearch
              filterOption={(input, option) => {
                const label = option?.label || option?.children || '';
                const labelStr = typeof label === 'string' ? label : String(label);
                return labelStr.toLowerCase().includes(input.toLowerCase());
              }}
              loading={addressesLoading}
              onChange={handleAddressChange}
              optionLabelProp="label"
            >
              {Array.isArray(addresses) && addresses.map((address) => {
                const addressId = address.id || address._id;
                const addressLabel = `${address.address || ''}${address.city ? `, ${address.city}` : ''}`.trim() || `Address ${addressId}`;
                const hasDevice = address.device?.id 
                  ? ` (Device ID: ${address.device.localId}, Local ID: ${address.device.localId || 'N/A'})` 
                  : ' (No device)';
                return (
                  <Option key={addressId} value={addressId} label={addressLabel}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{addressLabel}</div>
                      <div style={{ fontSize: '12px', color: address.device?.localId ? '#52c41a' : '#999' }}>
                        {hasDevice}
                      </div>
                    </div>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          {selectedAddressDeviceLocalId && (
            <Form.Item
              name="deviceId"
              label="Device Local ID"
            >
              <Input value={selectedAddressDeviceLocalId} disabled />
            </Form.Item>
          )}

          <Form.Item
            name="serialNumber"
            label="Serial Number"
            rules={[
              { required: true, message: 'Please enter serial number' },
              { pattern: /^[0-9A-F]{8}$/, message: 'Serial number must be exactly 8 hexadecimal characters (0-9, A-F)' }
            ]}
          >
            <Input placeholder="Enter serial number (8 hex characters)" maxLength={8} style={{ textTransform: 'uppercase' }} />
          </Form.Item>

              <Form.Item
            name="userId"
            label="Select User"
              >
                <Select
              placeholder="Select user"
                  showSearch
              allowClear
              filterOption={(input, option) => {
                const label = option?.label || option?.children || '';
                const labelStr = typeof label === 'string' ? label : String(label);
                return labelStr.toLowerCase().includes(input.toLowerCase());
              }}
              loading={usersLoading}
              optionLabelProp="label"
              onChange={(value) => {
                setSelectedUserId(value);
                // Update chipStatus based on userId selection
                const newStatus = value ? 'active' : 'unAssigned';
                createChipForm.setFieldsValue({ chipStatus: newStatus });
              }}
            >
              {Array.isArray(users) && users.map((user) => {
                const userId = user.id || user._id;
                const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || `User ${userId}`;
                const userLabel = `${userName} (${user.email || 'No email'})`;
                return (
                  <Option key={userId} value={userId} label={userLabel}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{userName}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>{user.email || 'No email'}</div>
                    </div>
                    </Option>
                );
              })}
                </Select>
              </Form.Item>

              <Form.Item
            name="chipType"
            label="Chip Type"
            rules={[{ required: true, message: 'Please select chip type' }]}
            initialValue="ic"
          >
            <Select placeholder="Select chip type">
              <Option value="ic">IC</Option>
              <Option value="id">ID</Option>
            </Select>
              </Form.Item>

              <Form.Item
            name="chipStatus"
            label="Chip Status"
            tooltip="Status is set automatically: Active if user is selected, Unassigned if no user"
            initialValue="unAssigned"
          >
            <Select placeholder="Select chip status" disabled>
              <Option value="unAssigned">Unassigned</Option>
              <Option value="active">Active</Option>
              <Option value="blocked">Blocked</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsCreateChipModalOpen(false);
                createChipForm.resetFields();
                setSelectedAddressDeviceId(null);
                setSelectedAddressDeviceLocalId(null);
                setSelectedUserId(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={deviceActionLoading} style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}>
                Create Chip
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Chip Modal */}
      <Modal
        title="Assign Chip to User"
        open={isAssignChipModalOpen}
        onCancel={() => {
          setIsAssignChipModalOpen(false);
          setAssigningChip(null);
          assignChipForm.resetFields();
          setUserSearchValue('');
        }}
        footer={null}
        width={500}
      >
        <Form
          form={assignChipForm}
          layout="vertical"
          onFinish={handleAssignChipSubmit}
          className="mt-4"
        >
          {assigningChip && (
            <>
              <Form.Item label="Serial Number">
                <Input value={assigningChip.serialNumber} disabled />
              </Form.Item>
              <Form.Item label="Device ID">
                <Input value={assigningChip.deviceId} disabled />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="userId"
            label="Select User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select
              placeholder="Search by name, email, or phone number"
              showSearch
              searchValue={userSearchValue.startsWith('+374') ? `🇦🇲 ${userSearchValue}` : userSearchValue}
              onSearch={handleUserSearch}
              filterOption={false}
              loading={usersLoading}
              optionLabelProp="label"
              notFoundContent={usersLoading ? 'Loading...' : 'No users found'}
            >
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => {
                  const userId = user.id || user._id;
                  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || `User ${userId}`;
                  const userPhone = user.phone ? ` - ${user.phone}` : '';
                  const userLabel = `${userName} (${user.email || 'No email'})${userPhone}`;
                  return (
                    <Option key={userId} value={userId} label={userLabel}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{userName}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {user.email || 'No email'}
                          {user.phone && ` • ${user.phone}`}
                        </div>
                      </div>
                    </Option>
                  );
                })
              ) : (
                !usersLoading && (
                  <Option disabled value="no-users">
                    <div style={{ textAlign: 'center', color: '#999', padding: '8px 0' }}>
                      No users found
                    </div>
                  </Option>
                )
              )}
            </Select>
              </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsAssignChipModalOpen(false);
                setAssigningChip(null);
                assignChipForm.resetFields();
              }}>
                Cancel
              </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={deviceActionLoading}
                  style={{ backgroundColor: '#3C0056', borderColor: '#3C0056' }}
                >
                Assign Chip
                </Button>
            </Space>
              </Form.Item>
            </Form>
      </Modal>

      <Modal
        title="Chip Details"
        open={isChipDetailsModalOpen}
        onCancel={() => {
          setIsChipDetailsModalOpen(false);
          setChipDetails(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        {chipDetailsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : chipDetails ? (
          <div>
            <Descriptions title="Chip Information" bordered column={2} size="small">
              <Descriptions.Item label="Chip ID">{chipDetails.id || chipDetails._id || '-'}</Descriptions.Item>
              <Descriptions.Item label="Serial Number">{chipDetails.serialNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="User ID">
                {chipDetails.userId || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Chip Type">
                <Tag>{chipDetails.chipType || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Space>
                  <Tag color={
                    chipDetails.chipStatus?.toLowerCase() === 'active' ? 'green' :
                    chipDetails.chipStatus?.toLowerCase() === 'unassigned' ? 'orange' :
                    chipDetails.chipStatus?.toLowerCase() === 'blocked' ? 'red' : 'default'
                  }>
                    {chipDetails.chipStatus || '-'}
                  </Tag>
                  {(chipDetails.chipStatus?.toLowerCase() === 'unassigned' || chipDetails.chipStatus === 'unAssigned') && (
                    <Button
                      type="link"
                      icon={<UserOutlined />}
                      size="small"
                      onClick={() => {
                        handleAssignChip(chipDetails);
                        setIsChipDetailsModalOpen(false);
                      }}
                      style={{ padding: 0, color: '#1890ff' }}
                    >
                      Assign
                    </Button>
                  )}
                  {(chipDetails.chipStatus?.toLowerCase() === 'active' || chipDetails.chipStatus === 'Active') && (
                    <Popconfirm
                      title="Are you sure you want to unassign this chip from the user?"
                      onConfirm={async () => {
                        const chipId = chipDetails.id || chipDetails._id;
                        const deviceLocalId = chipDetails.device?.localId || 
                                             chipDetails.device?.localId;
                        if (chipId && deviceLocalId) {
                          await handleUnassignChip(chipId, chipDetails.serialNumber, deviceLocalId);
                          // Refresh chip details after unassign
                          const data = await deviceService.getChipById(chipId);
                          const chipData = data?.data || data?.chip || data;
                          setChipDetails(chipData);
                        }
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="link"
                        icon={<UserDeleteOutlined />}
                        size="small"
                        danger
                        style={{ padding: 0 }}
                      >
                        Unassign
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned At">
                {chipDetails.assignedAt ? new Date(chipDetails.assignedAt).toLocaleString() : '-'}
              </Descriptions.Item>
              {chipDetails.createdAt && (
                <Descriptions.Item label="Created At">
                  {new Date(chipDetails.createdAt).toLocaleString()}
                </Descriptions.Item>
              )}
              {chipDetails.updatedAt && (
                <Descriptions.Item label="Updated At">
                  {new Date(chipDetails.updatedAt).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>

            {chipDetails.device && (
              <>
                <Divider />
                <Descriptions 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span>Device Information</span>
                      <Button
                        type="default"
                        icon={<SettingOutlined />}
                        onClick={() => {
                          const deviceId = chipDetails.device.id || chipDetails.device._id;
                          if (deviceId) {
                            setIsChipDetailsModalOpen(false);
                            navigate(`/access-control/custom-settings/${deviceId}`);
                          }
                        }}
                        style={{ 
                          borderColor: '#1890ff',
                          color: '#1890ff',
                          marginLeft: 8
                        }}
                      >
                        Device Settings
                      </Button>
                    </div>
                  }
                  bordered 
                  column={2} 
                  size="small"
                >
                  <Descriptions.Item label="Device ID">{chipDetails.device.id || chipDetails.device._id || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Device Local ID">{chipDetails.device.localId || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Device Type">
                    <Tag>{chipDetails.device.deviceType || '-'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Space>
                      <Tag color={chipDetails.device.isOnline ? 'success' : 'error'}>
                        {chipDetails.device.isOnline ? 'Online' : 'Offline'}
                      </Tag>
                      <Tag color={chipDetails.device.isEnabled ? 'success' : 'default'}>
                        {chipDetails.device.isEnabled ? 'Enabled' : 'Disabled'}
                      </Tag>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {chipDetails.user && (
              <>
                <Divider />
                <Descriptions title="User Information" bordered column={2} size="small">
                  <Descriptions.Item label="User ID">{chipDetails.user.id || chipDetails.user._id || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Name">
                    {chipDetails.user.firstName && chipDetails.user.lastName
                      ? `${chipDetails.user.firstName} ${chipDetails.user.lastName}`
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">{chipDetails.user.email || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{chipDetails.user.phone || '-'}</Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            No chip details available
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CardSettings;
