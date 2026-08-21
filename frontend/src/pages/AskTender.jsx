import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Alert, Button, Spin, Result, Select, Card, Space, Divider } from 'antd';
import { FileText, ArrowLeft, Download, ShieldCheck, Sparkles, Box, CheckCircle2, FileSearch } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import QuestionInput from '../components/ask-policy/QuestionInput';
import LoadingState from '../components/ask-policy/LoadingState';
import AIFindingBlock from '../components/shared/AIFindingBlock';
import { format } from 'date-fns';

const { Title, Text } = Typography;

const tenderSuggestions = [
  "What is the eligibility criteria?",
  "What documents are required from bidders?",
  "What are the payment conditions?",
  "What is the evaluation process?",
  "What are the key deadlines?"
];

const AskTender = () => {
  const { id: urlId } = useParams();
  const [searchParams] = useSearchParams();
  const queryTenderId = searchParams.get('tenderId');
  const navigate = useNavigate();
  
  const [localId, setLocalId] = useState(null);
  const activeId = urlId || queryTenderId || localId;

  const [tender, setTender] = useState(null);
  const [tenderLoading, setTenderLoading] = useState(true);
  const [tendersList, setTendersList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');

  // Fetch all tenders for the selector if we don't have a specific urlId
  useEffect(() => {
    if (!urlId) {
      const fetchAllTenders = async () => {
        try {
          const res = await fetch('/api/tenders', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const data = await res.json();
          const readyTenders = (data.data || []).filter(t => t.status === 'READY');
          setTendersList(readyTenders);
          
          if (!activeId) {
            setTenderLoading(false);
          }
        } catch (err) {
          setError(err.message);
          setTenderLoading(false);
        }
      };
      fetchAllTenders();
    }
  }, [urlId, activeId]);

  // Fetch the active tender details
  useEffect(() => {
    if (!activeId) return;

    setTenderLoading(true);
    const fetchTender = async () => {
      try {
        const res = await fetch(`/api/tenders/${activeId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.status === 404) {
          if (urlId) navigate('/app/my-tenders');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch tender');
        const data = await res.json();
        setTender(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setTenderLoading(false);
      }
    };
    fetchTender();
  }, [activeId, urlId, navigate]);

  const handleAsk = async (question) => {
    if (!activeId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentQuestion(question);

    try {
      const res = await fetch(`/api/tenders/${activeId}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ question })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to fetch response');
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSource = () => {
    if (activeId) navigate(`/app/my-tenders/${activeId}`);
  };

  const handleTenderChange = (value) => {
    setLocalId(value);
    setResult(null);
    setError(null);
    setCurrentQuestion('');
    if (urlId) {
      navigate(`/app/ask-tender?tenderId=${value}`); // Update URL if needed, or just setLocalId
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/tenders/${activeId}/file`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to get download link');
      const data = await res.json();
      window.open(data.data.signedUrl, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  if (tenderLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  // If no tender is selected yet
  if (!activeId) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto' }}>
        <Card 
          style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid var(--borders)' }}
          bodyStyle={{ padding: '40px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Sparkles size={28} color="var(--ai-accent)" />
            <Title level={2} style={{ margin: 0, color: 'var(--main-text)' }}>
              Tender Intelligence
            </Title>
          </div>
          
          <Title level={5} style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Select a processed tender</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
            Choose a processed tender document to start an AI-powered analysis.
          </Text>
          
          {tendersList.length === 0 ? (
             <Alert 
               type="info" 
               title="No processed tenders available" 
               description="Please upload and process a tender first in the My Tenders section." 
               action={<Button type="primary" onClick={() => navigate('/app/my-tenders')}>Go to My Tenders</Button>} 
             />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Select
                style={{ width: '100%', height: '50px' }}
                placeholder="Select a tender..."
                onChange={handleTenderChange}
                options={tendersList.map(t => ({ 
                  value: t.id, 
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="var(--primary)" />
                      {t.title}
                    </div>
                  )
                }))}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                <CheckCircle2 size={16} /> <span style={{ fontWeight: 500 }}>Ready for AI analysis</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (tender && tender.status !== 'READY') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <Result
          status={tender.status === 'FAILED' ? 'error' : 'info'}
          title={tender.status === 'FAILED' ? 'Processing Failed' : 'Document Still Processing'}
          subTitle={
            tender.status === 'FAILED' 
              ? 'This document failed to process. Please retry from the Tender Detail page.'
              : 'This document is still being analyzed. Please wait until it is ready to ask questions.'
          }
          extra={[
            <Button type="primary" key="back" onClick={() => navigate(`/app/my-tenders/${activeId}`)}>
              Back to Tender
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: 'var(--main-text)', marginBottom: '8px' }}>Tender Intelligence</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{tender?.title}</span>
            <span>•</span>
            <span>{tender?.fileSizeBytes ? `${(tender.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : ''}</span>
            <span>•</span>
            <span>Uploaded {tender?.createdAt ? format(new Date(tender.createdAt), 'MMM d, yyyy') : ''}</span>
            <span>•</span>
            <span style={{ color: 'var(--success)', fontWeight: 500 }}>● Ready</span>
          </div>
        </div>
        
        <Space>
          <Button icon={<Download size={16} />} onClick={handleDownload} style={{ borderRadius: '6px' }}>
            View PDF
          </Button>
          <Select
            style={{ width: '220px' }}
            value={activeId}
            onChange={handleTenderChange}
            options={tendersList.map(t => ({ value: t.id, label: t.title }))}
            placeholder="Change Tender ▼"
          />
        </Space>
      </div>

      <Row gutter={[32, 32]}>
        {/* Left Column: Ask a Question */}
        <Col xs={24} lg={16}>
          <div style={{ background: 'var(--cards)', padding: '32px', borderRadius: '12px', border: '1px solid var(--borders)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Sparkles size={24} color="var(--ai-accent)" />
              <Title level={4} style={{ margin: 0, color: 'var(--main-text)' }}>Ask About This Tender</Title>
            </div>
            
            <Text type="secondary" style={{ display: 'block', marginBottom: '24px', fontSize: '15px' }}>
              Ask questions about requirements, eligibility, evaluation, payment terms, and deadlines.
            </Text>

            <QuestionInput 
              onAsk={handleAsk} 
              disabled={loading} 
              placeholder="Ask a question about this tender..."
              suggestions={tenderSuggestions}
            />

            {loading && <div style={{ marginTop: '32px' }}><LoadingState title="Searching this document" description="Extracting relevant clauses..." /></div>}

            {error && (
              <Alert 
                title="Research Failed" 
                description={error} 
                type="error" 
                showIcon 
                style={{ marginTop: '24px', borderRadius: '8px' }}
                action={
                  currentQuestion ? (
                    <Button size="small" type="primary" onClick={() => handleAsk(currentQuestion)}>
                      Retry
                    </Button>
                  ) : null
                }
              />
            )}

            {result && !loading && !error && (
              <div style={{ marginTop: '32px' }}>
                <Title level={4} style={{ color: 'var(--text-main)', marginBottom: '16px' }}>{currentQuestion}</Title>
                {!result.grounded ? (
                  <Alert 
                    title="Information Not Found" 
                    description="I could not find sufficient information in the selected tender document to answer this question." 
                    type="info" 
                    showIcon 
                    style={{ borderRadius: '8px' }}
                  />
                ) : (
                  <AIFindingBlock 
                    answer={result.answer} 
                    citations={result.citations} 
                    onViewSource={handleViewSource} 
                  />
                )}
              </div>
            )}
          </div>
        </Col>

        {/* Right Column: Tender Snapshot & Compliance */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSearch size={18} color="var(--text-secondary)" />
                <span style={{ fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Tender Snapshot</span>
              </div>
            }
            bordered={true}
            style={{ borderRadius: '12px', marginBottom: '24px' }}
            styles={{ header: { background: 'var(--bg)', borderBottom: '1px solid var(--borders)' } }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--main-text)' }}>PDF Document</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tender?.fileSizeBytes ? `${(tender.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : ''}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Box size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--main-text)' }}>Processing Status</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>AI Ready</div>
                </div>
              </div>
            </div>
          </Card>

          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--text-secondary)" />
                <span style={{ fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Next Step</span>
              </div>
            }
            bordered={true}
            style={{ borderRadius: '12px' }}
            styles={{ header: { background: 'var(--bg)', borderBottom: '1px solid var(--borders)' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Title level={5} style={{ margin: 0 }}>Check Compliance</Title>
            </div>
            <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
              Compare this tender against indexed government policies in the Policy Library.
            </Text>
            <Button 
              type="primary" 
              icon={<ShieldCheck size={16} />} 
              onClick={() => navigate(`/app/compliance?tenderId=${activeId}`)}
              style={{ width: '100%', height: '40px', borderRadius: '6px' }}
            >
              Run Compliance Check →
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AskTender;
