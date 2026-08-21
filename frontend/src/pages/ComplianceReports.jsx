import React, { useState, useEffect } from 'react';
import { Card, Typography, Empty, Button, Table, Tag, Space, message, Spin, Progress, Dropdown } from 'antd';
import { FileSearch, MoreVertical, Download, RefreshCw, Trash2, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const { Title, Text } = Typography;

const ComplianceReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/compliance-analysis', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch reports');
      setReports(data.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (record) => {
    const csvContent = "data:text/csv;charset=utf-8,Tender Title,Status,Overall Score,Compliant,Needs Review,Missing\n" 
      + `${record.tender?.title},${record.status},${record.overallScore}%,${record.compliantCount},${record.needsReviewCount},${record.missingCount}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Compliance_Report_${record.tender?.title}_${record.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Report downloaded successfully!');
  };

  const handleDelete = async (record) => {
    try {
      const res = await fetch(`/api/compliance-analysis/${record.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to delete report');
      message.success('Report deleted successfully');
      setReports(reports.filter(r => r.id !== record.id));
    } catch (err) {
      message.error(err.message);
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 90) return { label: 'Low', color: 'success' };
    if (score >= 60) return { label: 'Medium', color: 'warning' };
    return { label: 'High', color: 'error' };
  };

  const completedReports = reports.filter(r => r.status === 'COMPLETED');
  const avgScore = completedReports.length > 0 ? Math.round(completedReports.reduce((acc, r) => acc + (r.overallScore || 0), 0) / completedReports.length) : 0;
  const totalNeedsReview = completedReports.reduce((acc, r) => acc + (r.needsReviewCount || 0), 0);
  const totalCritical = completedReports.reduce((acc, r) => acc + (r.missingCount || 0), 0);

  const columns = [
    {
      title: 'Tender Document',
      dataIndex: ['tender', 'title'],
      key: 'tenderTitle',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSearch size={16} color="var(--primary)" />
          <Text strong style={{ color: 'var(--main-text)' }}>{text || 'Unknown Tender'}</Text>
        </div>
      )
    },
    {
      title: 'Compliance',
      dataIndex: 'overallScore',
      key: 'overallScore',
      render: (score, record) => record.status === 'COMPLETED' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
          <Progress 
            percent={score} 
            size="small" 
            showInfo={false} 
            strokeColor={score >= 90 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)'} 
          />
          <span style={{ fontWeight: 600, color: score >= 90 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{score}%</span>
        </div>
      ) : (
        <Tag color="default">{record.status}</Tag>
      )
    },
    {
      title: 'Risk',
      key: 'risk',
      render: (_, record) => {
        if (record.status !== 'COMPLETED') return '-';
        const risk = getRiskLevel(record.overallScore);
        return <Tag color={risk.color}>{risk.label}</Tag>;
      }
    },
    {
      title: 'Findings',
      key: 'findings',
      render: (_, record) => {
        if (record.status !== 'COMPLETED') return '-';
        return (
          <Space size="small">
            {record.missingCount > 0 && <span style={{ color: 'var(--danger)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={14} /> {record.missingCount}</span>}
            {record.needsReviewCount > 0 && <span style={{ color: 'var(--warning)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={14} /> {record.needsReviewCount}</span>}
            {record.compliantCount > 0 && <span style={{ color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> {record.compliantCount}</span>}
          </Space>
        );
      }
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text type="secondary">{format(new Date(date), 'MMM d, yyyy')}</Text>
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => {
        const items = [
          {
            key: 'download',
            label: 'Download PDF',
            icon: <Download size={14} />,
            onClick: () => handleDownload(record)
          },
          {
            key: 'rerun',
            label: 'Re-run analysis',
            icon: <RefreshCw size={14} />,
            onClick: () => navigate(`/app/compliance?tenderId=${record.tender?.id}`)
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <Trash2 size={14} />,
            danger: true,
            onClick: () => {
              if (window.confirm('Are you sure you want to delete this report?')) {
                handleDelete(record);
              }
            }
          }
        ];

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button 
              type="primary" 
              size="small" 
              style={{ background: 'var(--bg)', color: 'var(--primary)', borderColor: 'var(--borders)' }}
              onClick={() => navigate(`/app/my-tenders/${record.tender?.id}/compliance-analysis/${record.id}`)}
              disabled={record.status !== 'COMPLETED'}
            >
              View Report
            </Button>
            <Dropdown menu={{ items }} trigger={['click']}>
              <Button type="text" icon={<MoreVertical size={16} />} size="small" />
            </Dropdown>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: 'var(--main-text)', marginBottom: '8px' }}>Compliance Reports</Title>
          <Text type="secondary" style={{ fontSize: '15px' }}>Historical compliance analysis reports across all your tenders.</Text>
        </div>
        <Button type="primary" icon={<ShieldCheck size={16} />} onClick={() => navigate('/app/compliance')} style={{ borderRadius: '6px' }}>
          New Analysis
        </Button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--cards)', padding: '24px', borderRadius: '12px', border: '1px solid var(--borders)', flex: 1, minWidth: '200px' }}>
          <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Total Reports</Text>
          <Title level={2} style={{ margin: 0, color: 'var(--main-text)' }}>{reports.length}</Title>
        </div>
        <div style={{ background: 'var(--cards)', padding: '24px', borderRadius: '12px', border: '1px solid var(--borders)', flex: 1, minWidth: '200px' }}>
          <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Avg Score</Text>
          <Title level={2} style={{ margin: 0, color: avgScore >= 90 ? 'var(--success)' : avgScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{avgScore}%</Title>
        </div>
        <div style={{ background: 'var(--cards)', padding: '24px', borderRadius: '12px', border: '1px solid var(--borders)', flex: 1, minWidth: '200px' }}>
          <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Need Review</Text>
          <Title level={2} style={{ margin: 0, color: 'var(--warning)' }}>{totalNeedsReview}</Title>
        </div>
        <div style={{ background: 'var(--cards)', padding: '24px', borderRadius: '12px', border: '1px solid var(--borders)', flex: 1, minWidth: '200px' }}>
          <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Critical</Text>
          <Title level={2} style={{ margin: 0, color: 'var(--danger)' }}>{totalCritical}</Title>
        </div>
      </div>

      <Card style={{ borderRadius: '12px', border: '1px solid var(--borders)', overflow: 'hidden' }} bodyStyle={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
        ) : reports.length === 0 ? (
          <Empty 
            image={<FileSearch style={{ fontSize: 64, color: 'var(--borders)', margin: '0 auto', display: 'block' }} />}
            description={
              <div style={{ marginTop: '16px' }}>
                <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: 'var(--main-text)' }}>No reports generated yet</Text>
                <Text type="secondary">Run the Compliance Checker on a tender to generate detailed compliance reports.</Text>
              </div>
            }
            style={{ padding: '80px 0' }}
          >
            <Button type="primary" onClick={() => navigate('/app/compliance')} style={{ marginTop: '16px' }}>Go to Compliance Checker</Button>
          </Empty>
        ) : (
          <Table 
            columns={columns} 
            dataSource={reports} 
            rowKey="id" 
            pagination={{ pageSize: 10 }}
            className="policy-intel-table"
          />
        )}
      </Card>
    </div>
  );
};

export default ComplianceReports;
