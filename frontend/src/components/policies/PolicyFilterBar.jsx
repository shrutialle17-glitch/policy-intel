import React from 'react';
import { Input, Select, Button } from 'antd';
import { Search } from 'lucide-react';

const { Option } = Select;

export const POLICY_CATEGORIES = [
  'Procurement',
  'Tendering',
  'Vendor Selection',
  'Contract Management',
  'Financial Compliance',
  'Evaluation',
  'General'
];

const PolicyFilterBar = ({ 
  filters, 
  onFilterChange, 
  onSearch, 
  userRole,
  onClear,
  totalCount
}) => {
  const handleSearch = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <Input
        size="large"
        placeholder="Search policies, regulations, guidelines..."
        prefix={<Search size={20} color="var(--text-secondary)" style={{ marginRight: '8px' }} />}
        value={filters.search}
        onChange={handleSearch}
        style={{ width: '100%', borderRadius: '8px', padding: '12px 16px', fontSize: '16px', marginBottom: '12px' }}
        allowClear
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          <span style={{ fontWeight: 600 }}>{totalCount || 0}</span> policies available · Updated regularly
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Select
            placeholder="All Departments"
            style={{ width: 160 }}
            allowClear
          >
            <Option value="mod">Ministry of Data</Option>
            <Option value="mof">Ministry of Finance</Option>
          </Select>
          <Select
            placeholder="Category"
            value={filters.category || undefined}
            onChange={(val) => onFilterChange('category', val)}
            style={{ width: 160 }}
            allowClear
          >
            {POLICY_CATEGORIES.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
          <Select
            placeholder="Year"
            style={{ width: 100 }}
            allowClear
          >
            <Option value="2026">2026</Option>
            <Option value="2025">2025</Option>
            <Option value="2024">2024</Option>
          </Select>
          {userRole === 'ADMIN' && (
            <Select
              placeholder="Status"
              value={filters.status || undefined}
              onChange={(val) => onFilterChange('status', val)}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="DRAFT">DRAFT</Option>
              <Option value="PROCESSING">PROCESSING</Option>
              <Option value="READY">READY</Option>
              <Option value="FAILED">FAILED</Option>
              <Option value="ARCHIVED">ARCHIVED</Option>
            </Select>
          )}
          <Button onClick={onClear}>Clear</Button>
        </div>
      </div>
    </div>
  );
};

export default PolicyFilterBar;
