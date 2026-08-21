import React from 'react';
import { Typography, Spin } from 'antd';
import { Search } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

const { Title, Text } = Typography;

const pulse = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  background: var(--surface);
  border: 1px dashed var(--borders);
  border-radius: 12px;
  animation: ${pulse} 2s infinite ease-in-out;
`;

const LoadingState = ({ title = "Searching official documents...", description = "Extracting relevant policies and generating research results." }) => (
  <Container>
    <Search size={32} color="var(--primary)" style={{ marginBottom: 16 }} />
    <Title level={4} style={{ color: 'var(--main-text)', margin: '0 0 8px 0' }}>
      {title}
    </Title>
    <Text type="secondary">
      {description}
    </Text>
  </Container>
);

export default LoadingState;
