import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, message, Select, Row, Col } from 'antd';
import { Landmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        organization: values.organization
      });
      message.success('Account created successfully!');
      navigate('/app');
    } catch (error) {
      message.error('Registration failed. Please try again.');
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
            Join PolicyIntel to securely access, analyze, and manage policy intelligence and compliance tracking.
          </Text>
        </div>
      </Col>

      {/* Register Side */}
      <Col xs={24} md={12} style={{ padding: '64px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--cards)', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <Title level={3} style={{ marginBottom: '8px' }}>Create your PolicyIntel account</Title>
          <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '32px' }}>Enter your details to register</Text>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Full Name" name="name" rules={[{ required: true, message: 'Please enter your full name' }]}>
              <Input size="large" placeholder="John Doe" />
            </Form.Item>
            
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}>
              <Input size="large" placeholder="john@example.gov" />
            </Form.Item>

            <Form.Item label="Organization / Department" name="organization" rules={[{ required: true, message: 'Please enter your organization' }]}>
              <Input size="large" placeholder="Department of Health" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter a password' }]}>
                  <Input.Password size="large" placeholder="Password" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Confirm Password" name="confirmPassword" dependencies={['password']} rules={[
                  { required: true, message: 'Please confirm password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  })
                ]}>
                  <Input.Password size="large" placeholder="Confirm" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="terms" valuePropName="checked" rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms')) }]}>
              <Checkbox>I agree to the Terms and Conditions</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text style={{ color: 'var(--text-secondary)' }}>Already have an account? </Text>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Register;
