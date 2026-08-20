import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Alert } from 'antd';
import { Landmark, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Note: To be replaced with actual backend API call
      // await axios.post('/api/auth/forgot-password', { email: values.email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
    } catch (error) {
      message.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px - 250px)', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--cards)', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Landmark size={40} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <Title level={3} style={{ marginBottom: '8px' }}>Reset your password</Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
        </div>

        {submitted ? (
          <Alert
            message="Check your email"
            description="If an account exists for this email, password reset instructions will be sent shortly."
            type="success"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        ) : (
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}>
              <Input size="large" placeholder="Enter your email" />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
