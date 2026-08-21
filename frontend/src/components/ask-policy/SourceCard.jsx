import React from 'react';
import { Card, Typography, Button } from 'antd';
import { ExternalLink, FileText } from 'lucide-react';
import styled from 'styled-components';

const { Text, Paragraph } = Typography;

const StyledCard = styled(Card)`
  border-radius: 8px;
  border-color: var(--borders);
  background: var(--surface);
  height: 100%;
`;

const SourceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const SourceCard = ({ sourceTitle, pageNumber, chunkText, sourceId, onViewSource, citationType = 'policy', sourceLabel }) => {
  const isTender = citationType === 'tender';
  
  return (
    <StyledCard bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SourceHeader>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <FileText size={16} color={isTender ? "var(--ai-accent)" : "var(--secondary)"} />
          <Text strong style={{ color: 'var(--main-text)' }}>
            {isTender ? (
              <span style={{ backgroundColor: 'rgba(0, 166, 166, 0.1)', color: 'var(--ai-accent)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                Source: {sourceLabel || 'Uploaded Tender'}
              </span>
            ) : (
              sourceTitle
            )}
          </Text>
        </div>
      </SourceHeader>
      
      <Text type="secondary" style={{ marginBottom: '12px', display: 'block', fontSize: '12px' }}>
        Page {pageNumber}
      </Text>
      
      <Paragraph 
        ellipsis={{ rows: 3, expandable: false }} 
        style={{ fontSize: '14px', color: 'var(--secondary-text)', flexGrow: 1, marginBottom: '16px' }}
      >
        "{chunkText}"
      </Paragraph>
      
      <div style={{ marginTop: 'auto' }}>
        <Button 
          type="default" 
          size="small" 
          icon={<ExternalLink size={14} />} 
          onClick={() => onViewSource(sourceId, pageNumber)}
          style={{ width: '100%' }}
        >
          View Source
        </Button>
      </div>
    </StyledCard>
  );
};

export default SourceCard;
