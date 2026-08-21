import React from 'react';
import { Table, Button, Space, Dropdown, Menu, Tooltip } from 'antd';
import { FileText, Eye, Sparkles, MoreVertical, Trash2, RotateCw, FileSearch } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const TendersTable = ({ tenders, loading, pagination, onChange, onView, onRetry, onDelete }) => {
  const navigate = useNavigate();

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'READY': return <div style={{ color: 'var(--success)', fontWeight: 500 }}>🟢 Ready</div>;
      case 'PROCESSING': return <div style={{ color: 'var(--warning)', fontWeight: 500 }}>🟡 Processing</div>;
      case 'UPLOADED': return <div style={{ color: 'var(--primary)', fontWeight: 500 }}>🔵 Uploaded</div>;
      case 'FAILED': return <div style={{ color: 'var(--danger)', fontWeight: 500 }}>🔴 Failed</div>;
      default: return <div style={{ color: 'var(--text-secondary)' }}>⚪ Unknown</div>;
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const columns = [
    {
      title: 'Tender',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ padding: '8px', background: 'var(--bg)', borderRadius: '6px', marginTop: '2px' }}>
            <FileText size={20} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{text}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
              <span>{record.originalFileName || 'tender_document.pdf'}</span>
              <span>•</span>
              <span>{formatSize(record.fileSizeBytes)}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <span style={{ color: 'var(--text-main)' }}>{format(new Date(date), 'MMM d, yyyy')}</span>
    },
    {
      title: 'Processing',
      key: 'processing',
      render: (_, record) => {
        // Mock processing time based on created date
        return <span style={{ color: 'var(--text-secondary)' }}>{formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}</span>;
      }
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => getStatusDisplay(record.status)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            icon: <Eye size={14} />,
            label: 'View Details',
            onClick: () => onView(record)
          },
          {
            key: 'ask',
            icon: <Sparkles size={14} color="var(--accent)" />,
            label: 'Ask About Tender',
            onClick: () => navigate(`/app/ask-tender?tenderId=${record.id}`)
          },
          { type: 'divider' },
          {
            key: 'delete',
            icon: <Trash2 size={14} color="var(--danger)" />,
            label: <span style={{ color: 'var(--danger)' }}>Delete Tender</span>,
            onClick: () => {
              if (window.confirm('Are you sure you want to delete this tender?')) {
                onDelete(record.id);
              }
            }
          }
        ];

        return (
          <Space size="middle" style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              type="text" 
              icon={<Eye size={16} />} 
              onClick={() => onView(record)}
              style={{ color: 'var(--text-secondary)' }}
            />
            {record.status === 'READY' && (
              <Button 
                type="text" 
                icon={<Sparkles size={16} color="var(--accent)" />} 
                onClick={() => navigate(`/app/ask-tender?tenderId=${record.id}`)}
                style={{ fontWeight: 500, color: 'var(--accent)' }}
              >
                Ask AI
              </Button>
            )}
            {record.status === 'FAILED' && (
              <Button 
                type="text" 
                danger
                icon={<RotateCw size={16} />} 
                onClick={() => onRetry(record.id)}
              >
                Retry
              </Button>
            )}
            <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
              <Button type="text" icon={<MoreVertical size={16} />} style={{ color: 'var(--text-secondary)' }} />
            </Dropdown>
          </Space>
        );
      }
    }
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={tenders} 
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
    />
  );
};

export default TendersTable;
