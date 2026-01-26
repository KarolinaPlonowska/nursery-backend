import React from 'react';
import { Card, Form, Input, Button, App } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import apiClient from '../../utils/axiosConfig';

interface AdminCreationProps {
  isDark: boolean;
  creatingAdmin: boolean;
  setCreatingAdmin: (loading: boolean) => void;
  onAdminCreated: () => Promise<void>;
}

const AdminCreation: React.FC<AdminCreationProps> = ({
  isDark,
  creatingAdmin,
  setCreatingAdmin,
  onAdminCreated
}) => {
  const { message } = App.useApp();
  const [adminForm] = Form.useForm();

  const handleCreateAdminUser = async (values: any) => {
    setCreatingAdmin(true);
    try {
      console.log('Sending invitation request:', values);
      const response = await apiClient.post('/auth/invite-admin', {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      console.log('Invitation sent successfully:', response.data);
      message.success("Zaproszenie zostało wysłane na podany adres email");
      adminForm.resetFields();
      await onAdminCreated();
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      console.error('Error response:', err?.response?.data);
      message.error(err?.response?.data?.message || "Błąd wysyłania zaproszenia");
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 12,
        boxShadow: isDark ? "0 0 20px rgba(251,191,36,0.15), 0 0 40px rgba(124,58,237,0.1)" : "0 2px 8px rgba(0,0,0,0.08)",
        border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
        background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined
      }}
      title={
        <span style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#FBBF24" : "#7C3AED" }}>
          <UserAddOutlined style={{ marginRight: 8 }} /> Zaproś nowego administratora
        </span>
      }
    >
      <div style={{ marginBottom: 16, color: isDark ? "rgba(255,255,255,0.7)" : "#6B7280" }}>
        <p style={{ margin: 0, fontSize: 14 }}>
          Wyślij zaproszenie email na podany adres. Osoba otrzyma link do utworzenia konta administratora.
        </p>
      </div>
      <Form
        form={adminForm}
        layout="vertical"
        onFinish={handleCreateAdminUser}
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="firstName"
          label="Imię"
          rules={[{ required: true, message: "Podaj imię" }]}
          style={{ marginBottom: 24 }}
        >
          <Input placeholder="Imię" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Nazwisko"
          rules={[{ required: true, message: "Podaj nazwisko" }]}
          style={{ marginBottom: 24 }}
        >
          <Input placeholder="Nazwisko" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, type: "email", message: "Podaj email" },
          ]}
          style={{ marginBottom: 24 }}
        >
          <Input placeholder="email@example.com" type="email" />
        </Form.Item>
        <Form.Item style={{ marginTop: 32 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={creatingAdmin} 
            style={{ 
              background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", 
              border: "none", 
              fontWeight: 600, 
              boxShadow: "0 4px 12px rgba(251,191,36,0.4)" 
            }}
          >
            Wyślij zaproszenie
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AdminCreation;