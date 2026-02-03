import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Row, Col, Form } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter } from '../../store/slices/accessControlSlice';

const { Option } = Select;

const FilterBar = () => {
  const { t } = useTranslation();
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
            <Form.Item label={t('pages.accessControl.filterAddress')} style={{ marginBottom: 0 }}>
              <Select
                value={filters.address}
                onChange={(value) => handleFilterChange('address', value)}
                style={{ width: 200 }}
                loading={addressesLoading}
                placeholder={t('pages.accessControl.allAddresses')}
                allowClear
              >
                <Option value="all">{t('pages.accessControl.allAddresses')}</Option>
                {addresses.map((address) => (
                  <Option key={address.id || address._id} value={address.id || address._id}>
                    {address.address || address.name || address.title || 'Unknown'}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col flex="none">
            <Form.Item label={t('pages.accessControl.filterDeviceType')} style={{ marginBottom: 0 }}>
              <Select
                value={filters.deviceType}
                onChange={(value) => handleFilterChange('deviceType', value)}
                style={{ width: 200 }}
                placeholder={t('pages.accessControl.allDeviceTypes')}
                allowClear
              >
                <Option value="all">{t('pages.accessControl.allDeviceTypes')}</Option>
                {deviceTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col flex="none">
            <Form.Item label={t('pages.accessControl.filterStatus')} style={{ marginBottom: 0 }}>
              <Select
                value={filters.isOnline}
                onChange={(value) => handleFilterChange('isOnline', value)}
                style={{ width: 200 }}
                placeholder={t('pages.accessControl.allStatus')}
                allowClear
              >
                <Option value="all">{t('pages.accessControl.allStatus')}</Option>
                <Option value="online">{t('common.online')}</Option>
                <Option value="offline">{t('common.offline')}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default FilterBar;
