import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, message, Row, Col, Input, Select, Space } from 'antd';
import { Plus, Search, FileText, Brain, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TendersTable from '../components/tenders/TendersTable';
import TenderUploadModal from '../components/tenders/TenderUploadModal';

const { Title, Text } = Typography;
const { Option } = Select;

const MyTenders = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [uploadVisible, setUploadVisible] = useState(false);

  const fetchTenders = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      
      const res = await fetch(`/api/tenders?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch tenders');
      
      const { data, pagination: serverPagination } = await res.json();
      setTenders(data);
      setPagination(serverPagination);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  // Polling for processing items
  useEffect(() => {
    const hasProcessing = tenders.some(t => t.status === 'UPLOADED' || t.status === 'PROCESSING');
    let interval;
    if (hasProcessing) {
      interval = setInterval(fetchTenders, 3000);
    }
    return () => clearInterval(interval);
  }, [tenders, fetchTenders]);

  const handleTableChange = (paginationOpts) => {
    setPagination(prev => ({ ...prev, page: paginationOpts.current, limit: paginationOpts.pageSize }));
  };

  const handleUpload = async (formData) => {
    try {
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error?.message || 'Upload failed');
      }
      message.success('Tender uploaded successfully and processing started');
      setUploadVisible(false);
      fetchTenders();
    } catch (err) {
      message.error(err.message);
      throw err;
    }
  };

  const handleRetry = async (id) => {
    try {
      const res = await fetch(`/api/tenders/${id}/retry`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Retry failed');
      message.success('Tender queued for reprocessing');
      fetchTenders();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/tenders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      message.success('Tender deleted');
      fetchTenders();
    } catch (err) {
      message.error(err.message);
    }
  };

  const totalTenders = tenders.length; // Approximate, real total in pagination.total
  const readyTenders = tenders.filter(t => t.status === 'READY').length;
  const processingTenders = tenders.filter(t => t.status === 'UPLOADED' || t.status === 'PROCESSING').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: 'var(--main-text)' }}>My Tenders</Title>
          <Text type="secondary" style={{ fontSize: '15px', marginTop: '4px', display: 'block' }}>
            Upload and analyze government tender documents
          </Text>
        </div>
        <Button type="primary" size="large" icon={<Plus size={18} />} onClick={() => setUploadVisible(true)} style={{ background: 'var(--primary)' }}>
          Upload Tender
        </Button>
      </div>

      {/* Summary Strip */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--cards)', padding: '16px 24px', borderRadius: '8px', border: '1px solid var(--borders)', minWidth: '150px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--main-text)', lineHeight: 1.2 }}>{String(pagination.total || totalTenders).padStart(2, '0')}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total<br/>Tenders</div>
        </div>
        <div style={{ background: 'var(--cards)', padding: '16px 24px', borderRadius: '8px', border: '1px solid var(--borders)', minWidth: '150px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)', lineHeight: 1.2 }}>{String(readyTenders).padStart(2, '0')}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Ready<br/>for Analysis</div>
        </div>
        <div style={{ background: 'var(--cards)', padding: '16px 24px', borderRadius: '8px', border: '1px solid var(--borders)', minWidth: '150px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)', lineHeight: 1.2 }}>{String(processingTenders).padStart(2, '0')}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Processing<br/>&nbsp;</div>
        </div>
      </div>

      <Card 
        styles={{ body: { padding: '20px' } }}
        style={{ marginBottom: '40px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Input 
            placeholder="Search tenders..." 
            prefix={<Search size={16} color="var(--text-secondary)" />} 
            style={{ width: '300px', borderRadius: '6px' }}
          />
          <Space>
            <Select defaultValue="all" style={{ width: 120 }}>
              <Option value="all">All Status</Option>
              <Option value="ready">Ready</Option>
              <Option value="processing">Processing</Option>
            </Select>
            <Select defaultValue="recent" style={{ width: 140 }}>
              <Option value="recent">Upload Date ▼</Option>
              <Option value="oldest">Upload Date ▲</Option>
            </Select>
          </Space>
        </div>

        <TendersTable
          tenders={tenders}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          onView={(record) => navigate(`/app/my-tenders/${record.id}`)}
          onRetry={handleRetry}
          onDelete={handleDelete}
        />
      </Card>

      {/* How Tender Intelligence Works */}
      <div style={{ marginBottom: '40px' }}>
        <Title level={4} style={{ marginBottom: '24px', fontWeight: 600 }}>How Tender Intelligence Works</Title>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--cards)', padding: '32px 40px', borderRadius: '12px', border: '1px solid var(--borders)' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <FileText size={24} color="var(--primary)" />
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Upload Tender</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Upload PDF</div>
          </div>
          
          <ArrowRight size={20} color="var(--borders)" />

          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <Brain size={24} color="var(--primary)" />
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Extract & Index</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Document Processing</div>
          </div>

          <ArrowRight size={20} color="var(--borders)" />

          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(0,166,166,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <Sparkles size={24} color="var(--accent)" />
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Ask About It</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AI Analysis</div>
          </div>

          <ArrowRight size={20} color="var(--borders)" />

          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(22,163,74,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <ShieldCheck size={24} color="var(--success)" />
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Check Compliance</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Compliance Report</div>
          </div>
        </div>
      </div>

      <TenderUploadModal
        visible={uploadVisible}
        onCancel={() => setUploadVisible(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default MyTenders;
