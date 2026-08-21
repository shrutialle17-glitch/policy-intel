import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Space, Typography } from 'antd';
import { Landmark, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const PublicLayout = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 48px',
        borderBottom: '1px solid var(--borders)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Landmark size={28} color="var(--primary)" />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>PolicyIntel</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Government Intelligence</span>
          </div>
        </Link>
        
        <Space size="large" className="desktop-nav">
          <Link to="/app/policies" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Policy Library</Link>
          <Link to="/app/ask-policy" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Ask AI</Link>
          <Link to="/app/compliance" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Compliance</Link>
        </Space>

        <Space>
          <Button type="text" icon={isDark ? <Sun size={18} /> : <Moon size={18} />} onClick={toggleTheme} style={{ color: 'var(--text-main)' }} />
          {user ? (
            <Button type="primary" onClick={() => navigate('/app')}>Go to Dashboard</Button>
          ) : (
            <>
              <Button type="text" onClick={() => navigate('/login')}>Login</Button>
              <Button type="primary" onClick={() => navigate('/register')}>Get Started</Button>
            </>
          )}
        </Space>
      </Header>
      
      <Content style={{ flex: 1 }}>
        <Outlet />
      </Content>
      
      <Footer style={{ textAlign: 'center', backgroundColor: 'var(--primary)', color: 'white', padding: '48px 24px' }}>
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Landmark size={24} color="white" />
            <span style={{ fontSize: '18px', fontWeight: 700 }}>PolicyIntel</span>
          </div>
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Government Policy Intelligence Portal</Text>
          
          <Space size="large" wrap justify="center" style={{ marginTop: '24px' }}>
            <Link to="/app/policies" style={{ color: 'white' }}>Policy Library</Link>
            <Link to="/app/ask-policy" style={{ color: 'white' }}>Ask Policy AI</Link>
            <Link to="/app/compliance" style={{ color: 'white' }}>Compliance Checker</Link>
            <Link to="#" style={{ color: 'white' }}>Security</Link>
            <Link to="#" style={{ color: 'white' }}>Documentation</Link>
          </Space>
          
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '24px', paddingTop: '24px' }}>
            <Text style={{ color: 'var(--accent)', fontSize: '13px' }}>
              Policy-grounded AI. Every compliance finding is traceable to its source.
            </Text>
          </div>
        </Space>
      </Footer>
    </Layout>
  );
};

export default PublicLayout;
