import React from 'react';
import { Card, Typography } from 'antd';
import { Sparkles, XCircle } from 'lucide-react';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;

const StyledCard = styled(Card)`
  border-radius: 12px;
  border-color: var(--borders);
  background: var(--surface);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--borders);
`;

const AnswerCard = ({ answer, grounded, question }) => {
  if (!grounded) {
    return (
      <StyledCard>
        <HeaderRow>
          <XCircle size={24} color="var(--secondary-text)" />
          <Title level={4} style={{ margin: 0, color: 'var(--secondary-text)' }}>Information Not Found</Title>
        </HeaderRow>
        <Paragraph style={{ fontSize: '16px', color: 'var(--secondary-text)', margin: 0 }}>
          I could not find sufficient information in the uploaded official policy documents to answer this question.
        </Paragraph>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <HeaderRow>
        <Sparkles size={24} color="var(--ai-accent)" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            AI-Generated Research Result
          </Text>
          <Title level={4} style={{ margin: 0, color: 'var(--main-text)' }}>{question}</Title>
        </div>
      </HeaderRow>
      <Paragraph style={{ fontSize: '16px', color: 'var(--main-text)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
        {answer}
      </Paragraph>
    </StyledCard>
  );
};

export default AnswerCard;
