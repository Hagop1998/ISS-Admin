import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Breadcrumb, message, Card, Tag } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { fetchUserHistory, setPage, setLimit } from '../store/slices/userHistorySlice';
import { fetchAddresses } from '../store/slices/addressSlice';
import { UnlockTypeEnum, getUnlockTypeName } from '../constants/enums';
import UserDetailsModal from '../components/Users/UserDetailsModal';

const { Title } = Typography;

const DoorOpeningRecord = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { history, loading, error, pagination } = useSelector((state) => state.userHistory);
  const { items: addresses, loading: addressesLoading } = useSelector((state) => state.addresses);
  const token = useSelector((state) => state.auth.token);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const lastFetchedAddressesRef = useRef(false);
  const lastFetchedHistoryRef = useRef({ page: null, limit: null });

  // Create a map of addressId to address for quick lookup
  const addressLookupMap = useMemo(() => {
    const map = {};
    if (Array.isArray(addresses)) {
      addresses.forEach((address) => {
        const id = address.id || address._id;
        if (id) {
          map[id] = address;
        }
      });
    } else if (addresses?.results && Array.isArray(addresses.results)) {
      addresses.results.forEach((address) => {
        const id = address.id || address._id;
        if (id) {
          map[id] = address;
        }
      });
    } else if (addresses?.data && Array.isArray(addresses.data)) {
      addresses.data.forEach((address) => {
        const id = address.id || address._id;
        if (id) {
          map[id] = address;
        }
      });
    }
    return map;
  }, [addresses]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Fetch addresses when component loads
  useEffect(() => {
    if (!token) {
      return;
    }

    // Prevent duplicate calls
    if (lastFetchedAddressesRef.current) {
      return;
    }

    lastFetchedAddressesRef.current = true;
    dispatch(fetchAddresses());
  }, [dispatch, token]);

  // Fetch user history when pagination changes
  useEffect(() => {
    if (!token) {
      return;
    }

    // Prevent duplicate calls with the same parameters
    const currentParams = {
      page: pagination.page,
      limit: pagination.limit,
    };

    const lastParams = lastFetchedHistoryRef.current;
    if (
      lastParams.page === currentParams.page &&
      lastParams.limit === currentParams.limit
    ) {
      return;
    }

    // Update last fetched params
    lastFetchedHistoryRef.current = currentParams;

    dispatch(fetchUserHistory({
      page: currentParams.page,
      limit: currentParams.limit,
    }));
  }, [dispatch, token, pagination.page, pagination.limit]);

  // Show error messages
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleTableChange = (newPagination) => {
    if (newPagination.current !== pagination.page) {
      dispatch(setPage(newPagination.current));
    }
    if (newPagination.pageSize !== pagination.limit) {
      dispatch(setLimit(newPagination.pageSize));
    }
  };

  const unlockTypeLabelKeys = {
    IC: 'unlockIC',
    PASSWORD: 'unlockPassword',
    AUTH_CODE: 'unlockAuthCode',
    BLUETOOTH: 'unlockBluetooth',
    ID: 'unlockID',
    QR: 'unlockQR',
    FACE: 'unlockFace',
    CPU_CARD: 'unlockCPUCard',
    UNKNOWN: 'unlockUnknown',
  };

  const columns = [
    {
      title: t('pages.doorOpeningRecord.colNo'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      render: (text, record, index) => {
        return (pagination.page - 1) * pagination.limit + index + 1;
      },
    },
    {
      title: t('pages.doorOpeningRecord.colUserName'),
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      ellipsis: true,
      render: (text, record) => {
        const userId = record.user?.id || record.user?._id || record.userId;
        let userName = text;
        if (!userName && record.user) {
          const user = record.user;
          userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || '-';
        }
        
        if (userId && userName && userName !== '-') {
          return (
            <span
              style={{ color: '#1890ff', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => {
                setSelectedUserId(userId);
                setIsUserDetailsModalOpen(true);
              }}
            >
              {userName}
            </span>
          );
        }
        return userName || '-';
      },
    },
    {
      title: t('pages.doorOpeningRecord.colUserEmail'),
      dataIndex: ['user', 'email'],
      key: 'email',
      width: 200,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: t('pages.doorOpeningRecord.colDeviceName'),
      dataIndex: ['device', 'name'],
      key: 'deviceName',
      width: 150,
      ellipsis: true,
      render: (text, record) => {
        if (text) return text;
        if (record.device) {
          return record.device.serialNumber || record.device.localId || '-';
        }
        return '-';
      },
    },
    {
      title: t('pages.doorOpeningRecord.colDeviceSerialNumber'),
      dataIndex: ['device', 'serialNumber'],
      key: 'serialNumber',
      width: 150,
      ellipsis: true,
      render: (text, record) => {
        if (text) return text;
        if (record.device) {
          return record.device.localId || record.device.serialNumber || '-';
        }
        return record.serialNumber || '-';
      },
    },
    {
      title: t('pages.doorOpeningRecord.colAddress'),
      dataIndex: ['device', 'addressId'],
      key: 'address',
      width: 200,
      ellipsis: true,
      render: (text, record) => {
        // Get addressId from device object
        const addressId = text || record?.device?.addressId;
        if (!addressId) return '-';
        
        const address = addressLookupMap[addressId];
        if (address) {
          return address.address || address.name || '-';
        }
        
        // If address not found in map, return addressId as fallback
        return `Address ID: ${addressId}`;
      },
    },
    // {
    //   title: 'Opening Time',
    //   dataIndex: 'openingTime',
    //   key: 'openingTime',
    //   width: 180,
    //   render: (text) => {
    //     if (!text) return '-';
    //     try {
    //       const date = new Date(text);
    //       return date.toLocaleString('en-US', {
    //         year: 'numeric',
    //         month: 'short',
    //         day: 'numeric',
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         second: '2-digit',
    //       });
    //     } catch {
    //       return text;
    //     }
    //   },
    // },
    // {
    //   title: 'Opening Date',
    //   dataIndex: 'openingDate',
    //   key: 'openingDate',
    //   width: 150,
    //   render: (text) => {
    //     if (!text) return '-';
    //     try {
    //       const date = new Date(text);
    //       return date.toLocaleDateString('en-US', {
    //         year: 'numeric',
    //         month: 'short',
    //         day: 'numeric',
    //       });
    //     } catch {
    //       return text;
    //     }
    //   },
    // },
    {
      title: t('pages.doorOpeningRecord.colUnlockType'),
      dataIndex: 'unlockType',
      key: 'unlockType',
      width: 120,
      render: (text, record) => {
        const unlockType = text || record.unlockType;
        if (unlockType === undefined || unlockType === null) return '-';
        
        const typeName = getUnlockTypeName(unlockType);
        const colors = {
          IC: 'blue',
          PASSWORD: 'orange',
          AUTH_CODE: 'purple',
          BLUETOOTH: 'cyan',
          ID: 'green',
          QR: 'magenta',
          FACE: 'geekblue',
          CPU_CARD: 'gold',
          UNKNOWN: 'default',
        };
        const labelKey = unlockTypeLabelKeys[typeName] || 'unlockUnknown';
        return (
          <Tag color={colors[typeName] || 'default'}>
            {t(`pages.doorOpeningRecord.${labelKey}`)}
          </Tag>
        );
      },
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   key: 'status',
    //   width: 100,
    //   render: (text) => {
    //     if (!text) return '-';
    //     return text;
    //   },
    // },
  ];

  return (
    <div className="p-4 sm:p-6 pt-16 lg:pt-6 max-w-full overflow-x-hidden">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { href: '/', title: <HomeOutlined /> },
          { title: t('pages.doorOpeningRecord.breadcrumbReports') },
          { title: t('pages.doorOpeningRecord.breadcrumbList') },
        ]}
        style={{ marginBottom: 24 }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          {t('pages.doorOpeningRecord.title')}
        </Title>
      </div>

      {/* Door Opening History Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={history}
          rowKey={(record) => record.id || record._id || Math.random()}
          loading={loading || addressesLoading}
          bordered={true}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) =>
              t('common.showingEntries', { from: range[0], to: range[1], total }),
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: t('pages.doorOpeningRecord.noRecords'),
          }}
        />
      </Card>

      {/* User Details Modal */}
      <UserDetailsModal
        open={isUserDetailsModalOpen}
        onCancel={() => {
          setIsUserDetailsModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onUserDeleted={() => {
          dispatch(fetchUserHistory({
            page: pagination.page,
            limit: pagination.limit,
          }));
        }}
      />
    </div>
  );
};

export default DoorOpeningRecord;
