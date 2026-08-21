import { theme } from 'antd';

export const getThemeConfig = (isDark) => ({
  algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: isDark ? '#2E6FA3' : '#123B5D', 
    colorInfo: isDark ? '#4C9AFF' : '#1677FF',    
    colorSuccess: isDark ? '#22C55E' : '#16A34A',
    colorWarning: isDark ? '#FBBF24' : '#F59E0B',
    colorError: isDark ? '#F87171' : '#DC2626',
    colorTextBase: isDark ? '#E6EAF0' : '#172033',
    colorTextSecondary: isDark ? '#93A1B5' : '#64748B',
    colorBgBase: isDark ? '#0B1622' : '#F5F7FA',
    colorBgContainer: isDark ? '#101E2E' : '#FFFFFF',
    colorBgElevated: isDark ? '#16283C' : '#FFFFFF',
    colorBorder: isDark ? '#24354A' : '#E2E8F0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    borderRadius: 4,
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: isDark ? '#101E2E' : '#123B5D',
      headerBg: isDark ? '#101E2E' : '#FFFFFF',
    },
    Menu: {
      darkItemBg: isDark ? '#101E2E' : '#123B5D',
      darkItemSelectedBg: isDark ? '#4C9AFF' : '#1677FF',
    },
    Button: {
      borderRadius: 4,
    },
    Card: {
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      borderRadius: 6,
    },
    Table: {
      borderRadius: 4,
    },
    Tag: {
      borderRadius: 12,
    }
  }
});
