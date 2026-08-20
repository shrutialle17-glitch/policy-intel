import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Divider, message, Row, Col } from 'antd';
import { Landmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Successfully logged in!');
      navigate('/app');
    } catch (error) {
      message.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onDemoLogin = async () => {
    setLoading(true);
    try {
      await login('demo@policyintel.gov', 'demo123');
      message.success('Demo login successful!');
      navigate('/app');
    } catch (error) {
      message.error('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row style={{ minHeight: 'calc(100vh - 64px - 250px)', backgroundColor: 'var(--bg)' }}>
      {/* Branding Side */}
      <Col xs={0} md={12} style={{ backgroundColor: 'var(--primary)', padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Landmark size={48} color="white" style={{ marginBottom: '24px' }} />
          <Title level={2} style={{ color: 'white', marginBottom: '16px' }}>Government Policy Intelligence</Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', lineHeight: 1.6 }}>
            Access, analyze, and understand policy documents with our advanced AI-driven platform built for government efficiency.
          </Text>
        </div>
      </Col>

      {/* Login Side */}
      <Col xs={24} md={12} style={{ padding: '64px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--cards)', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <Title level={3} style={{ marginBottom: '8px' }}>Welcome back</Title>
          <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '32px' }}>Sign in to PolicyIntel</Text>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}>
              <Input size="large" placeholder="Enter your email" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
              <Input.Password size="large" placeholder="Enter your password" />
            </Form.Item>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" style={{ color: 'var(--secondary)' }}>Forgot password?</Link>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider plain style={{ color: 'var(--text-secondary)' }}>OR</Divider>

          <Button size="large" block onClick={onDemoLogin} loading={loading} style={{ marginBottom: '24px' }}>
            Demo Login
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: 'var(--text-secondary)' }}>Don't have an account? </Text>
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create account</Link>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
