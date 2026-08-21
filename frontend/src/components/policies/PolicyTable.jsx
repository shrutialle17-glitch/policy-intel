import React from 'react';
import { Table, Button, Space, Tooltip } from 'antd';
import { Eye, Edit, Archive, CheckCircle, Sparkles } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import dayjs from 'dayjs';

const PolicyTable = ({ 
  policies, 
  loading, 
  pagination, 
  onChange, 
  onView, 
  onEdit, 
  onMarkReady, 
  onArchive,
  userRole,
  onAskAI
}) => {
  const columns = [
    {
      title: 'Policy',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    {
      title: 'Authority',
      dataIndex: 'issuingAuthority',
      key: 'issuingAuthority',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <span style={{ color: 'var(--text-secondary)' }}>{cat || '-'}</span>
    },
    {
      title: 'Updated',
      dataIndex: 'publicationDate',
      key: 'publicationDate',
      sorter: true,
      render: (date) => date ? dayjs(date).format('D MMM YYYY') : '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusBadge status={status} />
          {status === 'READY' && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--borders)' }}>
              RAG Ready ✓
            </span>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space onClick={e => e.stopPropagation()}>
          <Button type="text" style={{ padding: '4px 8px' }} onClick={() => onView(record)}>
            <Eye size={14} style={{ marginRight: '4px' }} /> View
          </Button>
          <Button type="text" style={{ color: 'var(--accent)', fontWeight: 500, padding: '4px 8px' }} onClick={() => onAskAI(record)}>
            <Sparkles size={14} style={{ marginRight: '4px' }} /> Ask AI
          </Button>
          
          {userRole === 'ADMIN' && (
            <>
              <Tooltip title="Edit Metadata">
                <Button type="text" icon={<Edit size={16} />} onClick={() => onEdit(record)} />
              </Tooltip>
              {record.status === 'FAILED' && (
                <Tooltip title="Retry Processing">
                  <Button type="text" icon={<CheckCircle size={16} color="var(--primary)" />} onClick={() => onReprocess(record.id)} />
                </Tooltip>
              )}
              {record.status !== 'ARCHIVED' && (
                <Tooltip title="Archive">
                  <Button type="text" icon={<Archive size={16} color="var(--warning)" />} onClick={() => onArchive(record.id)} />
                </Tooltip>
              )}
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={policies}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination.page,
        pageSize: pagination.limit,
        total: pagination.total,
        showSizeChanger: true
      }}
      onChange={onChange}
      scroll={{ x: 'max-content' }}
      onRow={(record) => ({
        onClick: () => onView(record),
        style: { cursor: 'pointer' }
      })}
    />
  );
};

export default PolicyTable;
