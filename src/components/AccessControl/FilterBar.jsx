import React from 'react';
import { Select, Row, Col, Form } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter } from '../../store/slices/accessControlSlice';

const { Option } = Select;

const FilterBar = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.accessControl.filters);
  const { addresses, addressesLoading, allItems } = useSelector((state) => state.accessControl);

  const handleFilterChange = (key, value) => {
    dispatch(setFilter({ [key]: value }));
  };

  const deviceTypes = React.useMemo(() => {
    const types = new Set();
    allItems.forEach(item => {
      if (item.deviceType && item.deviceType !== '-') {
        types.add(item.deviceType);
      }
    });
    return Array.from(types).sort();
  }, [allItems]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
      <Form layout="vertical" style={{ marginBottom: 0 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col flex="none">
            <Form.Item label="Address" style={{ marginBottom: 0 }}>
              <Select
                value={filters.address}
                onChange={(value) => handleFilterChange('address', value)}
                style={{ width: 200 }}
                loading={addressesLoading}
                placeholder="All Addresses"
                allowClear
              >
                <Option value="all">All Addresses</Option>
                {addresses.map((address) => (
                  <Option key={address.id || address._id} value={address.id || address._id}>
                    {address.address || address.name || address.title || 'Unknown'}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col flex="none">
            <Form.Item label="Device Type" style={{ marginBottom: 0 }}>
              <Select
                value={filters.deviceType}
                onChange={(value) => handleFilterChange('deviceType', value)}
                style={{ width: 200 }}
                placeholder="All Device Types"
                allowClear
              >
                <Option value="all">All Device Types</Option>
                {deviceTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col flex="none">
            <Form.Item label="Status" style={{ marginBottom: 0 }}>
              <Select
                value={filters.isOnline}
                onChange={(value) => handleFilterChange('isOnline', value)}
                style={{ width: 200 }}
                placeholder="All Status"
                allowClear
              >
                <Option value="all">All Status</Option>
                <Option value="online">Online</Option>
                <Option value="offline">Offline</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default FilterBar;
