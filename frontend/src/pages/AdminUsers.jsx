import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Space, message, Avatar } from 'antd';
import { Users, MoreVertical, Eye } from 'lucide-react';
import { format } from 'date-fns';

const { Title, Text } = Typography;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${pagination.current}&limit=${pagination.pageSize}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data);
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

  // Helper to generate initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const columns = [
    { 
      title: 'USER', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar style={{ backgroundColor: 'var(--primary)', color: 'white' }}>{getInitials(text)}</Avatar>
          <Text strong>{text || 'Unknown User'}</Text>
        </div>
      )
    },
    { 
      title: 'EMAIL', 
      dataIndex: 'email', 
      key: 'email',
      render: (text) => <Text type="secondary">{text}</Text>
    },
    { 
      title: 'ROLE', 
      dataIndex: 'role', 
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ADMIN' ? 'purple' : 'blue'} style={{ borderRadius: '4px', border: 0, fontWeight: 500, padding: '2px 8px' }}>
          {role}
        </Tag>
      )
    },
    { 
      title: 'JOINED', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date) => format(new Date(date), 'MMM d, yyyy')
    },
    {
      title: 'STATUS',
      key: 'status',
      render: () => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, color: 'var(--success)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }} /> Active
        </span>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: () => (
        <Space size="small">
          <Button type="text" size="small" style={{ color: 'var(--primary)' }}>
            View
          </Button>
          <Button type="text" size="small" style={{ padding: '4px' }}>
            <MoreVertical size={16} />
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: 'var(--main-text)' }}>System Users</Title>
          <Text type="secondary" style={{ fontSize: '15px' }}>Manage and monitor registered users across the PolicyIntel platform.</Text>
        </div>
        <Tag color="blue" style={{ border: 0, padding: '4px 12px', fontSize: '13px', fontWeight: 500 }}>Admin</Tag>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--cards)', padding: '16px 24px', borderRadius: '8px', border: '1px solid var(--borders)', flex: 1 }}>
          <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Total Users</Text>
          <Title level={3} style={{ margin: '4px 0 0 0' }}>{pagination.total || users.length || 0}</Title>
        </div>
        <div style={{ background: 'var(--cards)', padding: '16px 24px', borderRadius: '8px', border: '1px solid var(--borders)', flex: 1 }}>
          <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Admins</Text>
          <Title level={3} style={{ margin: '4px 0 0 0' }}>{users.filter(u => u.role === 'ADMIN').length || 0}</Title>
        </div>
        <div style={{ background: 'var(--cards)', padding: '16px 24px', borderRadius: '8px', border: '1px solid var(--borders)', flex: 1 }}>
          <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Users</Text>
          <Title level={3} style={{ margin: '4px 0 0 0' }}>{users.filter(u => u.role === 'USER').length || 0}</Title>
        </div>
        <div style={{ background: 'var(--cards)', padding: '16px 24px', borderRadius: '8px', border: '1px solid var(--borders)', flex: 1 }}>
          <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>New This Month</Text>
          <Title level={3} style={{ margin: '4px 0 0 0', color: 'var(--primary)' }}>{pagination.total || users.length || 0}</Title>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '12px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="🔍 Search users..." 
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--borders)', width: '280px', outline: 'none' }} 
        />
        <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--borders)', outline: 'none', background: 'white', minWidth: '150px' }}>
          <option>All Roles</option>
          <option>Admin</option>
          <option>User</option>
        </select>
      </div>

      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--borders)' }}>
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total
          }}
          onChange={handleTableChange}
          locale={{ emptyText: 'No users found.' }} 
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default AdminUsers;
