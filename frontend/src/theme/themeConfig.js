export const themeConfig = {
  token: {
    colorPrimary: '#1677FF', // Digital Blue
    colorInfo: '#00A6A6',    // Teal (AI Accent)
    colorSuccess: '#16A34A',
    colorWarning: '#F59E0B',
    colorError: '#DC2626',
    colorTextBase: '#172033',
    colorTextSecondary: '#64748B',
    colorBgBase: '#F5F7FA',
    colorBgContainer: '#FFFFFF',
    colorBorder: '#E2E8F0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    borderRadius: 6, // Clean enterprise look, not too rounded
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: '#123B5D', // Deep Government Navy
      headerBg: '#FFFFFF',
    },
    Menu: {
      darkItemBg: '#123B5D',
      darkItemSelectedBg: '#1677FF',
    },
    Button: {
      borderRadius: 4,
    },
    Card: {
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      borderRadius: 8,
    }
  }
};
