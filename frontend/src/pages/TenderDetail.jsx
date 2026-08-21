import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Button, Alert, Tag, Space, Table, Descriptions } from 'antd';
import { ArrowLeft, Download, AlertCircle, CheckCircle2, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import { format } from 'date-fns';

const { Title, Text, Paragraph } = Typography;

const TENDER_STATUS_COLORS = {
  UPLOADED: 'blue',
  PROCESSING: 'orange',
  READY: 'green',
  FAILED: 'red'
};

const TenderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryLoading, setRetryLoading] = useState(false);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchTender();
    fetchReports();
  }, [id]);

  useEffect(() => {
    let interval;
    if (tender && (tender.status === 'UPLOADED' || tender.status === 'PROCESSING')) {
      interval = setInterval(fetchTender, 5000);
    }
    return () => clearInterval(interval);
  }, [tender]);

  const fetchTender = async () => {
    try {
      const res = await fetch(`/api/tenders/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.status === 404) {
        navigate('/app/my-tenders');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch tender');
      const data = await res.json();
      setTender(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/tenders/${id}/compliance-analysis`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setReports(data.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const handleRetry = async () => {
    setRetryLoading(true);
    try {
      const res = await fetch(`/api/tenders/${id}/retry`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to retry');
      }
      await fetchTender();
    } catch (err) {
      setError(err.message);
    } finally {
      setRetryLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/tenders/${id}/file`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to get download link');
      const data = await res.json();
      window.open(data.data.signedUrl, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  const reportColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: 'Score',
      dataIndex: 'overallScore',
      key: 'overallScore',
      render: (score, record) => record.status === 'COMPLETED' ? `${score}%` : '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'COMPLETED' ? 'green' : status === 'FAILED' ? 'red' : 'orange'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/app/my-tenders/${id}/compliance-analysis/${record.id}`)}
          disabled={record.status !== 'COMPLETED'}
        >
          View Report
        </Button>
      )
    }
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (error) {
    return <Alert type="error" message={error} style={{ maxWidth: '600px', margin: '0 auto' }} />;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Button 
        type="text" 
        icon={<ArrowLeft size={16} />} 
        onClick={() => navigate('/app/my-tenders')}
        style={{ marginBottom: '24px', padding: 0, color: 'var(--text-secondary)' }}
      >
        Back to My Tenders
      </Button>

      <Title level={2} style={{ margin: 0, marginBottom: '24px', color: 'var(--main-text)' }}>Tender Intelligence</Title>

      <Card 
        style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
        bodyStyle={{ padding: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '32px' }}>
          <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px' }}>
            <FileText size={32} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ margin: '0 0 8px 0', color: 'var(--main-text)' }}>{tender.title}</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Status</Text>
                <div style={{ fontWeight: 500 }}>
                  {tender.status === 'READY' ? <span style={{ color: 'var(--success)' }}>🟢 Ready</span> : 
                   tender.status === 'PROCESSING' ? <span style={{ color: 'var(--warning)' }}>🟡 Processing</span> : 
                   <span style={{ color: 'var(--primary)' }}>🔵 Uploaded</span>}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Document</Text>
                <div style={{ fontWeight: 500, color: 'var(--main-text)' }}>
                  {tender.originalFileName || 'Tender Document'} · {tender.fileSizeBytes ? `${(tender.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size'}
                </div>
              </div>
              <Button type="link" icon={<Download size={16} />} onClick={handleDownload} style={{ padding: 0, marginTop: '16px' }}>
                View PDF
              </Button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--borders)', paddingTop: '24px', marginBottom: '32px' }}>
          <Title level={5} style={{ margin: '0 0 16px 0', color: 'var(--main-text)' }}>AI Analysis Pipeline</Title>
          {tender.status === 'READY' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Document text extracted and indexed
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Vectors generated for semantic search
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Ready for intelligence queries and compliance validation
              </div>
            </div>
          ) : tender.status === 'FAILED' ? (
            <Alert
              message="Processing Failed"
              description={tender.processingError || "An error occurred while processing this document. Please try again."}
              type="error"
              showIcon
              icon={<AlertCircle />}
              action={
                <Button size="small" type="primary" onClick={handleRetry} loading={retryLoading}>
                  Retry Processing
                </Button>
              }
            />
          ) : (
            <div style={{ color: 'var(--text-secondary)' }}>
              Document is currently being processed by AI pipeline...
            </div>
          )}
        </div>

        {tender.status === 'READY' && (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<Sparkles size={18} />} 
              onClick={() => navigate(`/app/ask-tender?tenderId=${tender.id}`)}
              style={{ background: 'var(--accent)', borderColor: 'var(--accent)', fontWeight: 500, borderRadius: '8px', padding: '0 24px' }}
            >
              Ask About Tender
            </Button>
            <Button 
              size="large" 
              icon={<ShieldCheck size={18} />} 
              onClick={() => navigate(`/app/compliance?tenderId=${tender.id}`)}
              style={{ fontWeight: 500, borderRadius: '8px', padding: '0 24px' }}
            >
              Run Compliance Check
            </Button>
          </div>
        )}
      </Card>

      <Title level={4} style={{ marginBottom: '16px', marginTop: '32px' }}>Compliance Reports</Title>
      <Card style={{ borderRadius: '12px' }}>
        <Table 
          columns={reportColumns} 
          dataSource={reports} 
          rowKey="id" 
          pagination={false}
          locale={{ emptyText: 'No compliance reports found for this tender.' }}
        />
      </Card>
    </div>
  );
};

export default TenderDetail;
