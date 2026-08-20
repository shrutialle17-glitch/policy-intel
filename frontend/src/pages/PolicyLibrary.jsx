import React from 'react';
import { Card, Typography, Empty, Button, Input } from 'antd';
import { Search } from 'lucide-react';

const { Title } = Typography;

const PolicyLibrary = () => {
  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Input 
            size="large" 
            placeholder="Search policies, guidelines, circulars..." 
            prefix={<Search size={18} color="var(--text-secondary)" />}
            style={{ flex: 1 }}
          />
          <Button type="primary" size="large">Search</Button>
        </div>
      </Card>

      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No policies found. Configure backend connection to fetch policies."
        />
      </Card>
    </div>
  );
};

export default PolicyLibrary;
