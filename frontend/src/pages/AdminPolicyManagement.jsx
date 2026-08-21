import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Space, Tag, Modal, message, Popconfirm } from 'antd';
import { Plus, Upload, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import PolicyUploadModal from '../components/policies/PolicyUploadModal';

const { Title, Text } = Typography;

const AdminPolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 });
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, [pagination.current]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/policies?page=${pagination.current}&limit=${pagination.pageSize}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch policies');
      const data = await res.json();
      setPolicies(data.data);
      setPagination({
        ...pagination,
        total: data.pagination.total
      });
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({ ...pagination, current: newPagination.current });
  };

  const handleUpload = async (formData) => {
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      message.success('Policy uploaded successfully');
      setIsUploadModalVisible(false);
      fetchPolicies();
    } catch (err) {
      message.error(err.message);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/policies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete policy');
      message.success('Policy deleted successfully');
      fetchPolicies();
    } catch (err) {
      message.error(err.message);
    }
  };


  const columns = [
    { 
      title: 'Policy', 
      dataIndex: 'title', 
      key: 'title',
      render: (text, record) => (
        <span style={{ fontWeight: 600 }}>{text}</span>
      )
    },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = status;
        if (status === 'READY') { color = 'green'; text = '● Ready'; }
        else if (status === 'PROCESSING') { color = 'orange'; text = '◌ Processing'; }
        else if (status === 'FAILED') { color = 'red'; text = '● Failed'; }
        
        return <Tag color={color} style={{ borderRadius: '4px', border: 0, fontWeight: 500 }}>{text}</Tag>;
      }
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (ver) => <span style={{ color: 'var(--text-secondary)' }}>{ver ? `v${ver}` : '-'}</span>
    },
    { 
      title: 'Uploaded', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date) => format(new Date(date), 'MMM d, yyyy')
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" size="small" onClick={() => window.location.href = `/app/policies/${record.id}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>👁 View</span>
          </Button>
          <Popconfirm
            title="Delete Policy"
            description="Are you sure you want to delete this policy?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Button type="text" size="small" danger style={{ padding: '4px' }}>
              <Trash2 size={16} />
            </Button>
          </Popconfirm>
        </Space>
      ) 
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Policy Management</Title>
          <Text type="secondary">Manage your official government policy knowledge base.</Text>
        </div>
        <Button type="primary" style={{ backgroundColor: 'var(--primary)' }} icon={<Plus size={16} />} onClick={() => setIsUploadModalVisible(true)}>
          Add New Policy
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="🔍 Search policies..." 
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--borders)', width: '250px', outline: 'none' }} 
        />
        <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--borders)', outline: 'none', background: 'white' }}>
          <option>All Categories</option>
          <option>General</option>
          <option>Security</option>
          <option>Procurement</option>
          <option>Finance</option>
        </select>
        <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--borders)', outline: 'none', background: 'white' }}>
          <option>All Status</option>
          <option>Ready</option>
          <option>Processing</option>
          <option>Failed</option>
        </select>
        <div style={{ marginLeft: 'auto' }}>
          <Text strong>7 Total</Text> <Text type="secondary">| 3 Ready | 1 Processing | 3 Failed</Text>
        </div>
      </div>

      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--borders)' }}>
        <Table 
          columns={columns} 
          dataSource={policies} 
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total
          }}
          onChange={handleTableChange}
          locale={{ emptyText: 'No policies available.' }} 
          scroll={{ x: 'max-content' }}
        />
      </Card>
      
      <PolicyUploadModal
        visible={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default AdminPolicyManagement;
