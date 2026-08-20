import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Space, Avatar, Typography } from 'antd';
import { 
  Home, 
  Library, 
  FileText, 
  Bot, 
  ShieldAlert, 
  Settings as SettingsIcon,
  LogOut,
  Landmark,
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: (
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontWeight: 600 }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.role || 'USER'}</div>
          </div>
        ),
      },
      {
        type: 'divider',
      },
      {
        key: 'settings',
        icon: <SettingsIcon size={16} />,
        label: 'Settings',
        onClick: () => navigate('/app/settings')
      },
      {
        key: 'logout',
        icon: <LogOut size={16} />,
        label: 'Logout',
        danger: true,
        onClick: handleLogout
      },
    ],
  };

  const menuItems = [
    {
      key: '/app',
      icon: <Home size={18} />,
      label: <Link to="/app">Dashboard</Link>,
    },
    {
      key: '/app/policies',
      icon: <Library size={18} />,
      label: <Link to="/app/policies">Policy Library</Link>,
    },
    {
      key: '/app/documents',
      icon: <FileText size={18} />,
      label: <Link to="/app/documents">Documents</Link>,
    },
    {
      key: '/app/ask-policy',
      icon: <Bot size={18} color="var(--accent)" />,
      label: <Link to="/app/ask-policy">Ask Policy AI</Link>,
    },
    {
      key: '/app/compliance',
      icon: <ShieldAlert size={18} />,
      label: <Link to="/app/compliance">Compliance Checker</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: '/app/settings',
      icon: <SettingsIcon size={18} />,
      label: <Link to="/app/settings">Settings</Link>,
    }
  ];

  // Helper to get active menu key based on current path
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    if (pathname === '/app') return ['/app'];
    const matchedItem = menuItems.find(item => item.key && pathname.startsWith(item.key) && item.key !== '/app');
    return matchedItem ? [matchedItem.key] : ['/app'];
  };

  // Generate page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/app') return 'Dashboard';
    if (path.includes('policies')) return 'Policy Library';
    if (path.includes('documents')) return 'Documents';
    if (path.includes('ask-policy')) return 'Ask Policy AI';
    if (path.includes('compliance')) return 'Compliance Checker';
    if (path.includes('settings')) return 'Settings';
    return '';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '16px'
        }}>
          <Landmark size={24} color="white" />
          {!collapsed && (
            <div style={{ marginLeft: '12px', display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>PolicyIntel</span>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Government Intelligence</span>
            </div>
          )}
        </div>
        
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={getSelectedKeys()}
          items={menuItems}
        />
        
        {!collapsed && (
          <div style={{ position: 'absolute', bottom: '60px', width: '100%', padding: '0 16px' }}>
             <div style={{ 
               backgroundColor: 'rgba(255,255,255,0.05)', 
               padding: '12px', 
               borderRadius: '8px',
               display: 'flex',
               alignItems: 'center',
               gap: '12px'
             }}>
                <Avatar style={{ backgroundColor: 'var(--secondary)' }}>{user?.name?.[0] || 'U'}</Avatar>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: 'white', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || 'User'}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{user?.role || 'USER'}</div>
                </div>
             </div>
          </div>
        )}
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: 'var(--cards)', 
          borderBottom: '1px solid var(--borders)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>
            {getPageTitle()}
          </div>
          
          <Space size="large">
            <Button type="text" icon={<Search size={18} />} />
            <Button type="text" icon={<Bell size={18} />} />
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar size="small" style={{ backgroundColor: 'var(--secondary)' }}>{user?.name?.[0] || 'U'}</Avatar>
              </div>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
