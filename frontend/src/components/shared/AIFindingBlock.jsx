import React, { useState } from 'react';
import { Typography, Row, Col, Progress, Button, Divider, Space, Collapse, Tag } from 'antd';
import { Sparkles, FileText, ExternalLink, FileSearch, CheckCircle2, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const HeroAnswer = styled.div`
  background-color: var(--cards);
  border: 1px solid var(--borders);
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
`;

const AILabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ai-accent);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 24px;
  text-transform: uppercase;
`;

const AIFindingBlock = ({ 
  answer, 
  citations = [], 
  onViewSource = () => {} 
}) => {
  const [showEvidence, setShowEvidence] = useState(false);

  // Calculate mock evidence strength based on number of citations
  const evidenceScore = Math.min(100, 60 + (citations.length * 10));

  return (
    <HeroAnswer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <AILabel>
          <Sparkles size={16} />
          AI Answer
        </AILabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600, fontSize: '13px' }}>
          GROUNDED <CheckCircle2 size={16} />
        </div>
      </div>
      
      <div style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-main)', whiteSpace: 'pre-wrap', marginBottom: '32px' }}>
        {answer}
      </div>

      <Divider style={{ margin: '0 0 24px 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Evidence strength
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '200px' }}>
              <Progress percent={evidenceScore} showInfo={false} strokeColor="var(--ai-accent)" railColor="var(--bg)" size="small" />
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{evidenceScore}%</span>
            </div>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>{citations.length} sources used</Text>
        </div>
      </div>

      {citations.length > 0 && (
        <div style={{ background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--borders)' }}>
          <div 
            style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowEvidence(!showEvidence)}
          >
            <Text strong style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
              Sources & Evidence ({citations.length})
            </Text>
            <Button type="text" size="small" style={{ color: 'var(--primary)' }}>
              {showEvidence ? 'Hide Evidence' : 'View Evidence'}
            </Button>
          </div>
          
          {!showEvidence && (
            <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {citations.slice(0, 3).map((citation, index) => {
                const isTender = citation.type === 'tender' || citation.citationType === 'tender';
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--main-text)', fontSize: '14px' }}>
                    <ChevronRight size={14} color="var(--borders)" />
                    {isTender ? <FileSearch size={14} color="var(--ai-accent)" /> : <FileText size={14} color="var(--primary)" />}
                    <span>{citation.sourceTitle || citation.policyTitle}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>— Page {citation.pageNumber}</span>
                  </div>
                );
              })}
              {citations.length > 3 && (
                <div style={{ paddingLeft: '24px', color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>
                  + {citations.length - 3} more sources...
                </div>
              )}
            </div>
          )}

          {showEvidence && (
            <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {citations.map((citation, index) => {
                const isTender = citation.type === 'tender' || citation.citationType === 'tender';
                const fullText = citation.chunkText || citation.excerpt || '';
                
                return (
                  <div key={index} style={{ background: 'var(--cards)', padding: '16px', borderRadius: '8px', border: '1px solid var(--borders)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isTender ? <FileSearch size={16} color="var(--ai-accent)" /> : <FileText size={16} color="var(--primary)" />}
                        <Text strong>{citation.sourceTitle || citation.policyTitle}</Text>
                        <Text type="secondary">— Page {citation.pageNumber}</Text>
                      </div>
                      <Button 
                        size="small"
                        icon={<ExternalLink size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewSource(citation.sourceId || citation.policyId, citation.pageNumber);
                        }}
                      >
                        View Source
                      </Button>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '3px solid var(--borders)', paddingLeft: '12px' }}>
                      "{fullText}"
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </HeroAnswer>
  );
};

export default AIFindingBlock;
