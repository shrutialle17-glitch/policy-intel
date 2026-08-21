import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Alert, Button, Layout, Menu } from 'antd';
import { BookOpen, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuestionInput from '../components/ask-policy/QuestionInput';
import LoadingState from '../components/ask-policy/LoadingState';
import AIFindingBlock from '../components/shared/AIFindingBlock';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

const AskPolicy = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/policy-ai/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setChatHistory(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAsk = async (question) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentQuestion(question);

    try {
      const res = await fetch('/api/policy-ai/ask', {
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
      
      // Add the new item to state
      const newEntry = {
        id: data.data.id || Date.now().toString(),
        question,
        answer: data.data.answer,
        citations: data.data.citations,
        grounded: data.data.grounded,
        createdAt: new Date().toISOString()
      };
      setChatHistory(prev => [newEntry, ...prev].slice(0, 50));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuestion = () => {
    setResult(null);
    setCurrentQuestion('');
    setError(null);
  };

  const loadHistoryItem = (item) => {
    setCurrentQuestion(item.question);
    setResult({ answer: item.answer, citations: item.citations, grounded: item.grounded });
    setError(null);
  };

  const clearHistory = async () => {
    try {
      const res = await fetch('/api/policy-ai/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        setChatHistory([]);
        handleNewQuestion();
      }
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  const deleteHistoryItem = async (e, id) => {
    e.stopPropagation(); // prevent loading item
    try {
      const res = await fetch(`/api/policy-ai/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        setChatHistory(prev => prev.filter(item => item.id !== id));
        // If we deleted the currently viewed item, reset view
        const isCurrentViewed = chatHistory.find(item => item.id === id && item.question === currentQuestion);
        if (isCurrentViewed) {
          handleNewQuestion();
        }
      }
    } catch (err) {
      console.error('Failed to delete history item', err);
    }
  };

  const handleViewSource = (sourceId, pageNumber) => {
    navigate(`/app/policies/${sourceId}?page=${pageNumber}`);
  };

  return (
    <Layout style={{ background: 'transparent', minHeight: 'calc(100vh - 64px - 48px)' }}>
      {/* Chat History Sidebar */}
      <Sider width={260} style={{ background: 'transparent', borderRight: '1px solid var(--borders)', paddingRight: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Questions</Text>
          {chatHistory.length > 0 && (
            <Button type="text" size="small" onClick={clearHistory} icon={<Trash2 size={14} />} style={{ color: 'var(--text-secondary)' }} />
          )}
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {historyLoading ? (
            <Text type="secondary" style={{ fontSize: '13px' }}>Loading history...</Text>
          ) : chatHistory.length === 0 ? (
            <Text type="secondary" style={{ fontSize: '13px' }}>No recent questions.</Text>
          ) : (
            chatHistory.map((item) => (
              <div 
                key={item.id} 
                onClick={() => loadHistoryItem(item)}
                style={{ 
                  padding: '10px 12px', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  backgroundColor: currentQuestion === item.question ? 'rgba(0,166,166,0.1)' : 'transparent',
                  border: currentQuestion === item.question ? '1px solid rgba(0,166,166,0.3)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  position: 'relative'
                }}
                onMouseOver={(e) => { 
                  if(currentQuestion !== item.question) e.currentTarget.style.backgroundColor = 'var(--bg)';
                  const btn = e.currentTarget.querySelector('.delete-btn');
                  if (btn) btn.style.opacity = '1';
                }}
                onMouseOut={(e) => { 
                  if(currentQuestion !== item.question) e.currentTarget.style.backgroundColor = 'transparent'; 
                  const btn = e.currentTarget.querySelector('.delete-btn');
                  if (btn) btn.style.opacity = '0';
                }}
              >
                <MessageSquare size={14} color={currentQuestion === item.question ? 'var(--accent)' : 'var(--text-secondary)'} style={{ marginTop: '3px', flexShrink: 0 }} />
                <div style={{ fontSize: '13px', color: currentQuestion === item.question ? 'var(--accent)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                  {item.question}
                </div>
                <Button 
                  className="delete-btn"
                  type="text" 
                  size="small" 
                  icon={<Trash2 size={12} />} 
                  onClick={(e) => deleteHistoryItem(e, item.id)}
                  style={{ 
                    opacity: 0, 
                    transition: 'opacity 0.2s', 
                    color: 'var(--text-secondary)',
                    padding: '0 4px',
                    height: '20px'
                  }}
                />
              </div>
            ))
          )}
        </div>
      </Sider>

      <Content style={{ paddingLeft: '32px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={28} color="var(--primary)" />
            <Title level={2} style={{ margin: 0, color: 'var(--main-text)', fontWeight: 600 }}>Policy Intelligence Assistant</Title>
          </div>
          <Button 
            icon={<Plus size={16} />} 
            onClick={handleNewQuestion}
            style={{ fontWeight: 500, borderRadius: '6px' }}
          >
            New Question
          </Button>
        </div>
        <Text type="secondary" style={{ display: 'block', marginBottom: '32px', fontSize: '15px' }}>
          Ask questions about government policies, procurement guidelines and compliance requirements.
        </Text>

        <QuestionInput onAsk={handleAsk} disabled={loading} />

        {loading && <LoadingState />}

        {error && (
          <Alert 
            message="Research Failed" 
            description={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: '24px', borderRadius: '8px' }}
            action={
              <Button size="small" type="primary" onClick={() => handleAsk(currentQuestion)}>
                Retry
              </Button>
            }
          />
        )}

        {result && !loading && !error && (
          <div style={{ marginTop: '24px' }}>
            <Title level={4} style={{ color: 'var(--text-main)', marginBottom: '16px' }}>{currentQuestion}</Title>
            {!result.grounded ? (
              <Alert 
                message="Information Not Found" 
                description="I could not find sufficient information in the uploaded official policy documents to answer this question." 
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
      </Content>
    </Layout>
  );
};

export default AskPolicy;
