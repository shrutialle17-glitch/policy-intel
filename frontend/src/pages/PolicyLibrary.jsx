import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, message, Row, Col, Statistic, Drawer, Tag } from 'antd';
import { Plus, Book, Shield, Building, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PolicyFilterBar from '../components/policies/PolicyFilterBar';
import PolicyTable from '../components/policies/PolicyTable';
import PolicyUploadModal from '../components/policies/PolicyUploadModal';
import PolicyEditModal from '../components/policies/PolicyEditModal';

const { Title } = Typography;

const PolicyLibrary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });
  const [filters, setFilters] = useState({ search: '', category: '', status: '', sortBy: 'createdAt', sortOrder: 'desc' });
  const [uploadVisible, setUploadVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
      });
      
      const res = await fetch(`/api/policies?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch policies');
      
      const { data, pagination: serverPagination } = await res.json();
      setPolicies(data);
      setPagination(serverPagination);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.sortBy, filters.sortOrder, filters.category, filters.status, debouncedSearch]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', category: '', status: '', sortBy: 'createdAt', sortOrder: 'desc' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTableChange = (paginationOpts, filters, sorter) => {
    setPagination(prev => ({ ...prev, page: paginationOpts.current, limit: paginationOpts.pageSize }));
    if (sorter.field) {
      handleFilterChange('sortBy', sorter.field);
      handleFilterChange('sortOrder', sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  const handleUpload = async (formData) => {
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      message.success('Policy uploaded successfully (DRAFT state)');
      setUploadVisible(false);
      fetchPolicies();
    } catch (err) {
      message.error(err.message);
      throw err;
    }
  };

  const handleEditSave = async (values) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/policies/${editingPolicy.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error('Edit failed');
      message.success('Policy metadata updated');
      setEditVisible(false);
      fetchPolicies();
    } catch (err) {
      message.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`/api/policies/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Status update failed');
      message.success(`Policy marked as ${status}`);
      fetchPolicies();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleReprocess = async (id) => {
    try {
      const res = await fetch(`/api/policies/${id}/reprocess`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Reprocess failed');
      message.success('Policy queued for reprocessing');
      fetchPolicies();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleView = (record) => {
    setSelectedPolicy(record);
    setDrawerVisible(true);
  };

  const handleAskAI = (record) => {
    navigate(`/app/ask-policy?policyId=${record.id}`);
  };

  return (
    <div>
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>Policy Library</Title>
        {user?.role === 'ADMIN' && (
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setUploadVisible(true)}>
            Upload Policy
          </Button>
        )}
      </div>
      <div style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Centralized repository of government policies and regulations.</div>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic title={<span style={{ fontWeight: 600, fontSize: '13px' }}>Total Policies</span>} value={pagination.total || 0} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic title={<span style={{ fontWeight: 600, fontSize: '13px' }}>Procurement Policies</span>} value={policies.filter(p => p.category === 'Procurement').length || 0} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic title={<span style={{ fontWeight: 600, fontSize: '13px' }}>Departments</span>} value={new Set(policies.map(p => p.issuingAuthority)).size || 0} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic title={<span style={{ fontWeight: 600, fontSize: '13px' }}>Updated This Month</span>} value={policies.length > 0 ? 3 : 0} />
          </Card>
        </Col>
      </Row>

      {/* Ask AI Helper */}
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: '8px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderLeft: '4px solid var(--accent)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 600, marginBottom: '4px' }}>
            <Sparkles size={16} /> Need help understanding a policy?
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Ask Policy AI about any policy in the library.</div>
        </div>
        <Button 
          type="primary" 
          style={{ backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px', border: 0 }}
          onClick={() => navigate('/app/ask-policy')}
        >
          Ask a question about government policies... <ArrowRight size={14} />
        </Button>
      </div>

      <Card style={{ marginBottom: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <PolicyFilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={(val) => handleFilterChange('search', val)}
          onClear={handleClearFilters}
          userRole={user?.role}
          totalCount={pagination.total}
        />
        <PolicyTable
          policies={policies}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          onView={handleView}
          onEdit={(record) => { setEditingPolicy(record); setEditVisible(true); }}
          onAskAI={handleAskAI}
          onReprocess={handleReprocess}
          onArchive={(id) => handleStatusChange(id, 'ARCHIVED')}
          userRole={user?.role}
        />
      </Card>

      {/* Policy Categories */}
      <Title level={4} style={{ marginBottom: '16px', fontWeight: 600 }}>Policy Categories</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <Building size={24} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <div style={{ fontWeight: 600 }}>Procurement</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>42 policies</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <FileText size={24} style={{ color: 'var(--secondary)', marginBottom: '12px' }} />
            <div style={{ fontWeight: 600 }}>Finance</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>31 policies</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <Shield size={24} style={{ color: 'var(--danger)', marginBottom: '12px' }} />
            <div style={{ fontWeight: 600 }}>Security</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>18 policies</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <Book size={24} style={{ color: 'var(--success)', marginBottom: '12px' }} />
            <div style={{ fontWeight: 600 }}>Compliance</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>24 policies</div>
          </Card>
        </Col>
      </Row>

      <PolicyUploadModal
        visible={uploadVisible}
        onCancel={() => setUploadVisible(false)}
        onUpload={handleUpload}
      />

      <PolicyEditModal
        visible={editVisible}
        policy={editingPolicy}
        loading={actionLoading}
        onCancel={() => setEditVisible(false)}
        onSave={handleEditSave}
      />

      <Drawer
        title={null}
        placement="right"
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        closeIcon={null}
      >
        {selectedPolicy && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Policy Details</Title>
              <Button type="text" onClick={() => setDrawerVisible(false)} style={{ padding: 0 }}>×</Button>
            </div>
            
            <Title level={5} style={{ marginBottom: '8px' }}>{selectedPolicy.title}</Title>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <div><span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>Authority:</span> <span style={{ fontWeight: 500 }}>{selectedPolicy.issuingAuthority}</span></div>
              <div><span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>Category:</span> <Tag>{selectedPolicy.category || 'General'}</Tag></div>
              <div><span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>Published:</span> <span style={{ fontWeight: 500 }}>{selectedPolicy.publicationDate ? new Date(selectedPolicy.publicationDate).toLocaleDateString() : 'Unknown'}</span></div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>Status:</span> <Tag color={selectedPolicy.status === 'READY' ? 'success' : 'default'} style={{ border: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: selectedPolicy.status === 'READY' ? '#16A34A' : '#94A3B8' }}></div> {selectedPolicy.status}</Tag></div>
            </div>

            <div style={{ borderTop: '1px solid var(--borders)', paddingTop: '24px', marginBottom: '24px' }}>
              <Title level={5} style={{ fontSize: '14px', marginBottom: '12px' }}>About this policy</Title>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
                Provides guidelines and compliance requirements for government departments. Automatically indexed by the PolicyIntel system.
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--borders)', paddingTop: '24px', marginBottom: '32px' }}>
              <Title level={5} style={{ fontSize: '14px', marginBottom: '12px' }}>Document</Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg)', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
                <FileText size={16} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>policy-{selectedPolicy.id.slice(0,6)}.pdf</span>
              </div>
              <Button block style={{ marginBottom: '12px' }} onClick={() => navigate(`/app/policies/${selectedPolicy.id}`)}>
                View Document
              </Button>
            </div>

            <Button block type="primary" style={{ backgroundColor: 'var(--accent)', border: 0, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }} onClick={() => handleAskAI(selectedPolicy)}>
              <Sparkles size={16} /> Ask Policy AI
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PolicyLibrary;
