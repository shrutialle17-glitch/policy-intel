import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Spin, Tag, Button, Progress, Divider } from 'antd';
import { ShieldCheck, Database, FileText, Activity, ServerCrash, RefreshCw, Eye, Server, BrainCircuit, HardDrive, AlertTriangle, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);

  // Mocking data for the perfect demo presentation
  const demoStats = {
    policies: { total: 5, addedThisWeek: 2 },
    ragKb: { chunks: 128 },
    aiProcesses: { total: 6, successful: 5, failed: 1 },
    attention: { failedJobs: 1 }
  };

  const demoActionRequired = [
    { id: 1, title: 'Pipeline Test Policy', issue: 'AI processing failed', time: 'Aug 21, 11:22 PM', status: 'FAILED' }
  ];

  const demoRecentUploads = [
    { id: 2, title: 'National Procurement Data Security Policy 2026', category: 'Security', department: 'Ministry of Data', date: 'Aug 22, 2026', status: 'READY', pages: 42, chunks: 64 },
    { id: 3, title: 'Public Procurement Policy 2025', category: 'Procurement', department: 'Ministry of Finance', date: 'Aug 20, 2026', status: 'READY', pages: 18, chunks: 32 },
    { id: 4, title: 'Government Tender Guidelines 2026', category: 'Guidelines', department: 'Commerce', date: 'Aug 18, 2026', status: 'READY', pages: 25, chunks: 42 },
  ];

  useEffect(() => {
    // Simulate loading to make it feel real
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, color: 'var(--main-text)' }}>Policy Intelligence Control Center</Title>
        <Text type="secondary" style={{ fontSize: '15px' }}>Monitor policy ingestion, AI processing, and the RAG knowledge base.</Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px', border: '1px solid var(--borders)' }} bodyStyle={{ padding: '24px' }}>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
              POLICIES
            </Text>
            <Title level={2} style={{ margin: 0, color: 'var(--main-text)' }}>{demoStats.policies.total}</Title>
            <Text style={{ color: 'var(--success)', fontSize: '13px', fontWeight: 500 }}>+{demoStats.policies.addedThisWeek} this week</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px', border: '1px solid var(--borders)' }} bodyStyle={{ padding: '24px' }}>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
              RAG KNOWLEDGE BASE
            </Text>
            <Title level={2} style={{ margin: 0, color: 'var(--main-text)' }}>{demoStats.ragKb.chunks}</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>indexed chunks</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px', border: '1px solid var(--borders)' }} bodyStyle={{ padding: '24px' }}>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
              AI PROCESSES
            </Text>
            <Title level={2} style={{ margin: 0, color: 'var(--main-text)' }}>{demoStats.aiProcesses.total}</Title>
            <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
              <span style={{ color: 'var(--success)' }}>{demoStats.aiProcesses.successful} successful</span>
              <span style={{ color: 'var(--danger)' }}>{demoStats.aiProcesses.failed} failed</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px', border: '1px solid var(--danger)' }} bodyStyle={{ padding: '24px', background: 'rgba(220, 38, 38, 0.02)' }}>
            <Text style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
              ATTENTION
            </Text>
            <Title level={2} style={{ margin: 0, color: 'var(--danger)' }}>{demoStats.attention.failedJobs}</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontSize: '13px', fontWeight: 500 }}>
              <AlertTriangle size={14} /> Action needed
            </div>
          </Card>
        </Col>
      </Row>

      {/* System Health Strip */}
      <div style={{ background: 'var(--cards)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--borders)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <Text type="secondary" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>SYSTEM HEALTH</Text>
        <div style={{ width: '1px', height: '24px', background: 'var(--borders)' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={16} color="var(--text-secondary)" />
          <Text strong>RAG Engine</Text>
          <Tag color="success" style={{ margin: 0, border: 0, fontWeight: 600 }}>ONLINE</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrainCircuit size={16} color="var(--text-secondary)" />
          <Text strong>Gemini AI</Text>
          <Tag color="success" style={{ margin: 0, border: 0, fontWeight: 600 }}>ONLINE</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDrive size={16} color="var(--text-secondary)" />
          <Text strong>Storage</Text>
          <Tag color="success" style={{ margin: 0, border: 0, fontWeight: 600 }}>ONLINE</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="var(--text-secondary)" />
          <Text strong>Processing</Text>
          <Tag color="error" style={{ margin: 0, border: 0, fontWeight: 600 }}>1 FAILED</Tag>
        </div>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        {/* Policy Status Distribution */}
        <Col xs={24} lg={10}>
          <Card title={<span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>POLICY STATUS</span>} bordered={false} style={{ height: '100%', borderRadius: '12px', border: '1px solid var(--borders)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '16px 0' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                {/* SVG Donut Chart */}
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--bg)" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--success)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - (4/5))} />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--danger)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - (1/5))} style={{ transformOrigin: '50px 50px', transform: `rotate(${(4/5) * 360}deg)` }} />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Title level={3} style={{ margin: 0 }}>5</Title>
                  <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Total</Text>
                </div>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text strong>Ready</Text>
                    <Text strong>4 (80%)</Text>
                  </div>
                  <Progress percent={80} showInfo={false} strokeColor="var(--success)" railColor="var(--bg)" size="small" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text strong>Failed</Text>
                    <Text strong>1 (20%)</Text>
                  </div>
                  <Progress percent={20} showInfo={false} strokeColor="var(--danger)" railColor="var(--bg)" size="small" />
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> 1 policy requires attention
              </Text>
            </div>
          </Card>
        </Col>

        {/* AI Processing Pipeline */}
        <Col xs={24} lg={14}>
          <Card title={<span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>AI PROCESSING PIPELINE</span>} bordered={false} style={{ height: '100%', borderRadius: '12px', border: '1px solid var(--borders)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ECFDF5', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="var(--success)" />
                </div>
                <Text strong style={{ fontSize: '12px' }}>Upload</Text>
              </div>

              <ChevronRight size={24} color="var(--borders)" />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ECFDF5', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="var(--success)" />
                </div>
                <Text strong style={{ fontSize: '12px' }}>Extract</Text>
              </div>

              <ChevronRight size={24} color="var(--borders)" />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ECFDF5', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={20} color="var(--success)" />
                </div>
                <Text strong style={{ fontSize: '12px' }}>Chunk</Text>
              </div>

              <ChevronRight size={24} color="var(--borders)" />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF2F2', border: '2px dashed var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BrainCircuit size={20} color="var(--danger)" />
                </div>
                <Text strong style={{ fontSize: '12px' }}>Embed</Text>
              </div>

              <ChevronRight size={24} color="var(--borders)" />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.4 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--borders)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Server size={20} color="var(--text-secondary)" />
                </div>
                <Text strong style={{ fontSize: '12px' }}>Vector DB</Text>
              </div>

            </div>
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>Pipeline halted at <strong style={{ color: 'var(--danger)' }}>Embedding</strong> stage for 1 document.</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Action Required */}
        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--danger)' }}><AlertTriangle size={14} style={{ marginRight: '6px', verticalAlign: '-2px' }}/> ACTION REQUIRED</span>} bordered={false} style={{ height: '100%', borderRadius: '12px', border: '1px solid var(--danger)', background: 'rgba(220, 38, 38, 0.02)' }} bodyStyle={{ padding: 0 }}>
            {demoActionRequired.map((item, index) => (
              <div key={item.id} style={{ padding: '20px', borderBottom: index < demoActionRequired.length - 1 ? '1px solid var(--borders)' : 'none', background: 'white' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <XCircle size={18} color="var(--danger)" style={{ marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: 'block', marginBottom: '4px', color: 'var(--main-text)' }}>{item.title}</Text>
                    <Text style={{ display: 'block', fontSize: '13px', color: 'var(--danger)', marginBottom: '4px' }}>{item.issue}</Text>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '16px' }}>{item.time}</Text>
                    
                    <Button size="small" type="primary" danger icon={<RefreshCw size={14} />}>
                      Retry Processing
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </Col>

        {/* Recent Policy Uploads */}
        <Col xs={24} lg={16}>
          <Card title={<span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>RECENT POLICY UPLOADS</span>} bordered={false} style={{ height: '100%', borderRadius: '12px', border: '1px solid var(--borders)' }} bodyStyle={{ padding: 0 }}>
            {demoRecentUploads.map((item, index) => (
              <div key={item.id} style={{ padding: '20px', borderBottom: index < demoRecentUploads.length - 1 ? '1px solid var(--borders)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  
                  <div>
                    <Text strong style={{ fontSize: '15px', color: 'var(--main-text)', display: 'block', marginBottom: '8px' }}>
                      {item.title}
                    </Text>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.department}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Tag color="success" style={{ margin: 0, fontWeight: 600, border: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> RAG READY</Tag>
                      <Text type="secondary" style={{ fontSize: '13px' }}>{item.pages} pages</Text>
                      <Text type="secondary" style={{ fontSize: '13px' }}>{item.chunks} chunks</Text>
                    </div>
                  </div>

                  <Button type="default" size="small" icon={<Eye size={14} />}>View</Button>

                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default AdminDashboard;
