import React, { useEffect, useMemo, useState, useRef } from 'react';
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

  const columns = [
    {
      title: 'No.',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      render: (text, record, index) => {
        return (pagination.page - 1) * pagination.limit + index + 1;
      },
    },
    {
      title: 'User Name',
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
      title: 'User Email',
      dataIndex: ['user', 'email'],
      key: 'email',
      width: 200,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Device Name',
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
      title: 'Device Serial Number',
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
      title: 'Address',
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
      title: 'Unlock Type',
      dataIndex: 'unlockType',
      key: 'unlockType',
      width: 120,
      render: (text, record) => {
        const unlockType = text || record.unlockType;
        if (unlockType === undefined || unlockType === null) return '-';
        
        const typeName = getUnlockTypeName(unlockType);
        const typeLabels = {
          IC: 'IC Card',
          PASSWORD: 'Password',
          AUTH_CODE: 'Auth Code',
          BLUETOOTH: 'Bluetooth',
          ID: 'ID',
          QR: 'QR Code',
          FACE: 'Face Recognition',
          CPU_CARD: 'CPU Card',
          UNKNOWN: 'Unknown',
        };
        
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
        
        return (
          <Tag color={colors[typeName] || 'default'}>
            {typeLabels[typeName] || typeName}
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
          {
            href: '/',
            title: <HomeOutlined />,
          },
          {
            title: 'Access Control Mgt',
          },
          {
            title: 'Door Opening Record',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          Door Opening Record
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
              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No door opening records found.',
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
