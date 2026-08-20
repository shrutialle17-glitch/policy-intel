import React from 'react';
import { Typography, Button, Row, Col, Card, Space, Steps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Library, 
  FileText, 
  Bot, 
  ShieldAlert, 
  CheckCircle,
  UploadCloud,
  BrainCircuit,
  BarChart3
} from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      {/* Hero Section */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--cards)', borderBottom: '1px solid var(--borders)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <Title level={1} style={{ color: 'var(--primary)', fontSize: '48px', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1 }}>
                Intelligent Access to Government Policy
              </Title>
              <Paragraph style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                Search, understand and analyze government policies with AI-powered intelligence. Get reliable answers from official policy sources and evaluate procurement compliance with confidence.
              </Paragraph>
              <Space size="middle">
                <Button type="primary" size="large" style={{ height: '48px', padding: '0 32px', fontSize: '16px', fontWeight: 500 }} onClick={() => navigate('/register')}>
                  Get Started
                </Button>
                <Button size="large" style={{ height: '48px', padding: '0 32px', fontSize: '16px', fontWeight: 500 }} onClick={() => navigate('/app/policies')}>
                  Explore Policies
                </Button>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              {/* Abstract Visualization */}
              <div style={{ 
                backgroundColor: 'var(--bg)', 
                borderRadius: '16px', 
                padding: '40px',
                border: '1px solid var(--borders)',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Card size="small" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <Space>
                      <FileText color="var(--primary)" />
                      <Text strong>Policy Documents</Text>
                    </Space>
                  </Card>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '2px', height: '24px', backgroundColor: 'var(--borders)' }}></div>
                  </div>
                  <Card size="small" style={{ borderLeft: '4px solid var(--secondary)', backgroundColor: '#F0F5FF' }}>
                    <Space>
                      <BrainCircuit color="var(--secondary)" />
                      <Text strong style={{ color: 'var(--secondary)' }}>AI / RAG</Text>
                    </Space>
                  </Card>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '2px', height: '24px', backgroundColor: 'var(--borders)' }}></div>
                  </div>
                  <Card size="small" style={{ borderLeft: '4px solid var(--accent)', backgroundColor: '#F0FFFF' }}>
                    <Space>
                      <Search color="var(--accent)" />
                      <Text strong style={{ color: 'var(--accent)' }}>Intelligence</Text>
                    </Space>
                  </Card>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '2px', height: '24px', backgroundColor: 'var(--borders)' }}></div>
                  </div>
                  <Card size="small" style={{ borderLeft: '4px solid var(--success)' }}>
                    <Space>
                      <CheckCircle color="var(--success)" />
                      <Text strong>Action</Text>
                    </Space>
                  </Card>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Trust Strip */}
      <section style={{ padding: '24px', backgroundColor: 'var(--primary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>
            Built for smarter government decision-making
          </Text>
          <Row justify="center" gutter={[32, 16]}>
            {['Official Policy Sources', 'AI-Assisted Analysis', 'Source-Grounded Answers', 'Procurement Intelligence'].map((item, index) => (
              <Col key={index}>
                <Space>
                  <CheckCircle size={16} color="var(--accent)" />
                  <span style={{ color: 'white', fontWeight: 500 }}>{item}</span>
                </Space>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <Title level={2}>Everything You Need for Policy Intelligence</Title>
          </div>
          <Row gutter={[24, 24]}>
            {[
              { title: 'Policy Library', desc: 'Browse, search and organize government policies and guidelines.', icon: <Library size={32} color="var(--primary)" /> },
              { title: 'Ask Policy AI', desc: 'Ask questions and receive answers grounded in official policy documents.', icon: <Bot size={32} color="var(--accent)" /> },
              { title: 'Smart Document Processing', desc: 'Upload policy documents and automatically extract structured information.', icon: <FileText size={32} color="var(--secondary)" /> },
              { title: 'Compliance Intelligence', desc: 'Analyze tenders and contracts against applicable government policies.', icon: <ShieldAlert size={32} color="var(--warning)" /> }
            ].map((feature, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card style={{ height: '100%' }}>
                  <div style={{ marginBottom: '16px' }}>{feature.icon}</div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph style={{ color: 'var(--text-secondary)' }}>{feature.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '80px 24px', backgroundColor: 'var(--cards)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <Title level={2}>How It Works</Title>
          </div>
          <Steps
            items={[
              { title: '01 Upload', description: 'Upload policy or procurement documents.', icon: <UploadCloud /> },
              { title: '02 Understand', description: 'Documents are processed and structured.', icon: <BrainCircuit /> },
              { title: '03 Ask', description: 'AI retrieves relevant policy information.', icon: <Bot /> },
              { title: '04 Analyze', description: 'Compliance intelligence identifies risks and recommendations.', icon: <BarChart3 /> },
            ]}
          />
        </div>
      </section>

      {/* AI & Compliance Preview */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[48, 48]}>
            {/* Ask Policy AI Preview */}
            <Col xs={24} md={12}>
              <Title level={3}>Ask Policy AI</Title>
              <Card style={{ marginTop: '24px', border: '1px solid var(--borders)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ alignSelf: 'flex-end', backgroundColor: '#F0F5FF', padding: '12px 16px', borderRadius: '16px 16px 0 16px' }}>
                    <Text>What documents are required for a government tender?</Text>
                  </div>
                  <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--bg)', padding: '12px 16px', borderRadius: '16px 16px 16px 0', maxWidth: '90%' }}>
                    <Text>Based on the applicable procurement guidelines, the tender requires...</Text>
                    <div style={{ marginTop: '12px', padding: '8px', borderLeft: '3px solid var(--accent)', backgroundColor: 'var(--cards)' }}>
                      <Text style={{ fontSize: '12px', display: 'block', color: 'var(--text-secondary)' }}>Source:</Text>
                      <Text style={{ fontSize: '12px', fontWeight: 600 }}>Government Procurement Guidelines</Text>
                      <Text style={{ fontSize: '12px', display: 'block', color: 'var(--text-secondary)' }}>Page 24</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Compliance Preview */}
            <Col xs={24} md={12}>
              <Title level={3}>Procurement Compliance</Title>
              <Card style={{ marginTop: '24px', textAlign: 'center' }}>
                <div style={{ padding: '24px 0' }}>
                  <Title level={1} style={{ margin: 0, color: 'var(--warning)' }}>82%</Title>
                  <Text style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Partially Compliant</Text>
                </div>
                <div style={{ textAlign: 'left', padding: '16px', backgroundColor: 'var(--bg)', borderRadius: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Space><CheckCircle color="var(--success)" size={16}/><Text>Compliant</Text></Space>
                    <Text strong>12</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Space><ShieldAlert color="var(--warning)" size={16}/><Text>Warnings</Text></Space>
                    <Text strong>3</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Space><div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>✕</div><Text>Violations</Text></Space>
                    <Text strong>2</Text>
                  </div>
                </div>
                <Button type="primary" block onClick={() => navigate('/app/compliance')}>
                  Explore Compliance Intelligence
                </Button>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default Home;
