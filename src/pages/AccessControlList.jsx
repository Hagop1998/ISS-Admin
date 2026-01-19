import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Typography, Breadcrumb, message, Popconfirm, Tag, Dropdown, Tooltip, Card, Modal } from 'antd';
import { HomeOutlined, ReloadOutlined, DeleteOutlined, EditOutlined, DownOutlined, UserOutlined, SettingOutlined, MenuOutlined, UnlockOutlined } from '@ant-design/icons';
import { setPage, setItemsPerPage, deleteItem, setSelectedItems, fetchDevices } from '../store/slices/accessControlSlice';
import { restartDevice, updateDevice, unlockDevice } from '../store/slices/deviceSlice';
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
      navigate(`/access-control/custom-settings/${deviceId}`);
    } else {
      message.error('Device ID is missing');
    }
  };

  const handleUnlockDoor = async (record) => {
    const localId = record.localId || record.serialNumber;
    if (!localId) {
      message.error('Device local ID is missing');
      return;
    }

    try {
      message.loading({ content: 'Opening door...', key: 'unlock' });
      await dispatch(unlockDevice(localId)).unwrap();
      message.success({ content: 'Door opened successfully', key: 'unlock' });
    } catch (error) {
      message.error({ content: error.message || 'Failed to open door', key: 'unlock' });
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
        const localId = record.localId || record.serialNumber || '001';
        
        message.loading({ content: 'Restarting device...', key: 'restart' });
        const result = await dispatch(restartDevice(localId)).unwrap();
        message.success({ content: result.message || 'Device restarted successfully', key: 'restart' });
      } else {
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
      title: 'Installation Position/Label',
      key: 'installationPositionLabel',
      width: 180,
      ellipsis: { showTitle: true },
      render: (_, record) => {
        const installationPosition = record.installationPosition || '-';
        const label = record.label || '-';
        return `${installationPosition}/${label}`;
      },
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
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const isOnline = record.state === 'Online';
        
        const menuItems = [
          {
            key: 'viewUsers',
            label: 'View Users',
            icon: <UserOutlined />,
            onClick: () => handleViewUsers(record),
          },
          {
            key: 'doorOpen',
            label: 'Door Open',
            icon: <UnlockOutlined />,
            onClick: () => handleUnlockDoor(record),
          },
          {
            key: 'customSettings',
            label: 'Custom Settings',
            icon: <SettingOutlined />,
            onClick: () => {
              const deviceId = record.id || record._id;
              if (deviceId) {
                navigate(`/access-control/custom-settings/${deviceId}`);
              } else {
                navigate('/access-control/custom-settings');
              }
            },
          },
          {
            key: 'edit',
            label: 'Assign to Address',
            icon: <EditOutlined />,
            onClick: () => handleEdit(record),
          },
        ];

        if (isOnline) {
          menuItems.push({
            key: 'remote',
            label: 'Remote',
            icon: <DownOutlined />,
            children: remoteMenuItems.map(item => ({
              key: item.key,
              label: item.label,
              onClick: () => handleRemoteAction(item.label, record),
            })),
          });
        }

        menuItems.push({
          type: 'divider',
        });
        menuItems.push({
          key: 'delete',
          label: (
            <span style={{ color: '#ff4d4f' }}>
              <DeleteOutlined /> Delete
            </span>
          ),
          danger: true,
          onClick: () => {
            Modal.confirm({
              title: 'Delete this access control device?',
              content: 'Are you sure you want to delete this entry?',
              okText: 'Yes',
              cancelText: 'No',
              okType: 'danger',
              onOk: () => handleDelete(record),
            });
          },
        });

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MenuOutlined />}
              size="small"
              style={{
                color: '#3C0056',
                border: '1px solid #d9d9d9',
              }}
            />
          </Dropdown>
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          Access Control List
        </Title>
      </div>

      <div style={{ marginBottom: 16 }}>
        <FilterBar />
      </div>

      <Card
        className="shadow-md"
        styles={{ 
          body: { padding: 0 },
          header: { 
            backgroundColor: '#f8f9fa', 
            borderBottom: '2px solid #3C0056',
            padding: '16px 24px'
          }
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
            const managerId = user?.id || 1; 
            const deviceData = {
              managerId: Number(managerId), 
              addressId: Number(values.community), 
              localId: String(values.serialNumber || ''), 
              sector: String(values.sector || 'Sector1'), 
              sectorPassword: String(values.sectorPassword || 'ABCDEF123456'), 
              deviceType: String(values.deviceType || 'door'), 
            };

            message.loading({ content: 'Assigning device to address...', key: 'update' });
            await dispatch(updateDevice({ id: editingDevice.id, deviceData })).unwrap();
            message.success({ content: 'Device assigned to address successfully', key: 'update' });
            setIsEditModalOpen(false);
            setEditingDevice(null);
            
            dispatch(fetchDevices({
              page: pagination.currentPage,
              limit: pagination.itemsPerPage,
            }));
          } catch (error) {
            message.error({ content: error.message || 'Failed to update access control device', key: 'update' });
          }
        }}
      />

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
