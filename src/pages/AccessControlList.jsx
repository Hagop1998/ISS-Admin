import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Table, Button, Space, Typography, Breadcrumb, message, Popconfirm, Tag, Dropdown, Tooltip, Card, Modal } from 'antd';
import { HomeOutlined, ReloadOutlined, DeleteOutlined, EditOutlined, DownOutlined, UserOutlined, SettingOutlined, MenuOutlined, UnlockOutlined, EyeOutlined, DisconnectOutlined } from '@ant-design/icons';
import { setPage, setItemsPerPage, deleteItem, setSelectedItems, fetchAddresses } from '../store/slices/accessControlSlice';
import { restartDevice, updateDevice, unlockDevice } from '../store/slices/deviceSlice';
import { updateAddress } from '../store/slices/addressSlice';
import FilterBar from '../components/AccessControl/FilterBar';
import AddAccessControlModal from '../components/AccessControl/AddAccessControlModal';
import DeviceUsersModal from '../components/Devices/DeviceUsersModal';
import DeviceDetailsModal from '../components/Devices/DeviceDetailsModal';

const { Title } = Typography;

const AccessControlList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, selectedItems, pagination, filters, addressesLoading, addressesError } = useSelector((state) => state.accessControl);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [editingDevice, setEditingDevice] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const lastFetchedRef = React.useRef({ page: null, limit: null });

  useEffect(() => {
    const currentPage = pagination.currentPage;
    const currentLimit = pagination.itemsPerPage;
    
    // Prevent duplicate calls from React.StrictMode double render
    if (
      lastFetchedRef.current.page === currentPage &&
      lastFetchedRef.current.limit === currentLimit
    ) {
      return;
    }
    
    lastFetchedRef.current = { page: currentPage, limit: currentLimit };
    
    // Fetch addresses with pagination (devices are included in address response)
    // Only fetch with limit=10 as requested
    dispatch(fetchAddresses({
      page: currentPage,
      limit: currentLimit,
    }));
  }, [dispatch, pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (addressesError) {
      message.error(addressesError);
    }
  }, [addressesError]);

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
    message.success(t('pages.accessControl.msgDeleted'));
  };

  const handleEdit = (record) => {
    setEditingDevice(record);
    setIsEditModalOpen(true);
  };

  const handleViewUsers = (record) => {
    setSelectedDevice(record);
    setIsUsersModalOpen(true);
  };

  const handleViewDetails = (record) => {
    const deviceId = record.id || record._id;
    if (deviceId) {
      setSelectedDeviceId(deviceId);
      setIsDetailsModalOpen(true);
    } else {
      message.error(t('pages.accessControl.msgDeviceIdMissing'));
    }
  };

  const handleCustomSettings = (record) => {
    const deviceId = record.id || record._id;
    if (deviceId) {
      navigate(`/access-control/custom-settings/${deviceId}`);
    } else {
      message.error(t('pages.accessControl.msgDeviceIdMissing'));
    }
  };

  const handleUnlockDoor = async (record) => {
    const localId = record.localId || record.serialNumber;
    if (!localId) {
      message.error(t('pages.accessControl.msgLocalIdMissing'));
      return;
    }

    try {
      message.loading({ content: t('pages.accessControl.msgOpeningDoor'), key: 'unlock' });
      await dispatch(unlockDevice(localId)).unwrap();
      message.success({ content: t('pages.accessControl.msgDoorOpened'), key: 'unlock' });
    } catch (error) {
      message.error({ content: error.message || t('pages.accessControl.msgFailedOpenDoor'), key: 'unlock' });
    }
  };

  const handleUnassignAddress = async (record) => {
    const addressId = record.addressId || record.address?.id || record.address?._id;
    if (!addressId) {
      message.error('Address ID is missing');
      return;
    }

    Modal.confirm({
      title: t('pages.accessControl.unassignConfirmTitle'),
      content: t('pages.accessControl.unassignConfirmContent'),
      okText: t('common.yes'),
      cancelText: t('common.no'),
      okType: 'danger',
      onOk: async () => {
        try {
          message.loading({ content: t('pages.accessControl.msgUnassigning'), key: 'unassign' });
          await dispatch(updateAddress({ 
            id: addressId, 
            addressData: { managerId: null } 
          })).unwrap();
          message.success({ content: t('pages.accessControl.msgUnassigned'), key: 'unassign' });
          
          // Refresh the list
          dispatch(fetchAddresses({
            page: pagination.currentPage,
            limit: pagination.itemsPerPage,
          }));
        } catch (error) {
          message.error({ content: error.message || t('pages.accessControl.msgFailedUnassign'), key: 'unassign' });
        }
      },
    });
  };

  const remoteMenuItems = [
    { key: '1', labelKey: 'restart' },
    { key: '2', labelKey: 'disable' },
    { key: '3', labelKey: 'enable' },
    { key: '4', labelKey: 'setSector' },
    { key: '5', labelKey: 'setPermissionsValue' },
    { key: '6', labelKey: 'upgradeFirmware' },
    { key: '7', labelKey: 'upgradeConfigTable' },
    { key: '8', labelKey: 'remoteSetup' },
    { key: '9', labelKey: 'reissuingFaces' },
    { key: '10', labelKey: 'checkFaceStatus' },
  ];

  const handleRemoteAction = async (labelKey, record) => {
    try {
      if (labelKey === 'restart') {
        const localId = record.localId || record.serialNumber || '001';
        message.loading({ content: t('pages.accessControl.msgRestarting'), key: 'restart' });
        const result = await dispatch(restartDevice(localId)).unwrap();
        message.success({ content: result.message || t('pages.accessControl.msgRestarted'), key: 'restart' });
      } else {
        message.info(`${t(`pages.accessControl.${labelKey}`)} for device ${record.serialNumber}`);
      }
    } catch (error) {
      message.error({ content: error.message || t('pages.accessControl.msgRestarted'), key: 'restart' });
    }
  };

  const columns = [
    {
      title: t('pages.accessControl.colN'),
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center',
      fixed: 'left',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t('pages.accessControl.colCommunityName'),
      dataIndex: 'communityName',
      key: 'communityName',
      width: 150,
      ellipsis: { showTitle: true },
    },
    {
      title: t('pages.accessControl.colDeviceType'),
      key: 'deviceType',
      width: 180,
      ellipsis: { showTitle: true },
      render: (_, record) => record.deviceType || '-',
    },
    {
      title: t('pages.accessControl.colAccessControlName'),
      dataIndex: 'accessControlName',
      key: 'accessControlName',
      width: 150,
      ellipsis: { showTitle: true },
    },
    {
      title: t('pages.accessControl.colSerialNumber'),
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 160,
      ellipsis: { showTitle: true },
    },
    {
      title: t('pages.accessControl.colState'),
      dataIndex: 'state',
      key: 'state',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const isOnline = record.isOnline === true || record.device?.isOnline === true;
        return (
          <Tag color={isOnline ? 'success' : 'error'} style={{ margin: 0 }}>
            {isOnline ? t('common.online') : t('common.offline')}
          </Tag>
        );
      },
    },
    {
      title: t('pages.accessControl.colOperation'),
      key: 'operation',
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const isOnline = record.state === 'Online';
        
        const menuItems = [
          {
            key: 'viewDetails',
            label: t('pages.accessControl.viewDetails'),
            icon: <EyeOutlined />,
            onClick: () => handleViewDetails(record),
          },
          {
            key: 'viewUsers',
            label: t('pages.accessControl.viewUsers'),
            icon: <UserOutlined />,
            onClick: () => handleViewUsers(record),
          },
          {
            key: 'doorOpen',
            label: t('pages.accessControl.doorOpen'),
            icon: <UnlockOutlined />,
            onClick: () => handleUnlockDoor(record),
          },
          {
            key: 'customSettings',
            label: t('pages.accessControl.customSettings'),
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
            label: t('pages.accessControl.assignToAddress'),
            icon: <EditOutlined />,
            onClick: () => handleEdit(record),
          },
          {
            key: 'unassign',
            label: t('pages.accessControl.unassignAddress'),
            icon: <DisconnectOutlined />,
            onClick: () => handleUnassignAddress(record),
          },
        ];

        if (isOnline) {
          menuItems.push({
            key: 'remote',
            label: t('pages.accessControl.remote'),
            icon: <DownOutlined />,
            children: remoteMenuItems.map(item => ({
              key: item.key,
              label: t(`pages.accessControl.${item.labelKey}`),
              onClick: () => handleRemoteAction(item.labelKey, record),
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
              <DeleteOutlined /> {t('common.delete')}
            </span>
          ),
          danger: true,
          onClick: () => {
            Modal.confirm({
              title: t('pages.accessControl.deleteConfirmTitle'),
              content: t('pages.accessControl.deleteConfirmContent'),
              okText: t('common.yes'),
              cancelText: t('common.no'),
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
          { href: '/', title: <HomeOutlined /> },
          { title: t('pages.accessControl.breadcrumbMgt') },
          { title: t('pages.accessControl.breadcrumbList') },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          {t('pages.accessControl.title')}
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
          loading={addressesLoading}
          bordered={false}
          pagination={{
            current: pagination.currentPage,
            pageSize: pagination.itemsPerPage,
            total: pagination.totalItems,
            showSizeChanger: true,
            showTotal: (total, range) => t('common.showingEntries', { from: range[0], to: range[1], total }),
            pageSizeOptions: ['10', '20', '50', '100'],
            style: { padding: '16px 24px' },
          }}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: (e) => {
              // Don't trigger if clicking on checkbox, button, or dropdown
              if (
                e.target.closest('.ant-checkbox-wrapper') ||
                e.target.closest('button') ||
                e.target.closest('.ant-dropdown') ||
                e.target.closest('.ant-dropdown-trigger')
              ) {
                return;
              }
              handleViewDetails(record);
            },
            style: { cursor: 'pointer' },
          })}
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
        deviceData={editingDevice}
        onSubmit={async (values) => {
          try {
            const managerId = user?.id || 1;
            
            // Handle settings - it should already be parsed by the modal, but ensure it's an object
            let settings = {};
            if (values.settings) {
              if (typeof values.settings === 'string') {
                try {
                  settings = JSON.parse(values.settings);
                } catch (e) {
                  message.error(t('pages.accessControl.msgInvalidJson'));
                  return;
                }
              } else if (typeof values.settings === 'object') {
                settings = values.settings;
              }
            }
            
            const deviceData = {
              managerId: Number(managerId), 
              addressId: Number(values.community), 
              localId: String(values.localId || ''), 
              sector: String(values.sector || 'Sector1'), 
              sectorPassword: String(values.sectorPassword || 'ABCDEF123456'), 
              deviceType: String(values.deviceType || 'door'), 
              settings: settings,
            };

            message.loading({ content: t('pages.accessControl.msgAssigningDevice'), key: 'update' });
            
            // Update the device
            await dispatch(updateDevice({ id: editingDevice.id, deviceData })).unwrap();
            
            // Also update the address's managerId
            const addressId = Number(values.community);
            await dispatch(updateAddress({ 
              id: addressId, 
              addressData: { managerId: Number(managerId) } 
            })).unwrap();
            
            message.success({ content: t('pages.accessControl.msgDeviceAssigned'), key: 'update' });
            setIsEditModalOpen(false);
            setEditingDevice(null);
            
            dispatch(fetchAddresses({
              page: pagination.currentPage,
              limit: pagination.itemsPerPage,
            }));
          } catch (error) {
            message.error({ content: error.message || t('pages.accessControl.msgFailedUpdate'), key: 'update' });
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

      <DeviceDetailsModal
        open={isDetailsModalOpen}
        onCancel={() => {
          setIsDetailsModalOpen(false);
          setSelectedDeviceId(null);
        }}
        deviceId={selectedDeviceId}
      />
    </div>
  );
};

export default AccessControlList;
