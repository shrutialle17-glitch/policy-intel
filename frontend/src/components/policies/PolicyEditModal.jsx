import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import { POLICY_CATEGORIES } from './PolicyFilterBar';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const PolicyEditModal = ({ visible, policy, onCancel, onSave, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && policy) {
      form.setFieldsValue({
        ...policy,
        publicationDate: policy.publicationDate ? dayjs(policy.publicationDate) : null,
        effectiveDate: policy.effectiveDate ? dayjs(policy.effectiveDate) : null,
      });
    }
  }, [visible, policy, form]);

  const handleSave = () => {
    form.validateFields().then(values => {
      onSave({
        ...values,
        publicationDate: values.publicationDate ? values.publicationDate.toISOString() : null,
        effectiveDate: values.effectiveDate ? values.effectiveDate.toISOString() : null,
      });
    });
  };

  return (
    <Modal
      title="Edit Policy Metadata"
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={loading}
      okText="Save"
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select>
            {POLICY_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item name="issuingAuthority" label="Issuing Authority">
          <Input />
        </Form.Item>
        <Form.Item name="documentType" label="Document Type">
          <Input />
        </Form.Item>
        <Form.Item name="publicationDate" label="Publication Date">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="effectiveDate" label="Effective Date">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="version" label="Version">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PolicyEditModal;
