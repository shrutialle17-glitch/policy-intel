import React from 'react';
import { Card, Input, Button, Typography, Space } from 'antd';
import { Bot, Send } from 'lucide-react';

const { Title, Text } = Typography;

const AskPolicy = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <Card style={{ flex: 1, marginBottom: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '500px', color: 'var(--text-secondary)' }}>
          <Bot size={64} color="var(--accent)" style={{ marginBottom: '24px', opacity: 0.8 }} />
          <Title level={3}>Ask Policy AI</Title>
          <Text>
            Ask questions about government policies, procurement guidelines, and regulations. 
            All answers will be grounded in official documents with direct citations.
          </Text>
        </div>
      </Card>

      <Card bodyStyle={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Input 
            size="large" 
            placeholder="Ask a question about government policy..." 
            style={{ flex: 1 }}
          />
          <Button type="primary" size="large" icon={<Send size={18} />}>
            Ask
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AskPolicy;
