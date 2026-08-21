import React from 'react';
import { Card, Form, Input, Button, Typography, Divider, Switch, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;

const Settings = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const handleSave = () => {
    message.success('Settings saved successfully');
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <Card title={<Title level={4} style={{ margin: 0 }}>Profile Settings</Title>} style={{ marginBottom: '24px' }}>
        <Form layout="vertical" initialValues={{ name: user?.name, email: user?.email, role: user?.role }}>
          <Form.Item label="Full Name" name="name">
            <Input size="large" />
          </Form.Item>
          <Form.Item label="Email Address" name="email">
            <Input size="large" disabled />
          </Form.Item>
          <Form.Item label="Role" name="role">
            <Input size="large" disabled />
          </Form.Item>
          <Button type="primary" onClick={handleSave}>Save Changes</Button>
        </Form>
      </Card>

      <Card title={<Title level={4} style={{ margin: 0 }}>Preferences</Title>}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <Text strong>Email Notifications</Text>
            <br/>
            <Text type="secondary">Receive alerts for new policy updates.</Text>
          </div>
          <Switch defaultChecked />
        </div>
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong>Dark Mode</Text>
            <br/>
            <Text type="secondary">Toggle application theme.</Text>
          </div>
          <Switch checked={isDark} onChange={toggleTheme} />
        </div>
      </Card>
    </div>
  );
};

export default Settings;
