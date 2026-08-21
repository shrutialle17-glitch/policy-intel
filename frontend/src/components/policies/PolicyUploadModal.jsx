import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Upload, message, Typography, Row, Col, Progress, Button } from 'antd';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { POLICY_CATEGORIES } from './PolicyFilterBar';

const { Option } = Select;
const { Title, Text } = Typography;

const PolicyUploadModal = ({ visible, onCancel, onUpload }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    form.validateFields().then(values => {
      if (fileList.length === 0) {
        return message.error('Please select a PDF file');
      }
      
      const file = fileList[0].originFileObj;
      if (file.size > 20 * 1024 * 1024) {
        return message.error('File size must be less than 20MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', values.title);
      formData.append('category', values.category);
      if (values.issuingAuthority) formData.append('issuingAuthority', values.issuingAuthority);
      if (values.documentType) formData.append('documentType', values.documentType);
      if (values.publicationDate) formData.append('publicationDate', values.publicationDate.toISOString());
      if (values.effectiveDate) formData.append('effectiveDate', values.effectiveDate.toISOString());
      if (values.version) formData.append('version', values.version);

      setUploadState('uploading');
      
      // Simulate progress for the demo UX
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress > 90) currentProgress = 90;
        setProgress(Math.round(currentProgress));
      }, 300);

      onUpload(formData).then(() => {
        clearInterval(interval);
        setProgress(100);
        setUploadState('success');
      }).catch((err) => {
        clearInterval(interval);
        setUploadState('idle');
      });
    });
  };

  const resetModal = () => {
    form.resetFields();
    setFileList([]);
    setUploadState('idle');
    setProgress(0);
    onCancel();
  };

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file) => {
      const isPdf = file.type === 'application/pdf';
      if (!isPdf) {
        message.error('You can only upload PDF files!');
        return Upload.LIST_IGNORE;
      }
      setFileList([{ ...file, originFileObj: file }]);
      return false; // Prevent default upload
    },
    fileList,
    maxCount: 1,
    showUploadList: false, // We'll render our own custom file list display
  };

  return (
    <Modal
      open={visible}
      onCancel={uploadState === 'uploading' ? undefined : resetModal}
      footer={null}
      width={640}
      destroyOnClose
      maskClosable={false}
      closable={uploadState !== 'uploading'}
    >
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0, color: 'var(--main-text)' }}>Upload Policy</Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>Add an official government document to the PolicyIntel knowledge base.</Text>
      </div>

      {uploadState === 'idle' && (
        <Form form={form} layout="vertical">
          <Title level={5} style={{ marginBottom: '16px', fontSize: '14px', borderBottom: '1px solid var(--borders)', paddingBottom: '8px' }}>Policy Information</Title>
          
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. National Procurement Data Security Policy 2026" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select Category">
                  {POLICY_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="documentType" label="Document Type">
                <Select placeholder="Select Type">
                  <Option value="Policy">Policy</Option>
                  <Option value="Guideline">Guideline</Option>
                  <Option value="Act">Act</Option>
                  <Option value="Regulation">Regulation</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="issuingAuthority" label="Issuing Authority">
            <Input placeholder="e.g. Ministry of Electronics and IT" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="publicationDate" label="Publication Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="effectiveDate" label="Effective Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="version" label="Version">
                <Input placeholder="e.g. 2.1" />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: '8px', marginBottom: '16px', fontSize: '14px', borderBottom: '1px solid var(--borders)', paddingBottom: '8px' }}>Policy PDF</Title>
          
          <Form.Item required style={{ marginBottom: '32px' }}>
            {fileList.length === 0 ? (
              <Upload.Dragger {...uploadProps} style={{ padding: '24px', background: '#fafafa', border: '1px dashed var(--borders)', borderRadius: '8px' }}>
                <p className="ant-upload-drag-icon" style={{ margin: 0, marginBottom: '8px' }}>
                  <UploadCloud size={32} color="var(--primary)" />
                </p>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Drag & drop PDF here</Text>
                <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>or Browse files</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>PDF only · Maximum 20 MB</Text>
              </Upload.Dragger>
            ) : (
              <div style={{ padding: '16px 20px', border: '1px solid var(--success)', borderRadius: '8px', background: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={24} color="var(--success)" />
                  <div>
                    <Text strong style={{ display: 'block', color: 'var(--main-text)' }}>{fileList[0].name}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{(fileList[0].size / (1024 * 1024)).toFixed(2)} MB</Text>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <CheckCircle2 size={20} color="var(--success)" />
                  <Button type="text" size="small" danger onClick={() => setFileList([])}>Remove</Button>
                </div>
              </div>
            )}
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" style={{ backgroundColor: 'var(--primary)' }} onClick={handleUpload}>Upload Policy</Button>
          </div>
        </Form>
      )}

      {uploadState === 'uploading' && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Title level={4} style={{ marginBottom: '24px' }}>Uploading policy...</Title>
          <Progress percent={progress} strokeColor="var(--primary)" railColor="var(--bg)" style={{ marginBottom: '32px' }} status="active" />
          
          <div style={{ textAlign: 'left', maxWidth: '300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Text style={{ display: 'flex', alignItems: 'center', gap: '8px', color: progress > 10 ? 'var(--success)' : 'var(--text-secondary)' }}>
              {progress > 10 ? <CheckCircle2 size={16} /> : <div style={{width: 14, height: 14, borderRadius: '50%', border: '2px solid #d9d9d9'}} />} File validated
            </Text>
            <Text style={{ display: 'flex', alignItems: 'center', gap: '8px', color: progress > 40 ? 'var(--success)' : 'var(--text-secondary)' }}>
              {progress > 40 ? <CheckCircle2 size={16} /> : <div style={{width: 14, height: 14, borderRadius: '50%', border: '2px solid #d9d9d9'}} />} PDF uploaded
            </Text>
            <Text style={{ display: 'flex', alignItems: 'center', gap: '8px', color: progress > 60 ? 'var(--success)' : 'var(--text-secondary)' }}>
              {progress > 60 ? <CheckCircle2 size={16} /> : <div style={{width: 14, height: 14, borderRadius: '50%', border: '2px solid #d9d9d9'}} />} Extracting text
            </Text>
            <Text style={{ display: 'flex', alignItems: 'center', gap: '8px', color: progress > 80 ? 'var(--success)' : 'var(--text-secondary)' }}>
              {progress > 80 ? <CheckCircle2 size={16} /> : <div style={{width: 14, height: 14, borderRadius: '50%', border: '2px solid #d9d9d9'}} />} Creating embeddings
            </Text>
            <Text style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <div style={{width: 14, height: 14, borderRadius: '50%', border: '2px solid #d9d9d9'}} /> Adding to knowledge base
            </Text>
          </div>
        </div>
      )}

      {uploadState === 'success' && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <CheckCircle2 size={64} color="var(--success)" style={{ marginBottom: '16px' }} />
          <Title level={4} style={{ color: 'var(--success)', marginBottom: '8px' }}>Policy successfully added</Title>
          <Title level={5} style={{ marginBottom: '16px' }}>{form.getFieldValue('title')}</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '32px' }}>
            The document is now available for AI-powered policy analysis.
          </Text>
          <Button type="primary" onClick={resetModal}>Close</Button>
        </div>
      )}
    </Modal>
  );
};

export default PolicyUploadModal;
