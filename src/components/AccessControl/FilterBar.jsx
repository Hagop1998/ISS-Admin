import React, { useEffect } from 'react';
import { Input, Select, Button, Checkbox, Space, Row, Col, Form } from 'antd';
import { SearchOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, fetchAddresses } from '../../store/slices/accessControlSlice';

const { Option } = Select;

const FilterBar = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.accessControl.filters);
  const { addresses, addressesLoading } = useSelector((state) => state.accessControl);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilter({ [key]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
      <Form layout="vertical" style={{ marginBottom: 0 }}>
        <Row gutter={[12, 12]} align="middle" justify="space-between">
          <Col flex="none">
            <Form.Item label="Keywords" style={{ marginBottom: 0 }}>
              <Input
                placeholder="Search..."
                value={filters.keywords}
                onChange={(e) => handleFilterChange('keywords', e.target.value)}
                allowClear
                style={{ width: 150 }}
              />
            </Form.Item>
          </Col>
          <Col flex="none">
            <Form.Item label="Community" style={{ marginBottom: 0 }}>
              <Select
                value={filters.community}
                onChange={(value) => handleFilterChange('community', value)}
                style={{ width: 150 }}
                loading={addressesLoading}
                placeholder="All Community"
              >
                <Option value="all">All Community</Option>
                {addresses.map((address) => (
                  <Option key={address.id || address._id} value={address.id || address._id}>
                    {address.name || address.title || address.address || JSON.stringify(address)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col flex="none">
            <Form.Item label="Access Control" style={{ marginBottom: 0 }}>
              <Select
                value={filters.accessControl}
                onChange={(value) => handleFilterChange('accessControl', value)}
                style={{ width: 150 }}
                placeholder="All Access Control"
              >
                <Option value="all">All Access Control</Option>
                <Option value="ac">AC</Option>
                <Option value="offline">Offline</Option>
                <Option value="online">Online</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col flex="none">
            <Form.Item label=" " colon={false} style={{ marginBottom: 0 }}>
              <Checkbox>Refresh Online Time</Checkbox>
            </Form.Item>
          </Col>
          <Col flex="none">
            <Form.Item label=" " colon={false} style={{ marginBottom: 0 }}>
              <Button type="primary" icon={<SearchOutlined />}>
                Search
              </Button>
            </Form.Item>
          </Col>
          <Col flex="none" style={{ marginLeft: 'auto' }}>
            <Form.Item label=" " colon={false} style={{ marginBottom: 0 }}>
              <Space>
                <Select
                  defaultValue="select"
                  style={{ width: 180 }}
                  placeholder="Select Operation..."
                >
                  <Option value="select">Select Operation...</Option>
                  <Option value="delete">Delete Selected</Option>
                  <Option value="export">Export Selected</Option>
                </Select>
                <Button type="primary" icon={<CheckOutlined />}>
                  Submit
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default FilterBar;
