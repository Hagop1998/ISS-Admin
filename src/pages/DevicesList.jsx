import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Breadcrumb, message, Popconfirm, Tooltip, Table } from 'antd';
import { HomeOutlined, DeleteOutlined, PlusOutlined, EditOutlined, UserOutlined, UnlockOutlined } from '@ant-design/icons';
import { fetchDevices, createDevice, updateDevice, deleteDevice } from '../store/slices/deviceSlice';
import { deviceService } from '../services/deviceService';
import DeviceUsersModal from '../components/Devices/DeviceUsersModal';
import AddDeviceModal from '../components/Devices/AddDeviceModal';

const { Title } = Typography;

const DevicesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error, pagination } = useSelector((state) => state.devices);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Fetch devices on mount
  useEffect(() => {
    dispatch(fetchDevices({ page: 1, limit: 10 }));
  }, [dispatch]);

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

  const handleDelete = async (device) => {
    try {
      const deviceId = device._id || device.id;
      await dispatch(deleteDevice(deviceId)).unwrap();
      message.success('Device deleted successfully');
      dispatch(fetchDevices({ page: pagination.currentPage, limit: pagination.itemsPerPage }));
    } catch (error) {
      message.error(error || 'Failed to delete device');
    }
  };

  const handleAdd = async (values) => {
    try {
      const managerId = user?.id || user?._id || 1;
      
      const deviceData = {
        managerId: Number(managerId),
        addressId: Number(values.addressId),
        localId: String(values.localId || ''),
        deviceType: String(values.deviceType || 'door'),
        sector: String(values.sector || ''),
        sectorPassword: String(values.sectorPassword || ''),
        // Remove isEnabled as it's not allowed in the API
      };
      
      await dispatch(createDevice(deviceData)).unwrap();
      message.success('Device created successfully');
      setIsAddModalOpen(false);
      dispatch(fetchDevices({ page: pagination.currentPage, limit: pagination.itemsPerPage }));
    } catch (error) {
      const errorMsg = error?.message || error?.toString() || 'Failed to create device';
      message.error(errorMsg);
    }
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (values) => {
    try {
      const deviceId = editingDevice._id || editingDevice.id;
      const managerId = user?.id || user?._id || 1;
      
      const deviceData = {
        managerId: Number(managerId),
        addressId: Number(values.addressId),
        localId: String(values.localId || ''),
        deviceType: String(values.deviceType || 'door'),
        sector: String(values.sector || ''),
        sectorPassword: String(values.sectorPassword || ''),
        // Remove isEnabled as it's not allowed in the API
      };
      
      await dispatch(updateDevice({ id: deviceId, deviceData })).unwrap();
      message.success('Device updated successfully');
      setIsEditModalOpen(false);
      setEditingDevice(null);
      dispatch(fetchDevices({ page: pagination.currentPage, limit: pagination.itemsPerPage }));
    } catch (error) {
      const errorMsg = error?.message || error?.toString() || 'Failed to update device';
      message.error(errorMsg);
    }
  };

  const handleViewUsers = (device) => {
    setSelectedDevice(device);
    setIsUsersModalOpen(true);
  };

  const handleUnlockDoor = async (device) => {
    const localId = device.localId;
    if (!localId) {
      message.error('Device local ID is missing');
      return;
    }

    try {
      await deviceService.unlockDevice(localId);
      message.success('Door unlocked successfully');
    } catch (error) {
      message.error(error.message || 'Failed to unlock door');
    }
  };

  const columns = [
    {
      title: 'Local ID',
      dataIndex: 'localId',
      key: 'localId',
      render: (text) => text || '-',
    },
    {
      title: 'Device Type',
      dataIndex: 'deviceType',
      key: 'deviceType',
      render: (text) => text || '-',
    },
    {
      title: 'Sector',
      dataIndex: 'sector',
      key: 'sector',
      render: (text) => text || '-',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const isOnline = record.isOnline;
        const isEnabled = record.isEnabled;
        return (
          <Space direction="vertical" size="small">
            <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <span className={isEnabled ? 'text-blue-600' : 'text-gray-600'}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Address',
      dataIndex: ['address', 'address'],
      key: 'address',
      render: (text, record) => {
        const address = record.address;
        return address?.address || address?.name || '-';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Open Door">
            <Button
              type="text"
              icon={<UnlockOutlined />}
              onClick={() => handleUnlockDoor(record)}
              size="small"
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="View Users">
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => handleViewUsers(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit Device">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this device?"
            description="Are you sure you want to delete this device?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Device">
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
            title: 'Device Manager',
          },
          {
            title: 'Devices',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          Devices
        </Title>
        <Space size="middle">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Device
          </Button>
        </Space>
      </div>

      {/* Devices Table */}
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} devices`,
            onChange: (page, pageSize) => {
              dispatch(fetchDevices({ page, limit: pageSize }));
            },
          }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No devices found. Click "+ Add Device" to create one.',
          }}
        />
      </Card>

      {/* Add Device Modal */}
      <AddDeviceModal
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        mode="add"
        onSubmit={handleAdd}
      />

      {/* Edit Device Modal */}
      <AddDeviceModal
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingDevice(null);
        }}
        mode="edit"
        initialValues={editingDevice}
        onSubmit={handleUpdate}
      />

      {/* Device Users Modal */}
      <DeviceUsersModal
        open={isUsersModalOpen}
        onCancel={() => {
          setIsUsersModalOpen(false);
          setSelectedDevice(null);
        }}
        device={selectedDevice}
      />
    </div>
  );
};

export default DevicesList;

