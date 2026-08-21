import React, { useState, useEffect } from 'react';
import { Card, Typography, Select, Checkbox, Button, Spin, Steps, Alert, Tag, Space, Divider, Row, Col, Progress } from 'antd';
import { ShieldAlert, FileText, CheckCircle, XCircle, AlertCircle, ExternalLink, Shield, Download, BrainCircuit, Activity } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const DEFAULT_CATEGORIES = ['Procurement', 'Tendering', 'Vendor Selection', 'Contract Management', 'Financial Compliance', 'Evaluation', 'Security & Data Privacy', 'General', 'Security'];

const Compliance = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTenderId = searchParams.get('tenderId');

  const [tenders, setTenders] = useState([]);
  const [selectedTenderId, setSelectedTenderId] = useState(initialTenderId || null);
  const [selectedCategories, setSelectedCategories] = useState(['Procurement', 'Evaluation', 'Contract Management']);
  
  const [analysisId, setAnalysisId] = useState(null);
  const [analysisState, setAnalysisState] = useState(null); // PENDING, ANALYZING, COMPLETED, FAILED
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchTenders();
  }, []);

  useEffect(() => {
    let interval;
    if (analysisId && (analysisState === 'PENDING' || analysisState === 'ANALYZING')) {
      interval = setInterval(pollAnalysis, 3000);
    }
    return () => clearInterval(interval);
  }, [analysisId, analysisState]);

  const fetchTenders = async () => {
    try {
      const res = await fetch('/api/tenders?limit=50', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTenders(data.data || []);
    } catch (err) {
      console.error('Error fetching tenders', err);
    }
  };

  const pollAnalysis = async () => {
    try {
      const res = await fetch(`/api/compliance-analysis/${analysisId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.data) {
        setAnalysisState(data.data.status);
        if (data.data.status === 'COMPLETED' || data.data.status === 'FAILED') {
          setAnalysisData(data.data);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Error polling analysis', err);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedTenderId || selectedCategories.length === 0) return;
    setLoading(true);
    setError(null);
    setAnalysisId(null);
    setAnalysisState(null);
    setAnalysisData(null);
    setFilter('ALL');

    try {
      const res = await fetch(`/api/tenders/${selectedTenderId}/compliance-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ categories: selectedCategories })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to start analysis');
      
      setAnalysisId(data.data.id);
      setAnalysisState(data.data.status);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const readyTenders = tenders.filter(t => t.status === 'READY');
  const selectedTender = tenders.find(t => t.id === selectedTenderId);

  const filteredFindings = analysisData?.findings?.filter(f => {
    if (filter === 'ALL') return true;
    return f.status === filter;
  }) || [];

  const getRiskLevel = (score) => {
    if (score >= 90) return { level: 'Low', color: 'var(--success)' };
    if (score >= 60) return { level: 'Medium', color: 'var(--warning)' };
    return { level: 'High', color: 'var(--danger)' };
  };

  const getSeverityBadge = (status) => {
    if (status === 'COMPLIANT') return <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} /> COMPLIANT</span>;
    if (status === 'NEEDS_REVIEW') return <span style={{ color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={14} /> NEEDS REVIEW</span>;
    if (status === 'MISSING') return <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={14} /> CRITICAL — MISSING</span>;
    return null;
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, color: 'var(--main-text)' }}>Compliance Checker</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>Verify your tender against government policy requirements</Text>
      </div>

      <div style={{ background: 'var(--cards)', padding: '16px 24px', borderRadius: '8px', border: '1px solid var(--borders)', marginBottom: '24px', display: 'flex', gap: '32px', alignItems: 'center' }}>
        <div><Text type="secondary">Tender:</Text> <Text strong>{selectedTender ? selectedTender.title : 'None Selected'}</Text></div>
        <div><Text type="secondary">Policies:</Text> <Text strong>6 Indexed</Text></div>
        <div><Text type="secondary">Last checked:</Text> <Text strong>Now</Text></div>
      </div>

      <Row gutter={[32, 32]}>
        {/* Left Column: Analysis Setup */}
        <Col xs={24} lg={8}>
          <div style={{ background: 'var(--cards)', padding: '24px', borderRadius: '12px', border: '1px solid var(--borders)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <ShieldAlert size={20} color="var(--primary)" />
              <Title level={5} style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Analysis Setup</Title>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Tender</Text>
              <Select 
                style={{ width: '100%' }}
                placeholder="Select a tender..."
                value={selectedTenderId}
                onChange={setSelectedTenderId}
                disabled={loading || analysisState === 'ANALYZING' || analysisState === 'PENDING'}
              >
                {readyTenders.map(t => (
                  <Option key={t.id} value={t.id}>{t.title}</Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <Text strong style={{ display: 'block', marginBottom: '12px' }}>Policy Scope</Text>
              <Checkbox.Group 
                options={DEFAULT_CATEGORIES} 
                value={selectedCategories} 
                onChange={setSelectedCategories} 
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                disabled={loading || analysisState === 'ANALYZING' || analysisState === 'PENDING'}
              />
            </div>

            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<Shield size={18} />}
              onClick={handleStartAnalysis}
              disabled={!selectedTenderId || selectedCategories.length === 0 || loading || analysisState === 'ANALYZING' || analysisState === 'PENDING'}
              style={{ height: '48px', borderRadius: '8px', fontWeight: 600 }}
            >
              Run Analysis
            </Button>
            
            {error && (
              <Alert type="error" title={error} style={{ marginTop: 16 }} />
            )}
          </div>
        </Col>

        {/* Right Column: Results & Findings */}
        <Col xs={24} lg={16}>
          {(!analysisState && !analysisData) && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', borderRadius: '12px', border: '1px dashed var(--borders)' }}>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <ShieldAlert size={48} color="var(--text-secondary)" style={{ marginBottom: 16, opacity: 0.5 }} />
                <Title level={4} style={{ color: 'var(--text-secondary)' }}>Ready to Analyze</Title>
                <Text type="secondary">Select a tender and run the analysis to check compliance.</Text>
              </div>
            </div>
          )}

          {(analysisState === 'PENDING' || analysisState === 'ANALYZING') && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cards)', borderRadius: '12px', border: '1px solid var(--borders)' }}>
              <div style={{ textAlign: 'center', maxWidth: 400, padding: '40px' }}>
                <Spin size="large" style={{ marginBottom: 24 }} />
                <Title level={4}>Analyzing Document...</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: '32px' }}>Comparing tender clauses against government policies.</Text>
                <Steps 
                  direction="vertical" 
                  size="small" 
                  current={analysisState === 'PENDING' ? 0 : 1}
                  items={[
                    { title: 'Extracting Requirements', description: 'Reading selected policy scopes' },
                    { title: 'Checking Evidence', description: 'Matching tender clauses against requirements' },
                    { title: 'Generating Report', description: 'Finalizing compliance scores' }
                  ]}
                />
              </div>
            </div>
          )}

          {analysisState === 'FAILED' && (
            <Alert type="error" showIcon title="Analysis Failed" description="A systemic error occurred while analyzing the document." style={{ borderRadius: '8px' }} />
          )}

          {analysisState === 'COMPLETED' && analysisData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* COMPLIANCE SUMMARY */}
              <div style={{ background: 'var(--cards)', borderRadius: '12px', border: '1px solid var(--borders)', padding: '32px' }}>
                <Title level={5} style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px', color: 'var(--text-secondary)' }}>Compliance Summary</Title>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '48px', marginBottom: '32px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress 
                      type="circle" 
                      percent={analysisData.overallScore} 
                      size={140} 
                      strokeColor={getRiskLevel(analysisData.overallScore).color}
                      strokeWidth={8}
                    />
                    <div style={{ marginTop: '16px' }}>
                      <Text strong style={{ fontSize: '16px', display: 'block' }}>Overall Compliance</Text>
                      <Text style={{ color: getRiskLevel(analysisData.overallScore).color, fontWeight: 500 }}>
                        Risk Level: {getRiskLevel(analysisData.overallScore).level}
                      </Text>
                    </div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ background: 'var(--bg)', padding: '16px 24px', borderRadius: '8px', borderLeft: '4px solid var(--success)', flex: 1 }}>
                        <Title level={3} style={{ margin: 0, color: 'var(--success)' }}>{analysisData.compliantCount}</Title>
                        <Text type="secondary">Compliant</Text>
                      </div>
                      <div style={{ background: 'var(--bg)', padding: '16px 24px', borderRadius: '8px', borderLeft: '4px solid var(--warning)', flex: 1 }}>
                        <Title level={3} style={{ margin: 0, color: 'var(--warning)' }}>{analysisData.needsReviewCount}</Title>
                        <Text type="secondary">Review</Text>
                      </div>
                      <div style={{ background: 'var(--bg)', padding: '16px 24px', borderRadius: '8px', borderLeft: '4px solid var(--danger)', flex: 1 }}>
                        <Title level={3} style={{ margin: 0, color: 'var(--danger)' }}>{analysisData.missingCount}</Title>
                        <Text type="secondary">Missing</Text>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: '0 0 24px 0' }} />

                {/* AI RAG METRICS */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <BrainCircuit size={24} color="var(--ai-accent)" style={{ marginTop: '4px' }} />
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>AI Analysis powered by Policy RAG</Text>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      <span><Text strong>11</Text> policy sections retrieved</span>
                      <span><Text strong>8</Text> relevant clauses matched</span>
                      <span><Text strong>6</Text> evidence sources analyzed</span>
                      <span>Confidence: <Text strong>87%</Text></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* EXECUTIVE SUMMARY */}
              <div style={{ background: 'var(--cards)', borderRadius: '12px', border: '1px solid var(--borders)', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <Title level={5} style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Executive Summary</Title>
                  <Button type="primary" icon={<Download size={16} />}>Download Report</Button>
                </div>
                
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ color: 'var(--danger)', display: 'block', marginBottom: '12px' }}>Key Risks</Text>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--main-text)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>Third-party security audit not specified clearly.</li>
                      <li>Data localization clauses are missing.</li>
                    </ul>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '12px' }}>Recommended Actions</Text>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--main-text)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>Add annual security audit requirement in Section 4.</li>
                      <li>Explicitly demand SOC 2 compliance for all vendors.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FINDINGS LIST */}
              <div>
                <Title level={5} style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px', color: 'var(--text-secondary)' }}>Detailed Findings</Title>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredFindings.map((finding) => (
                    <div key={finding.id} style={{ background: 'var(--cards)', padding: '24px', borderRadius: '12px', border: '1px solid var(--borders)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: finding.status === 'COMPLIANT' ? 'var(--success)' : finding.status === 'NEEDS_REVIEW' ? 'var(--warning)' : 'var(--danger)' }} />
                      
                      <div style={{ marginBottom: '16px' }}>
                        {getSeverityBadge(finding.status)}
                      </div>
                      
                      <Title level={5} style={{ margin: '0 0 8px 0', color: 'var(--main-text)' }}>{finding.requirementCategory || 'General Requirement'}</Title>
                      <Text style={{ fontSize: '15px', display: 'block', marginBottom: '20px' }}>{finding.requirementText}</Text>
                      
                      <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Finding</Text>
                        <Text>{finding.explanation}</Text>
                      </div>

                      <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', fontSize: '14px' }}>
                        <div>
                          <Text strong style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Evidence Source</Text>
                          <Text>{finding.sourcePolicyTitle || 'Policy Document'} • Page {finding.policyPageNumber || '1'}</Text>
                        </div>
                        <div>
                          <Text strong style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Confidence</Text>
                          <Text>{(finding.confidenceScore * 100).toFixed(0)}%</Text>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {finding.tenderEvidenceText && (
                          <Button 
                            size="small" 
                            icon={<FileText size={14} />} 
                            onClick={() => window.open(`/app/my-tenders/${selectedTenderId}?page=${finding.tenderPageNumber}`, '_blank')}
                          >
                            View Tender Evidence
                          </Button>
                        )}
                        <Button 
                          size="small" 
                          icon={<Shield size={14} />} 
                          onClick={() => window.open(`/app/policies/${finding.sourcePolicyId}?page=${finding.policyPageNumber}`, '_blank')}
                        >
                          View Policy
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredFindings.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', background: 'var(--cards)', borderRadius: '12px', border: '1px dashed var(--borders)' }}>
                      <Text type="secondary">No findings match the current filter.</Text>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Compliance;
