import React, { useState } from 'react';
import { Input, Button, Typography } from 'antd';
import { Search, Sparkles } from 'lucide-react';
import styled from 'styled-components';

const { Text } = Typography;

const InputContainer = styled.div`
  margin-bottom: 32px;
`;

const StyledInput = styled(Input)`
  padding: 16px 20px;
  font-size: 16px;
  border-radius: 8px 0 0 8px;
  border: 1px solid var(--borders);
  border-right: 0;
  &:focus, &:hover {
    border-color: var(--ai-accent);
    box-shadow: none;
  }
`;

const SuggestionsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
  align-items: center;
`;

const SuggestionChip = styled.div`
  padding: 6px 16px;
  background: var(--bg);
  border: 1px solid var(--borders);
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-main);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(0, 166, 166, 0.05);
  }
`;

const defaultSuggestions = [
  "What are vendor selection requirements?",
  "What is the minimum penalty for non-compliance?",
  "How are tender disputes resolved?"
];

const QuestionInput = ({ onAsk, disabled, placeholder = "Ask anything about government policies...", suggestions = defaultSuggestions }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onAsk(value);
      setValue('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!disabled) {
      onAsk(suggestion);
    }
  };

  return (
    <InputContainer>
      <div style={{ display: 'flex' }}>
        <StyledInput
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={handleSubmit}
          disabled={disabled}
          prefix={<Search size={20} color="var(--text-secondary)" style={{ marginRight: 12 }} />}
        />
        <Button 
          type="primary" 
          size="large" 
          style={{ 
            height: 'auto', 
            background: 'var(--accent)', 
            borderRadius: '0 8px 8px 0', 
            padding: '0 32px',
            fontWeight: 600
          }}
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
        >
          Ask AI <span style={{ marginLeft: '8px' }}>→</span>
        </Button>
      </div>
      <SuggestionsRow>
        <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600 }}>Suggested:</Text>
        {suggestions.map((suggestion, idx) => (
          <SuggestionChip key={idx} onClick={() => handleSuggestionClick(suggestion)}>
            {suggestion}
          </SuggestionChip>
        ))}
      </SuggestionsRow>
    </InputContainer>
  );
};

export default QuestionInput;
