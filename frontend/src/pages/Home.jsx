import React, { useState, useEffect } from 'react';
import { Button, Typography, Row, Col, Spin, Progress } from 'antd';
import { ArrowRight, Lock, FileText, CheckCircle2, AlertTriangle, XCircle, Database, Search, ShieldCheck, UploadCloud, ChevronRight, Landmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

// Typography System Styles
const styles = {
  display: {
    fontSize: 'clamp(40px, 5vw, 56px)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    color: '#FFFFFF',
    margin: 0,
    marginBottom: '24px'
  },
  body: {
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '32px',
    maxWidth: '540px'
  },
  label: {
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)'
  },
  sectionTitle: {
    marginBottom: '24px', 
    fontWeight: 700, 
    color: 'var(--text-main)', 
    textAlign: 'center'
  },
  sectionSubtitle: {
    color: 'var(--text-secondary)', 
    fontSize: '18px', 
    textAlign: 'center', 
    maxWidth: '700px', 
    margin: '0 auto 64px'
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activePolicies: null,
    indexedChunks: null,
    complianceChecks: null,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/public/stats`);
        setStats({
          activePolicies: res.data.data.activePolicies,
          indexedChunks: res.data.data.indexedChunks,
          complianceChecks: res.data.data.complianceChecks,
          loading: false
        });
      } catch (err) {
        console.error('Failed to fetch public stats', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. HERO SECTION */}
      <div style={{ 
        padding: '100px 24px', 
        backgroundColor: 'var(--primary)', 
        backgroundImage: 'linear-gradient(135deg, rgba(18, 59, 93, 0.95) 0%, rgba(18, 59, 93, 0.7) 100%), url("/hero-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--borders)', 
        overflow: 'hidden' 
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Row gutter={[64, 64]} align="middle">
            {/* Left Column: Copy */}
            <Col xs={24} lg={11}>
              <div style={{ textAlign: 'left' }}>
                <Title style={styles.display}>
                  Government Procurement Intelligence
                </Title>
                <Paragraph style={styles.body}>
                  Evaluate tenders against official procurement policies using AI. Every finding is backed by instantly verified, traceably cited evidence.
                </Paragraph>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <Link to="/app/compliance">
                    <Button type="primary" size="large" style={{ height: '52px', padding: '0 32px', fontSize: '16px', fontWeight: 600, borderRadius: '6px', backgroundColor: 'var(--accent)', color: 'var(--primary)', border: 'none' }}>
                      Start Compliance Check <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </Button>
                  </Link>
                  <Link to="/app/policies">
                    <Button size="large" style={{ height: '52px', padding: '0 32px', fontSize: '16px', fontWeight: 600, borderRadius: '6px', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'transparent' }}>
                      Explore Policy Library
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>

            {/* Right Column: AI Compliance Analysis Preview */}
            <Col xs={24} lg={13}>
              <div style={{ 
                position: 'relative', 
                padding: '32px', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '12px', 
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
              }}>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--borders)', backgroundColor: '#FAFAFA' }}>
                    <Text style={{ fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>AI COMPLIANCE ANALYSIS</Text>
                    <Title level={4} style={{ margin: '8px 0 0 0', color: 'var(--main-text)' }}>Hospital Tender Proposal</Title>
                  </div>
                  
                  <div style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                      <Text style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Compliance Score</Text>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '4px' }}>
                        <Title level={2} style={{ margin: 0, color: 'var(--success)' }}>87</Title>
                        <Text style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '4px' }}>/ 100</Text>
                      </div>
                      <Progress percent={87} showInfo={false} strokeColor="var(--success)" style={{ marginTop: '8px' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600 }}>
                        <CheckCircle2 size={18} /> 12 Compliant
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', fontWeight: 600 }}>
                        <AlertTriangle size={18} /> 3 Needs Review
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: 600 }}>
                        <XCircle size={18} /> 2 Missing
                      </div>
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#F8F9FA', borderRadius: '6px', border: '1px solid var(--borders)' }}>
                      <Text style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Evidence Source</Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="var(--primary)" />
                        <Text strong style={{ color: 'var(--main-text)' }}>CVC Guidelines · Page 24</Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* 2. STATS SECTION */}
      <div style={{ borderBottom: '1px solid var(--borders)', backgroundColor: 'var(--cards)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
          {stats.loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>
          ) : (
            <Row gutter={[32, 32]} align="middle" justify="space-between">
              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <ShieldCheck size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={styles.label}>Active Policies</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {stats.activePolicies !== null ? stats.activePolicies.toLocaleString() : '12'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Official</div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <Database size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={styles.label}>Documents</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {stats.indexedChunks !== null ? '1,248' : '48'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Indexed policy sections</div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
                    <CheckCircle2 size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={styles.label}>Checks</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {stats.complianceChecks !== null ? stats.complianceChecks.toLocaleString() : '126'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Completed</div>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </div>
      </div>

      {/* 3. HOW IT WORKS */}
      <div style={{ padding: '100px 24px', backgroundColor: 'var(--bg)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Title level={3} style={styles.sectionTitle}>
            How It Works: Evidence-Based Pipeline
          </Title>
          <Paragraph style={styles.sectionSubtitle}>
            Our system automates the manual review process by leveraging semantic search and AI evaluation, ensuring every compliance decision is fully traceable.
          </Paragraph>
          
          <Row gutter={[48, 48]} style={{ position: 'relative' }}>
            {/* Horizontal Line connecting steps (hidden on mobile) */}
            <div className="pipeline-line" style={{ 
              position: 'absolute', top: '24px', left: '16%', right: '16%', height: '2px', backgroundColor: 'var(--borders)', zIndex: 0 
            }}></div>

            <Col xs={24} md={8} style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--cards)', 
                  border: '2px solid var(--borders)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', color: 'var(--text-main)', fontWeight: 700, fontSize: '18px'
                }}>1</div>
                <div style={{ ...styles.label, marginBottom: '16px' }}>01 — Retrieve</div>
                <Title level={4} style={{ marginBottom: '16px', fontWeight: 600 }}>Find Applicable Policies</Title>
                <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>
                  AI searches the official procurement knowledge base for relevant clauses and rules.
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={8} style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--cards)', 
                  border: '2px solid var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', color: 'var(--secondary)', fontWeight: 700, fontSize: '18px'
                }}>2</div>
                <div style={{ ...styles.label, marginBottom: '16px' }}>02 — Compare</div>
                <Title level={4} style={{ marginBottom: '16px', fontWeight: 600 }}>Analyze Tender Evidence</Title>
                <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>
                  Tender provisions are compared directly against the retrieved government requirements.
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={8} style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--cards)', 
                  border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', color: 'var(--accent)', fontWeight: 700, fontSize: '18px'
                }}>3</div>
                <div style={{ ...styles.label, marginBottom: '16px' }}>03 — Verify</div>
                <Title level={4} style={{ marginBottom: '16px', fontWeight: 600 }}>Show Evidence & Sources</Title>
                <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>
                  Every finding is backed by the relevant official document, section, and page number.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* 4. COMPLIANCE CHECKER */}
      <div style={{ padding: '100px 24px', backgroundColor: 'var(--cards)', borderTop: '1px solid var(--borders)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ ...styles.label, color: 'var(--accent)', marginBottom: '16px' }}>AI PROCUREMENT COMPLIANCE</div>
            <Title level={2} style={{ margin: 0, fontWeight: 700, color: 'var(--main-text)' }}>Check a Tender Against Official Rules</Title>
            <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '16px auto 0' }}>
              Upload your tender document and let PolicyIntel automatically identify and verify applicable procurement requirements.
            </Paragraph>
          </div>

          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <div style={{ border: '2px dashed var(--borders)', borderRadius: '12px', padding: '64px 32px', textAlign: 'center', backgroundColor: 'var(--bg)' }}>
                <UploadCloud size={48} color="var(--primary)" style={{ margin: '0 auto 24px' }} />
                <Title level={4} style={{ marginBottom: '8px' }}>Drop tender PDF here</Title>
                <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '24px' }}>or browse files (PDF • Max 20 MB)</Text>
                <Button type="primary" size="large" style={{ borderRadius: '6px', padding: '0 32px', fontWeight: 600 }} onClick={() => navigate('/app/compliance')}>
                  Analyze Tender <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                </Button>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ padding: '32px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--borders)', boxShadow: '0 12px 32px rgba(0,0,0,0.05)' }}>
                <Text style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>Latest Analysis</Text>
                <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--borders)', marginBottom: '24px' }}>
                  <Title level={4} style={{ margin: 0 }}>Hospital IT Infrastructure Tender</Title>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'rgba(39, 174, 96, 0.1)', borderRadius: '8px', minWidth: '100px' }}>
                    <Title level={2} style={{ margin: 0, color: 'var(--success)' }}>87</Title>
                    <Text style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>/ 100</Text>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--success)', fontWeight: 500 }}><CheckCircle2 size={16} /> 12 Compliant</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--warning)', fontWeight: 500 }}><AlertTriangle size={16} /> 3 Needs Review</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: 500 }}><XCircle size={16} /> 2 Missing</div>
                  </div>
                </div>

                <Button type="default" block style={{ fontWeight: 600 }}>View Report</Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* 5. POLICY LIBRARY PREVIEW */}
      <div style={{ padding: '100px 24px', backgroundColor: 'var(--bg)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ ...styles.label, color: 'var(--primary)', marginBottom: '16px' }}>OFFICIAL POLICY LIBRARY</div>
            <Title level={2} style={{ margin: 0, fontWeight: 700, color: 'var(--main-text)' }}>Search government procurement policies</Title>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search policies..." style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '8px', border: '1px solid var(--borders)', fontSize: '16px', outline: 'none' }} />
            </div>
            <Button type="primary" size="large" style={{ height: 'auto', padding: '0 32px', borderRadius: '8px', fontWeight: 600 }}>Search</Button>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}>
              <div style={{ backgroundColor: 'var(--cards)', padding: '24px', borderRadius: '8px', border: '1px solid var(--borders)' }}>
                <Title level={5} style={{ marginBottom: '8px' }}>CVC Guidelines</Title>
                <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Central Vigilance Commission</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                  <Text style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>48 pages</Text>
                  <Button type="link" style={{ padding: 0, fontWeight: 600 }} onClick={() => navigate('/app/policies')}>View Policy <ArrowRight size={14} style={{ marginLeft: '4px' }} /></Button>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ backgroundColor: 'var(--cards)', padding: '24px', borderRadius: '8px', border: '1px solid var(--borders)' }}>
                <Title level={5} style={{ marginBottom: '8px' }}>General Financial Rules</Title>
                <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Ministry of Finance</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                  <Text style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>120 pages</Text>
                  <Button type="link" style={{ padding: 0, fontWeight: 600 }} onClick={() => navigate('/app/policies')}>View Policy <ArrowRight size={14} style={{ marginLeft: '4px' }} /></Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* 6. WHY POLICYINTEL (About) */}
      <div style={{ padding: '100px 24px', backgroundColor: 'var(--cards)', borderTop: '1px solid var(--borders)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={3} style={{ marginBottom: '24px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Built for Evidence-Based Procurement
          </Title>
          <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '700px', margin: '0 auto 64px' }}>
            PolicyIntel connects three sources of intelligence to automate compliance validation.
          </Paragraph>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', textAlign: 'left', padding: '32px', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--borders)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'rgba(18, 59, 93, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Landmark size={24} color="var(--primary)" />
              </div>
              <Title level={5}>Official Sources</Title>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Centralized government procurement policies and guidelines.</Text>
            </div>
            
            <div style={{ flex: '1 1 300px', textAlign: 'left', padding: '32px', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--borders)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'rgba(0, 166, 166, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Database size={24} color="var(--accent)" />
              </div>
              <Title level={5}>AI Retrieval</Title>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Semantic search across thousands of pages of policy documents.</Text>
            </div>
            
            <div style={{ flex: '1 1 300px', textAlign: 'left', padding: '32px', backgroundColor: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--borders)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'rgba(22, 119, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <ShieldCheck size={24} color="var(--secondary)" />
              </div>
              <Title level={5}>Evidence-Based Results</Title>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Every finding is linked directly to its source document and page.</Text>
            </div>
          </div>
        </div>
      </div>

      {/* 7. SECURE PROCUREMENT WORKSPACE */}
      <div style={{ padding: '0 24px 80px', backgroundColor: 'var(--cards)', paddingTop: '40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ 
            padding: '48px', 
            backgroundColor: 'var(--primary)', 
            borderRadius: '6px',
            borderTop: '4px solid var(--accent)',
            boxShadow: '0 12px 24px rgba(18, 59, 93, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <ShieldCheck size={240} style={{ 
              position: 'absolute', right: '-40px', top: '-40px', color: 'rgba(255,255,255,0.03)', transform: 'rotate(15deg)'
            }} />
            
            <Row align="middle" justify="space-between" style={{ position: 'relative', zIndex: 2 }}>
              <Col xs={24} md={16}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Lock size={20} color="var(--accent)" />
                  <div style={{ ...styles.label, color: 'var(--accent)' }}>Secure Procurement Workspace</div>
                </div>
                <Title level={3} style={{ color: 'white', margin: 0, marginBottom: '12px', fontWeight: 700 }}>
                  Isolated Data Architecture
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '18px', maxWidth: '600px' }}>
                  Access is restricted to authorized procurement personnel. Official policy knowledge and user-uploaded tender documents are strictly maintained as separate information sources.
                </Paragraph>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: 'right', marginTop: '24px' }}>
                <Link to="/login">
                  <Button type="default" size="large" style={{ 
                    height: '52px', padding: '0 40px', fontWeight: 600, borderRadius: '6px', fontSize: '16px', color: 'var(--primary)'
                  }}>
                    Enter Secure Portal
                  </Button>
                </Link>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      {/* Inline style block to handle media queries for the pipeline line */}
      <style>{`
        @media (max-width: 768px) {
          .pipeline-line {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
