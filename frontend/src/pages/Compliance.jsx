import React from 'react';
import { Card, Typography, Empty, Button, Upload } from 'antd';
import { ShieldAlert, UploadCloud } from 'lucide-react';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const Compliance = () => {
  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <ShieldAlert size={32} color="var(--warning)" />
          <div>
            <Title level={4} style={{ margin: 0 }}>Compliance Intelligence</Title>
            <Text type="secondary">Upload a tender, contract, or proposal to verify its compliance against official government policies.</Text>
          </div>
        </div>

        <Dragger multiple={false}>
          <p className="ant-upload-drag-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <UploadCloud size={48} color="var(--warning)" />
          </p>
          <p className="ant-upload-text">Upload Document for Compliance Check</p>
          <p className="ant-upload-hint">
            The AI engine will analyze the document and provide a compliance score, warnings, and recommendations.
          </p>
        </Dragger>
      </Card>

      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No compliance reports generated yet."
        />
      </Card>
    </div>
  );
};

export default Compliance;
