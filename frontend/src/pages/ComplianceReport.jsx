import React, { useState, useEffect, useMemo } from 'react';
import { Card, Typography, Spin, Alert, Tag, Space, Divider, Row, Col, Collapse, Button } from 'antd';
import { ShieldAlert, FileText, CheckCircle, XCircle, AlertCircle, ExternalLink, ArrowLeft, RotateCw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import AIFindingBlock from '../components/shared/AIFindingBlock';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { format } from 'date-fns';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const FINDING_COLORS = {
  COMPLIANT: 'var(--success)', 
  MISSING: 'var(--danger)',
  NEEDS_REVIEW: 'var(--warning)'
};

const FINDING_ICONS = {
  COMPLIANT: <CheckCircle size={16} color="var(--success)" />,
  MISSING: <XCircle size={16} color="var(--danger)" />,
  NEEDS_REVIEW: <AlertCircle size={16} color="var(--warning)" />
};

const SEVERITY_ORDER = {
  MISSING: 1,
  NEEDS_REVIEW: 2,
  COMPLIANT: 3
};

const ComplianceReport = () => {
  const { tenderId, id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/compliance-analysis/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.status === 404) {
        navigate(`/app/my-tenders/${tenderId}`);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch report');
      const resData = await res.json();
      setData(resData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunNewAnalysis = () => {
    navigate(`/app/compliance?tenderId=${tenderId}`);
  };

  const findings = data?.findings || [];

  // Group by category and determine rollup status
  const categoryGroups = useMemo(() => {
    const groups = {};
    findings.forEach(f => {
      const cat = f.requirementCategory || 'General Requirements';
      if (!groups[cat]) {
        groups[cat] = {
          category: cat,
          findings: [],
          status: 'COMPLIANT' // Optimistic default
        };
      }
      groups[cat].findings.push(f);
      
      // Worst status wins logic
      if (f.status === 'MISSING') {
        groups[cat].status = 'MISSING';
      } else if (f.status === 'NEEDS_REVIEW' && groups[cat].status !== 'MISSING') {
        groups[cat].status = 'NEEDS_REVIEW';
      }
    });
    return Object.values(groups);
  }, [findings]);

  // Sort findings by severity
  const sortedFindings = useMemo(() => {
    return [...findings].sort((a, b) => SEVERITY_ORDER[a.status] - SEVERITY_ORDER[b.status]);
  }, [findings]);

  const filteredFindings = useMemo(() => {
    return sortedFindings.filter(f => filter === 'ALL' || f.status === filter);
  }, [sortedFindings, filter]);

  const chartData = [
    { name: 'Compliant', value: data?.compliantCount || 0, color: FINDING_COLORS.COMPLIANT },
    { name: 'Needs Review', value: data?.needsReviewCount || 0, color: FINDING_COLORS.NEEDS_REVIEW },
    { name: 'Missing', value: data?.missingCount || 0, color: FINDING_COLORS.MISSING },
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (error) {
    return <Alert type="error" message={error} style={{ maxWidth: '600px', margin: '0 auto' }} />;
  }

  if (!data) return null;

  let parsedCategories = [];
  try {
    parsedCategories = JSON.parse(data.policyScopeCategories);
  } catch(e) {}

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Button 
        type="text" 
        icon={<ArrowLeft size={16} />} 
        onClick={() => navigate(`/app/my-tenders/${tenderId}`)}
        style={{ marginBottom: '16px', padding: 0 }}
      >
        Back to Tender Detail
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ShieldAlert size={40} color="var(--primary)" />
          <div>
            <Title level={2} style={{ margin: 0 }}>Compliance Report</Title>
            <Space split={<Divider type="vertical" />} style={{ color: 'var(--secondary-text)' }}>
              <Text type="secondary">Generated on {format(new Date(data.completedAt || data.createdAt), 'PPpp')}</Text>
              <Text type="secondary">Status: <Tag color={data.status === 'COMPLETED' ? 'green' : 'red'}>{data.status}</Tag></Text>
            </Space>
          </div>
        </div>
        <div>
          <Button type="primary" icon={<RotateCw size={16} />} onClick={handleRunNewAnalysis}>
            Run New Analysis
          </Button>
        </div>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={24} align="middle">
          <Col span={12}>
            <Title level={4}>Report Details</Title>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Tender Document: </Text>
              <a href={`/app/my-tenders/${tenderId}`} target="_blank" rel="noreferrer">
                View Original Tender <ExternalLink size={12} />
              </a>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Total Requirements Checked: </Text>
              <Text>{findings.length}</Text>
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Policy Scope:</Text>
              <Space wrap>
                {parsedCategories.map(cat => (
                  <Tag key={cat}>{cat}</Tag>
                ))}
              </Space>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Card size="small" style={{ minWidth: '120px', background: 'var(--surface)' }}>
                <Text type="secondary">Overall Score</Text>
                <Title level={2} style={{ margin: 0, color: data.overallScore >= 80 ? 'var(--success)' : data.overallScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                  {data.overallScore}%
                </Title>
              </Card>
              <Card size="small" style={{ minWidth: '100px', textAlign: 'center' }}>
                <Text type="secondary">Compliant</Text>
                <Title level={3} style={{ margin: 0, color: 'var(--success)' }}>{data.compliantCount}</Title>
              </Card>
              <Card size="small" style={{ minWidth: '100px', textAlign: 'center' }}>
                <Text type="secondary">Needs Review</Text>
                <Title level={3} style={{ margin: 0, color: 'var(--warning)' }}>{data.needsReviewCount}</Title>
              </Card>
              <Card size="small" style={{ minWidth: '100px', textAlign: 'center' }}>
                <Text type="secondary">Missing</Text>
                <Title level={3} style={{ margin: 0, color: 'var(--danger)' }}>{data.missingCount}</Title>
              </Card>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        <Col span={8}>
          <Card title="Compliance Summary" style={{ marginBottom: '24px', height: '100%' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
              Rollup of compliance status by category domain.
            </Text>
            <div style={{ height: '150px', marginBottom: '24px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <Collapse ghost expandIconPosition="end">
              {categoryGroups.map((group, idx) => (
                <Panel 
                  header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {FINDING_ICONS[group.status]}
                      <Text strong>{group.category}</Text>
                    </div>
                  } 
                  key={idx}
                >
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {group.findings.map(f => (
                      <li key={f.id} style={{ marginBottom: '4px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          <span style={{ color: FINDING_COLORS[f.status], marginRight: '4px' }}>●</span>
                          {f.requirementText.length > 50 ? f.requirementText.substring(0, 50) + '...' : f.requirementText}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </Panel>
              ))}
            </Collapse>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="Detailed Findings">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Text strong>Filter:</Text>
                <Button size="small" type={filter === 'ALL' ? 'primary' : 'default'} onClick={() => setFilter('ALL')}>All ({findings.length})</Button>
                <Button size="small" danger={filter === 'MISSING'} type={filter === 'MISSING' ? 'primary' : 'default'} onClick={() => setFilter('MISSING')}>Missing ({data.missingCount})</Button>
                <Button size="small" style={{ borderColor: filter === 'NEEDS_REVIEW' ? 'var(--warning)' : '', color: filter === 'NEEDS_REVIEW' ? 'var(--warning)' : '' }} onClick={() => setFilter('NEEDS_REVIEW')}>Needs Review ({data.needsReviewCount})</Button>
                <Button size="small" style={{ borderColor: filter === 'COMPLIANT' ? 'var(--success)' : '', color: filter === 'COMPLIANT' ? 'var(--success)' : '' }} onClick={() => setFilter('COMPLIANT')}>Compliant ({data.compliantCount})</Button>
              </Space>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredFindings.map((finding) => (
                <Card key={finding.id} size="small" style={{ borderColor: 'var(--borders)' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ marginTop: 4 }}>
                      {FINDING_ICONS[finding.status]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <Tag>{finding.requirementCategory || 'General Requirements'}</Tag>
                          <Text strong style={{ fontSize: 16 }}>{finding.requirementText}</Text>
                        </div>
                        <Space>
                          <Tag color={finding.confidence === 'HIGH' ? 'green' : finding.confidence === 'MEDIUM' ? 'blue' : 'orange'}>
                            {finding.confidence} Confidence {(finding.confidenceScore * 100).toFixed(0)}%
                          </Tag>
                          <Tag color={finding.status === 'COMPLETED' ? 'green' : finding.status === 'FAILED' ? 'red' : 'orange'}>{finding.status}</Tag>
                        </Space>
                      </div>
                      
                      <AIFindingBlock 
                        answer={
                          <div>
                            <Text>{finding.explanation}</Text>
                            {finding.recommendation && (
                              <div style={{ marginTop: 8 }}>
                                <Text strong>Recommendation: </Text>
                                <Text type="secondary">{finding.recommendation}</Text>
                              </div>
                            )}
                          </div>
                        }
                        citations={[
                          {
                            type: 'policy',
                            sourceTitle: finding.sourcePolicyTitle,
                            pageNumber: finding.policyPageNumber,
                            chunkText: finding.policyExcerpt,
                            sourceId: finding.sourcePolicyId,
                          },
                          ...(finding.tenderEvidenceText ? [{
                            type: 'tender',
                            sourceTitle: 'Uploaded Tender',
                            pageNumber: finding.tenderPageNumber,
                            chunkText: finding.tenderEvidenceText,
                            sourceId: tenderId,
                          }] : [])
                        ]}
                        onViewSource={(sourceId, pageNum) => {
                          if (sourceId === tenderId) {
                            window.open(`/app/my-tenders/${sourceId}?page=${pageNum}`, '_blank');
                          } else {
                            window.open(`/app/policies/${sourceId}?page=${pageNum}`, '_blank');
                          }
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
              {filteredFindings.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <Text type="secondary">No findings match the current filter.</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ComplianceReport;
