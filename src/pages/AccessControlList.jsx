import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Typography, Breadcrumb, message, Popconfirm, Tag, Dropdown, Tooltip, Card } from 'antd';
import { HomeOutlined, ReloadOutlined, DeleteOutlined, EditOutlined, PlusOutlined, DownOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { setPage, setItemsPerPage, deleteItem, setSelectedItems, fetchDevices } from '../store/slices/accessControlSlice';
import { restartDevice, createDevice, updateDevice } from '../store/slices/deviceSlice';
import FilterBar from '../components/AccessControl/FilterBar';
import AddAccessControlModal from '../components/AccessControl/AddAccessControlModal';
import DeviceUsersModal from '../components/Devices/DeviceUsersModal';

const { Title } = Typography;

const AccessControlList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, selectedItems, pagination, filters, devicesLoading, devicesError } = useSelector((state) => state.accessControl);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    dispatch(fetchDevices({
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
    }));
  }, [dispatch, pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Show error messages
  useEffect(() => {
    if (devicesError) {
      message.error(devicesError);
    }
  }, [devicesError]);

  const handleTableChange = (newPagination) => {
    if (newPagination.current !== pagination.currentPage) {
      dispatch(setPage(newPagination.current));
    }
    if (newPagination.pageSize !== pagination.itemsPerPage) {
      dispatch(setItemsPerPage(newPagination.pageSize));
    }
  };

  const handleDelete = (record) => {
    dispatch(deleteItem(record.id));
    message.success('Access control device deleted successfully');
  };

  const handleEdit = (record) => {
    setEditingDevice(record);
    setIsEditModalOpen(true);
  };

  const handleViewUsers = (record) => {
    setSelectedDevice(record);
    setIsUsersModalOpen(true);
  };

  const handleCustomSettings = (record) => {
    const deviceId = record.id || record._id;
    if (deviceId) {
      navigate(`/access-control/configure/${deviceId}`);
    } else {
      message.error('Device ID is missing');
    }
  };

  const remoteMenuItems = [
    {
      key: '1',
      label: 'Restart',
    },
    {
      key: '2',
      label: 'Disable',
    },
    {
      key: '3',
      label: 'Enable',
    },
    {
      key: '4',
      label: 'Set Sector',
    },
    {
      key: '5',
      label: 'Set Permissions Value',
    },
    {
      key: '6',
      label: 'Upgrade Firmware',
    },
    {
      key: '7',
      label: 'Upgrade Configuration Table',
    },
    {
      key: '8',
      label: 'Remote Setup',
    },
    {
      key: '9',
      label: 'Re-issuing Faces',
    },
    {
      key: '10',
      label: 'Check Face Status',
    },
  ];

  const handleRemoteAction = async (action, record) => {
    try {
      if (action === 'Restart') {
        // Use localId from record (mapped from API response)
        const localId = record.localId || record.serialNumber || '001';
        
        message.loading({ content: 'Restarting device...', key: 'restart' });
        const result = await dispatch(restartDevice(localId)).unwrap();
        message.success({ content: result.message || 'Device restarted successfully', key: 'restart' });
      } else {
        // For other actions, show info message (to be implemented later)
        message.info(`${action} for device ${record.serialNumber}`);
      }
    } catch (error) {
      message.error({ content: error.message || `Failed to ${action.toLowerCase()} device`, key: 'restart' });
    }
  };

  const columns = [
    {
      title: 'N',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center',
      fixed: 'left',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Community Name',
      dataIndex: 'communityName',
      key: 'communityName',
      width: 150,
      ellipsis: { showTitle: true },
    },
    {
      title: 'Installation Position',
      dataIndex: 'installationPosition',
      key: 'installationPosition',
      width: 150,
      ellipsis: { showTitle: true },
    },
    {
      title: 'Access Control Name',
      dataIndex: 'accessControlName',
      key: 'accessControlName',
      width: 150,
      ellipsis: { showTitle: true },
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 160,
      ellipsis: { showTitle: true },
    },
    {
      title: 'Permission Values',
      dataIndex: 'permissionValues',
      key: 'permissionValues',
      width: 120,
      align: 'center',
      ellipsis: { showTitle: true },
    },
    {
      title: 'Last Online Time',
      dataIndex: 'lastOnlineTime',
      key: 'lastOnlineTime',
      width: 180,
      ellipsis: { showTitle: true },
      render: (text) => {
        // Remove [1] prefix if present
        if (text && text.startsWith('[1] ')) {
          return text.substring(4);
        }
        return text || '-';
      },
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      width: 100,
      ellipsis: { showTitle: true },
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      align: 'center',
      render: (state) => {
        const isOnline = state === 'Online';
        return (
          <Tag color={isOnline ? 'success' : 'error'} style={{ margin: 0 }}>
            {state || 'Offline'}
          </Tag>
        );
      },
    },
    {
      title: 'Operation',
      key: 'operation',
      width: 320,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const isOnline = record.state === 'Online';
        return (
          <Space size="small" wrap>
            <Tooltip title="View Users">
              <Button
                type="text"
                size="small"
                icon={<UserOutlined />}
                onClick={() => handleViewUsers(record)}
                style={{ color: '#3C0056' }}
              />
            </Tooltip>
            <Tooltip title="Custom Settings">
              <Button
                type="default"
                size="small"
                icon={<SettingOutlined />}
                onClick={() => handleCustomSettings(record)}
                style={{ 
                  borderColor: '#3C0056',
                  color: '#3C0056'
                }}
              >
                Custom Settings
              </Button>
            </Tooltip>
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ 
                backgroundColor: '#3C0056',
                borderColor: '#3C0056'
              }}
            >
              Edit
            </Button>
            {isOnline && (
              <Dropdown
                menu={{
                  items: remoteMenuItems.map(item => ({
                    ...item,
                    onClick: () => handleRemoteAction(item.label, record),
                  })),
                }}
                trigger={['click']}
              >
                <Button 
                  size="small"
                  style={{
                    borderColor: '#3C0056',
                    color: '#3C0056'
                  }}
                >
                  Remote <DownOutlined />
                </Button>
              </Dropdown>
            )}
            <Popconfirm
              title="Delete this access control device?"
              description="Are you sure you want to delete this entry?"
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedItems,
    onChange: (selectedRowKeys) => {
      dispatch(setSelectedItems(selectedRowKeys));
    },
  };

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
            title: 'Access Control Mgt',
          },
          {
            title: 'Access Control List',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          Access Control List
        </Title>
        <Space size="middle">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Access Control
          </Button>
          {/* <Button
            icon={<ReloadOutlined />}
            size="large"
            onClick={() => dispatch(fetchDevices({
              page: pagination.currentPage,
              limit: pagination.itemsPerPage,
            }))}
            loading={devicesLoading}
          >
            Refresh
          </Button> */}
        </Space>
      </div>

      {/* Filter Bar */}
      <div style={{ marginBottom: 16 }}>
        <FilterBar />
      </div>

      {/* Access Control Devices Table */}
      <Card
        className="shadow-md"
        bodyStyle={{ padding: 0 }}
        headStyle={{ 
          backgroundColor: '#f8f9fa', 
          borderBottom: '2px solid #3C0056',
          padding: '16px 24px'
        }}
      >
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          rowSelection={rowSelection}
          loading={devicesLoading}
          bordered={false}
          pagination={{
            current: pagination.currentPage,
            pageSize: pagination.itemsPerPage,
            total: pagination.totalItems,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
            pageSizeOptions: ['10', '20', '50', '100'],
            style: { padding: '16px 24px' },
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          className="access-control-table"
          size="middle"
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />
      </Card>

      {/* Add Access Control Modal */}
      <AddAccessControlModal
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        mode="add"
        onSubmit={async (values) => {
          try {
            const managerId = user?.id || 1; // Get managerId from auth user or default to 1

            // Map form values to API request structure - ensure correct types
            const deviceData = {
              managerId: Number(managerId), // Ensure it's a number
              addressId: Number(values.community), // Ensure it's a number
              localId: String(values.serialNumber || ''), // Ensure it's a string
              sector: String(values.sector || 'Sector1'), // Ensure it's a string
              sectorPassword: String(values.sectorPassword || 'ABCDEF123456'), // Ensure it's a string
              deviceType: String(values.deviceType || 'door'), // Ensure it's a string
            };

            message.loading({ content: 'Creating device...', key: 'create' });
            await dispatch(createDevice(deviceData)).unwrap();
            message.success({ content: 'Access control device created successfully', key: 'create' });
            setIsAddModalOpen(false);
            
            // Refresh the device list
            dispatch(fetchDevices({
              page: pagination.currentPage,
              limit: pagination.itemsPerPage,
            }));
          } catch (error) {
            message.error({ content: error.message || 'Failed to create access control device', key: 'create' });
          }
        }}
      />

      {/* Edit Access Control Modal */}
      <AddAccessControlModal
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingDevice(null);
        }}
        mode="edit"
        deviceId={editingDevice?.id}
        onSubmit={async (values) => {
          try {
            const managerId = user?.id || 1; // Get managerId from auth user or default to 1

            // Map form values to API request structure - ensure correct types
            const deviceData = {
              managerId: Number(managerId), // Ensure it's a number
              addressId: Number(values.community), // Ensure it's a number
              localId: String(values.serialNumber || ''), // Ensure it's a string
              sector: String(values.sector || 'Sector1'), // Ensure it's a string
              sectorPassword: String(values.sectorPassword || 'ABCDEF123456'), // Ensure it's a string
              deviceType: String(values.deviceType || 'door'), // Ensure it's a string
            };

            message.loading({ content: 'Updating device...', key: 'update' });
            await dispatch(updateDevice({ id: editingDevice.id, deviceData })).unwrap();
            message.success({ content: 'Access control device updated successfully', key: 'update' });
            setIsEditModalOpen(false);
            setEditingDevice(null);
            
            // Refresh the device list
            dispatch(fetchDevices({
              page: pagination.currentPage,
              limit: pagination.itemsPerPage,
            }));
          } catch (error) {
            message.error({ content: error.message || 'Failed to update access control device', key: 'update' });
          }
        }}
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

export default AccessControlList;
