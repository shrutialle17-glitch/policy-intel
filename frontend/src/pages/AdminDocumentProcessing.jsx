import React, { useState, useEffect } from 'react';
import { Card, Typography, Switch, Space, Alert, Button, Progress, Tag, Col, Row, Popconfirm, message, Spin } from 'antd';
import { RefreshCw, AlertCircle, CheckCircle2, ChevronRight, PlayCircle, Circle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

const { Title, Text } = Typography;

const AdminDocumentProcessing = () => {
  const [showOnlyFailed, setShowOnlyFailed] = useState(false);
  const [retryingId, setRetryingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
    
    // Optional: Poll every 10 seconds for live updates
    const interval = setInterval(fetchPolicies, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPolicies = async () => {
    try {
      // Fetch all policies (admin sees all)
      const res = await axios.get('/api/policies?limit=50', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setPolicies(res.data.data);
    } catch (err) {
      console.error('Failed to fetch processing jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id) => {
    setRetryingId(id);
    try {
      await axios.patch(`/api/policies/${id}/reprocess`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Reprocessing started');
      fetchPolicies();
    } catch (err) {
      message.error('Failed to restart processing');
    } finally {
      setRetryingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`/api/policies/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Policy deleted successfully');
      fetchPolicies();
    } catch (err) {
      message.error('Failed to delete policy');
    } finally {
      setDeletingId(null);
    }
  };

  const generateSteps = (status) => {
    if (status === 'READY') {
      return [
        { label: 'Uploaded', status: 'done' },
        { label: 'Text extracted', status: 'done' },
        { label: 'Chunks generated', status: 'done' },
        { label: 'Generating embeddings', status: 'done' },
        { label: 'Vector indexing', status: 'done' },
      ];
    } else if (status === 'FAILED') {
      return [
        { label: 'Uploaded', status: 'done' },
        { label: 'AI Processing', status: 'error' },
        { label: 'Chunks generated', status: 'pending' },
        { label: 'Generating embeddings', status: 'pending' },
        { label: 'Vector indexing', status: 'pending' },
      ];
    } else if (status === 'PROCESSING') {
      return [
        { label: 'Uploaded', status: 'done' },
        { label: 'Text extracted', status: 'done' },
        { label: 'Chunks generated', status: 'active' },
        { label: 'Generating embeddings', status: 'pending' },
        { label: 'Vector indexing', status: 'pending' },
      ];
    } else {
      return [
        { label: 'Uploaded', status: 'done' },
        { label: 'Text extracted', status: 'pending' },
        { label: 'Chunks generated', status: 'pending' },
        { label: 'Generating embeddings', status: 'pending' },
        { label: 'Vector indexing', status: 'pending' },
      ];
    }
  };

  const getProgress = (status) => {
    if (status === 'READY') return 100;
    if (status === 'FAILED') return 40;
    if (status === 'PROCESSING') return 65;
    return 10;
  };

  const mappedJobs = policies.map(policy => ({
    id: policy.id,
    title: policy.title,
    status: policy.status,
    progress: getProgress(policy.status),
    errorMessage: policy.errorMessage || 'Unknown error occurred during vector indexing.',
    createdAt: policy.createdAt,
    steps: generateSteps(policy.status)
  }));

  const jobs = showOnlyFailed ? mappedJobs.filter(j => j.status === 'FAILED') : mappedJobs;

  const getStepIcon = (status) => {
    if (status === 'done') return <CheckCircle2 size={16} color="var(--success)" />;
    if (status === 'active') return <PlayCircle size={16} color="var(--primary)" />;
    if (status === 'error') return <AlertCircle size={16} color="var(--danger)" />;
    return <Circle size={16} color="var(--text-secondary)" opacity={0.3} />;
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: 'var(--main-text)' }}>Document Processing</Title>
          <Text type="secondary" style={{ fontSize: '15px' }}>Monitor document ingestion and AI indexing.</Text>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Space style={{ marginLeft: '16px' }}>
            <Text strong style={{ fontSize: '13px' }}>Errors Only</Text>
            <Switch checked={showOnlyFailed} onChange={setShowOnlyFailed} size="small" />
          </Space>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {loading && <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>}
        
        {!loading && jobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--borders)' }}>
            <Text type="secondary">No documents in pipeline.</Text>
          </div>
        )}

        {jobs.map(job => (
          <Card key={job.id} bordered={false} style={{ borderRadius: '12px', border: `1px solid ${job.status === 'FAILED' ? 'var(--danger)' : 'var(--borders)'}`, background: job.status === 'FAILED' ? 'rgba(220, 38, 38, 0.02)' : 'white' }} bodyStyle={{ padding: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <Title level={4} style={{ margin: 0, color: job.status === 'FAILED' ? 'var(--danger)' : 'var(--main-text)' }}>
                  {job.status === 'FAILED' && '🔴 Processing Failed: '}
                  {job.title}
                </Title>
                <Text type="secondary" style={{ fontSize: '13px' }}>{format(new Date(job.createdAt), 'PP p')}</Text>
              </div>
              <div>
                <Popconfirm
                  title="Delete Policy"
                  description="Are you sure you want to delete this document?"
                  onConfirm={() => handleDelete(job.id)}
                  okText="Yes"
                  cancelText="No"
                  placement="left"
                >
                  <Button type="text" danger icon={<Trash2 size={16} />} loading={deletingId === job.id}>
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </div>

            {job.status === 'FAILED' && (
              <div style={{ marginBottom: '24px', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <Text strong style={{ display: 'block', marginBottom: '4px', color: 'var(--danger)' }}>Reason:</Text>
                <div style={{ maxHeight: '100px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-main)' }}>
                  {job.errorMessage}
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                  <Button type="primary" danger icon={<RefreshCw size={14} />} loading={retryingId === job.id} onClick={() => handleRetry(job.id)}>Retry Processing</Button>
                </div>
              </div>
            )}

            {job.status !== 'FAILED' && (
              <Progress 
                percent={job.progress} 
                status={job.status === 'READY' ? 'success' : 'active'} 
                strokeColor={job.status === 'READY' ? 'var(--success)' : 'var(--primary)'}
                strokeWidth={12}
                style={{ marginBottom: '24px' }} 
              />
            )}

            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {job.steps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: step.status === 'pending' ? 0.5 : 1 }}>
                    {getStepIcon(step.status)}
                    <Text strong={step.status === 'active'} style={{ color: step.status === 'error' ? 'var(--danger)' : 'inherit' }}>{step.label}</Text>
                  </div>
                ))}
              </div>
              
              {job.status === 'PROCESSING' && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginLeft: 'auto', textAlign: 'right' }}>
                  <Text type="secondary">Processing...</Text>
                  <Title level={2} style={{ margin: 0, color: 'var(--primary)' }}>{job.progress}%</Title>
                </div>
              )}
            </div>

          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDocumentProcessing;
