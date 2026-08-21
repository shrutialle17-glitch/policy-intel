import React from 'react';
import { Tag } from 'antd';

export const POLICY_STATUS_COLORS = {
  DRAFT: 'default',
  PROCESSING: 'processing',
  READY: 'success',
  FAILED: 'error',
  ARCHIVED: 'warning'
};

const StatusBadge = ({ status, colorMap = POLICY_STATUS_COLORS }) => {
  const color = colorMap[status] || 'default';
  return <Tag color={color}>{status}</Tag>;
};

export default StatusBadge;
