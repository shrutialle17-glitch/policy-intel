import React from 'react';
import { Typography, Card, Row, Col, Statistic } from 'antd';
import { FileText, ShieldAlert, Bot, Search } from 'lucide-react';

const { Title, Text } = Typography;

const Dashboard = () => {
  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Policies Indexed" 
              value={128} 
              prefix={<FileText size={20} color="var(--primary)" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Recent Queries" 
              value={42} 
              prefix={<Bot size={20} color="var(--accent)" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Compliance Checks" 
              value={15} 
              prefix={<ShieldAlert size={20} color="var(--warning)" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Active Tenders" 
              value={8} 
              prefix={<Search size={20} color="var(--secondary)" />} 
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: '24px' }}>
        <Title level={4}>Recent Activity</Title>
        <Card>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Welcome to PolicyIntel Dashboard. Your activity will appear here.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
