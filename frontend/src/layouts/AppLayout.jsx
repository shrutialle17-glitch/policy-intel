import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Space, Avatar, Typography, Breadcrumb } from 'antd';
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
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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

  const baseUserItems = user?.role === 'ADMIN' ? [] : [
    {
      type: 'group',
      label: 'OVERVIEW',
      children: [
        {
          key: '/app',
          icon: <Home size={18} />,
          label: <Link to="/app">Dashboard</Link>,
        }
      ]
    },
    {
      type: 'group',
      label: 'POLICY INTELLIGENCE',
      children: [
        {
          key: '/app/policies',
          icon: <Library size={18} />,
          label: <Link to="/app/policies">Policy Library</Link>,
        },
        {
          key: '/app/ask-policy',
          icon: <Bot size={18} color="var(--ai-accent)" />,
          label: <Link to="/app/ask-policy"><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🤖 Ask Policy AI</span></Link>,
        }
      ]
    },
    {
      type: 'group',
      label: 'TENDER INTELLIGENCE',
      children: [
        {
          key: '/app/my-tenders',
          icon: <FileText size={18} />,
          label: <Link to="/app/my-tenders">My Tenders</Link>,
        },
        {
          key: '/app/ask-tender',
          icon: <Bot size={18} color="var(--ai-accent)" />,
          label: <Link to="/app/ask-tender"><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🤖 Ask About Tender</span></Link>,
        }
      ]
    },
    {
      type: 'group',
      label: 'COMPLIANCE',
      children: [
        {
          key: '/app/compliance',
          icon: <ShieldAlert size={18} />,
          label: <Link to="/app/compliance">Compliance Checker</Link>,
        },
        {
          key: '/app/compliance-reports',
          icon: <FileText size={18} />,
          label: <Link to="/app/compliance-reports">Compliance Reports</Link>,
        }
      ]
    },
    {
      type: 'group',
      label: 'SYSTEM',
      children: [
        {
          key: '/app/settings',
          icon: <SettingsIcon size={18} />,
          label: <Link to="/app/settings">Settings</Link>,
        }
      ]
    }
  ];

  const adminItems = user?.role === 'ADMIN' ? [
    {
      key: 'admin-overview',
      label: 'OVERVIEW',
      type: 'group',
      children: [
        {
          key: '/app/admin',
          icon: <Home size={18} />,
          label: <Link to="/app/admin">Dashboard</Link>,
        }
      ]
    },
    {
      key: 'admin-kb',
      label: 'KNOWLEDGE BASE',
      type: 'group',
      children: [
        {
          key: '/app/admin/policies',
          icon: <Library size={18} />,
          label: <Link to="/app/admin/policies">Policy Management</Link>,
        },
        {
          key: '/app/admin/processing',
          icon: <FileText size={18} />,
          label: <Link to="/app/admin/processing">Document Processing</Link>,
        }
      ]
    },
    {
      key: 'admin-platform',
      label: 'PLATFORM',
      type: 'group',
      children: [
        {
          key: '/app/admin/users',
          icon: <Bot size={18} />,
          label: <Link to="/app/admin/users">Users</Link>,
        }
      ]
    }
  ] : [];

  const menuItems = [
    ...baseUserItems,
    ...adminItems,
    ...(user?.role === 'ADMIN' ? [
      { type: 'divider' },
      { key: '/app/settings', icon: <SettingsIcon size={18} />, label: <Link to="/app/settings">Settings</Link> }
    ] : [])
  ];

  // Helper to get active menu key based on current path
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    if (pathname === '/app') return ['/app'];
    
    // Find matching key, but don't match group keys
    let matchedKey = '/app';
    menuItems.forEach(item => {
      if (item.key && item.key !== '/app' && item.key !== 'admin-section' && pathname.startsWith(item.key)) {
        matchedKey = item.key;
      }
      if (item.children) {
        item.children.forEach(child => {
          if (child.key && pathname.startsWith(child.key)) {
            matchedKey = child.key;
          }
        });
      }
    });
    return [matchedKey];
  };

  // Generate page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/app') return 'Dashboard';
    if (path.includes('admin/policies')) return 'Policy Management';
    if (path.includes('admin/processing')) return 'Document Processing';
    if (path.includes('policies')) return 'Policy Library';
    if (path.includes('my-tenders')) return 'My Tenders';
    if (path.includes('ask-tender')) return 'Ask About Tender';
    if (path.includes('ask-policy')) return 'Ask Policy AI';
    if (path.includes('compliance-reports')) return 'Compliance Reports';
    if (path.includes('compliance')) return 'Compliance Checker';
    if (path.includes('settings')) return 'Settings';
    return '';
  };

  // Generate breadcrumbs from route
  const generateBreadcrumbs = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const breadcrumbItems = pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      
      let title = snippet;
      if (snippet === 'app') return null; // Skip 'app'
      if (snippet === 'admin') title = 'Admin Dashboard';
      if (snippet === 'policies') title = 'Policy Library';
      if (snippet === 'my-tenders') title = 'My Tenders';
      if (snippet === 'ask-policy') title = 'Ask Policy AI';
      if (snippet === 'ask-tender') title = 'Ask About Tender';
      if (snippet === 'compliance') title = 'Compliance Checker';
      if (snippet === 'compliance-reports') title = 'Compliance Reports';
      if (snippet === 'settings') title = 'Settings';
      if (snippet === 'processing') title = 'Document Processing';
      if (snippet === 'users') title = 'Users';
      if (snippet === 'compliance-analysis') return null; // Skip intermediate paths
      
      // If it's an ID
      if (snippet.length > 20 || !isNaN(snippet)) {
         title = 'Detail';
      }

      return {
        key: url,
        title: index === pathSnippets.length - 1 ? (
          <span>{title}</span>
        ) : (
          <Link to={url}>{title}</Link>
        ),
      };
    }).filter(Boolean);

    return [{ key: '/app', title: <Link to="/app"><Home size={14} style={{ display: 'inline', marginTop: -2 }} /></Link> }, ...breadcrumbItems];
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
            <Dropdown
              menu={{
                items: [
                  { type: 'group', label: 'Recent Searches', children: [
                    { key: '1', label: 'National Procurement Policy' },
                    { key: '2', label: 'Robotics Tender' }
                  ]}
                ]
              }}
              trigger={['click']}
            >
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', padding: '6px 12px', borderRadius: '4px', gap: '8px', border: '1px solid var(--borders)', width: '300px', cursor: 'text' }}>
                <Search size={16} color="var(--text-secondary)" />
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>⌕ Search policies, tenders, clauses...</span>
              </div>
            </Dropdown>
            <Button type="text" icon={isDark ? <Sun size={18} aria-label="Switch to light mode" /> : <Moon size={18} aria-label="Switch to dark mode" />} onClick={toggleTheme} style={{ color: 'var(--text-main)' }} aria-label="Toggle Theme" />
            <Button type="text" icon={<Bell size={18} aria-label="Notifications" />} style={{ color: 'var(--text-main)' }} aria-label="View Notifications" />
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} aria-label="User Menu" role="button" tabIndex={0}>
                <Avatar size="small" style={{ backgroundColor: 'var(--secondary)' }}>{user?.name?.[0] || 'U'}</Avatar>
              </div>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
          {location.pathname !== '/app' && (
            <Breadcrumb style={{ marginBottom: '16px' }} items={generateBreadcrumbs()} />
          )}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
