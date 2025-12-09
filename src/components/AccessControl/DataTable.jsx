import React from 'react';
import { Table, Button, Space, Tag, Dropdown, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedItems, deleteItem } from '../../store/slices/accessControlSlice';

const DataTable = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.accessControl.items);
  const selectedItems = useSelector((state) => state.accessControl.selectedItems);

  const handleDelete = (id) => {
    dispatch(deleteItem(id));
  };

  const remoteMenuItems = [
    {
      key: '1',
      label: 'Open Door',
    },
    {
      key: '2',
      label: 'Close Door',
    },
    {
      key: '3',
      label: 'Reset Device',
    },
  ];

  const columns = [
    {
      title: 'No.',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Community Name',
      dataIndex: 'communityName',
      key: 'communityName',
      width: 150,
    },
    {
      title: 'Installation Position',
      dataIndex: 'installationPosition',
      key: 'installationPosition',
      width: 150,
    },
    {
      title: 'Access Control Name',
      dataIndex: 'accessControlName',
      key: 'accessControlName',
      width: 150,
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 180,
    },
    {
      title: 'Permission Values',
      dataIndex: 'permissionValues',
      key: 'permissionValues',
      width: 150,
    },
    {
      title: 'Last Online Time',
      dataIndex: 'lastOnlineTime',
      key: 'lastOnlineTime',
      width: 200,
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      width: 100,
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state) => (
        <Tag color={state === 'Online' ? 'success' : 'error'}>
          {state}
        </Tag>
      ),
    },
    {
      title: 'Operation',
      key: 'operation',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            ghost
          />
          <Popconfirm
            title="Delete Access Control"
            description="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
          {record.state === 'Online' && (
            <Dropdown
              menu={{ items: remoteMenuItems }}
              trigger={['click']}
            >
              <Button size="small" type="primary">
                Remote <DownOutlined />
              </Button>
            </Dropdown>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedItems,
    onChange: (selectedRowKeys) => {
      dispatch(setSelectedItems(selectedRowKeys));
    },
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={items}
        rowKey="id"
        scroll={{ x: 1500 }}
        pagination={{
          position: ['bottomCenter'],
          showSizeChanger: true,
          showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} / ${total} entries`,
        }}
      />
    </div>
  );
};

export default DataTable;
