import React from 'react';
import { Card, Button, Empty, Upload } from 'antd';
import { UploadCloud } from 'lucide-react';

const { Dragger } = Upload;

const Documents = () => {
  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <Dragger multiple={false}>
          <p className="ant-upload-drag-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <UploadCloud size={48} color="var(--primary)" />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Upload policy documents, procurement guidelines, or contracts for analysis.
            (PDF, DOCX)
          </p>
        </Dragger>
      </Card>

      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No documents uploaded yet."
        />
      </Card>
    </div>
  );
};

export default Documents;
