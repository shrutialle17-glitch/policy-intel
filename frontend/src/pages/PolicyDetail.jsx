import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Descriptions, Button, message, Skeleton, Space, Alert } from 'antd';
import { ArrowLeft, Download } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const PolicyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch(`/api/policies/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) {
          if (res.status === 403 || res.status === 404) {
             navigate('/app/policies', { replace: true });
             return message.error('Policy not found or access denied');
          }
          throw new Error('Failed to fetch policy details');
        }
        const { data } = await res.json();
        setPolicy(data);
      } catch (err) {
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [id, navigate]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/policies/${id}/file`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to get download link');
      const { data } = await res.json();
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      message.error(err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>;
  }

  if (!policy) return null;

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button type="text" icon={<ArrowLeft size={18} />} onClick={() => navigate('/app/policies')} />
        <Title level={3} style={{ margin: 0 }}>Policy Details</Title>
      </div>

      <Card style={{ borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Title level={4} style={{ marginTop: 0 }}>{policy.title}</Title>
            <Space>
              <StatusBadge status={policy.status} />
              <Text type="secondary">{policy.category}</Text>
            </Space>
          </div>
          <Button 
            type="primary" 
            icon={<Download size={16} />} 
            onClick={handleDownload} 
            loading={downloading}
          >
            Download PDF
          </Button>
        </div>

        {policy.status === 'FAILED' && policy.errorMessage && (
          <Alert 
            message="Processing Failed" 
            description={
              <div style={{ maxHeight: '150px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}>
                {policy.errorMessage}
              </div>
            }
            type="error" 
            showIcon 
            style={{ marginBottom: '24px' }} 
          />
        )}

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Issuing Authority">{policy.issuingAuthority || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Document Type">{policy.documentType || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Publication Date">
            {policy.publicationDate ? dayjs(policy.publicationDate).format('MMMM D, YYYY') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Effective Date">
            {policy.effectiveDate ? dayjs(policy.effectiveDate).format('MMMM D, YYYY') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Version">{policy.version || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="File Size">
            {policy.fileSizeBytes ? (policy.fileSizeBytes / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Uploaded By">{policy.uploadedBy?.name || 'Unknown'}</Descriptions.Item>
          <Descriptions.Item label="Upload Date">{dayjs(policy.createdAt).format('MMMM D, YYYY HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {policy.description || 'No description provided.'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default PolicyDetail;
