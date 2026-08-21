import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button, message, Typography } from 'antd';
import { FileText, Inbox, CheckCircle2, Loader2, FileCheck } from 'lucide-react';
import styled from 'styled-components';

const { Dragger } = Upload;
const { Text, Title } = Typography;

const ProcessingState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 0;
`;

const ProcessingItem = ({ text, active, completed }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: completed ? 'var(--success)' : active ? 'var(--primary)' : 'var(--text-secondary)' }}>
    {completed ? <CheckCircle2 size={20} /> : active ? <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--borders)' }} />}
    <span style={{ fontWeight: active || completed ? 600 : 400, fontSize: '15px' }}>{text}</span>
  </div>
);

const TenderUploadModal = ({ visible, onCancel, onUpload }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  // Add a fake progress timer to make the UI look like it's doing complex work
  const [progressStep, setProgressStep] = useState(0);

  const handleUpload = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        message.error('Please select a PDF file to upload.');
        return;
      }

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('file', fileList[0]);

      setUploading(true);
      setProgressStep(1);

      // Simulate steps for UI purposes
      const timer1 = setTimeout(() => setProgressStep(2), 1500);
      const timer2 = setTimeout(() => setProgressStep(3), 3000);

      await onUpload(formData);
      
      clearTimeout(timer1);
      clearTimeout(timer2);
      
      form.resetFields();
      setFileList([]);
      setProgressStep(0);
    } catch (err) {
      console.error('Validation or upload failed:', err);
    } finally {
      setUploading(false);
      setProgressStep(0);
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      setFileList(prev => prev.filter(item => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      if (file.type !== 'application/pdf') {
        message.error('Only PDF files are allowed');
        return Upload.LIST_IGNORE;
      }
      if (file.size > 20 * 1024 * 1024) {
        message.error('File must be smaller than 20MB');
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false; // Prevent automatic upload
    },
    fileList,
    maxCount: 1,
    showUploadList: false
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Modal
      title={uploading ? "Processing Tender..." : "Upload Tender"}
      open={visible}
      onCancel={() => {
        if (uploading) return;
        form.resetFields();
        setFileList([]);
        onCancel();
      }}
      closable={!uploading}
      maskClosable={!uploading}
      width={500}
      footer={uploading ? null : [
        <Button key="back" onClick={onCancel} style={{ borderRadius: '6px' }}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleUpload} style={{ borderRadius: '6px', background: 'var(--primary)' }}>
          Upload & Analyze
        </Button>
      ]}
    >
      <style>
        {`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}
      </style>

      {uploading ? (
        <ProcessingState>
          <ProcessingItem text="Uploading document" completed={progressStep > 1} active={progressStep === 1} />
          <ProcessingItem text="Extracting text and metadata" completed={progressStep > 2} active={progressStep === 2} />
          <ProcessingItem text="Indexing into Vector Database" completed={progressStep > 3} active={progressStep === 3} />
          <ProcessingItem text="Preparing for AI analysis" completed={false} active={progressStep >= 3} />
        </ProcessingState>
      ) : (
        <>
          <div style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
            Add a government tender for AI analysis.
          </div>
          <Form form={form} layout="vertical">
            <Form.Item 
              name="title" 
              label={<span style={{ fontWeight: 600 }}>Tender Title</span>}
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input placeholder="e.g. Highway Construction Tender 2026" size="large" style={{ borderRadius: '6px' }} />
            </Form.Item>
            
            <Form.Item 
              label={<span style={{ fontWeight: 600 }}>Tender Document</span>} 
              required
            >
              {fileList.length > 0 ? (
                <div style={{ border: '1px solid var(--borders)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--cards)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'rgba(22,163,74,0.1)', borderRadius: '6px' }}>
                      <FileCheck size={24} color="var(--success)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--main-text)' }}>{fileList[0].name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {formatSize(fileList[0].size)} <span style={{ color: 'var(--success)', marginLeft: '8px' }}>✓ Ready</span>
                      </div>
                    </div>
                  </div>
                  <Button type="link" onClick={() => setFileList([])} style={{ padding: 0 }}>
                    Change file
                  </Button>
                </div>
              ) : (
                <Dragger {...uploadProps} style={{ background: 'var(--bg)', border: '1px dashed var(--borders)', borderRadius: '8px' }}>
                  <p className="ant-upload-drag-icon">
                    <Inbox size={48} color="var(--primary)" style={{ opacity: 0.8 }} />
                  </p>
                  <p className="ant-upload-text" style={{ fontWeight: 600, color: 'var(--main-text)', fontSize: '16px' }}>
                    Drag & drop PDF here
                  </p>
                  <p className="ant-upload-hint" style={{ color: 'var(--text-secondary)' }}>
                    or click to browse
                  </p>
                  <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    PDF • Maximum 20 MB
                  </div>
                </Dragger>
              )}
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default TenderUploadModal;
