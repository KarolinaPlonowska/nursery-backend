import React from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';

import { API_URL } from "../../config/api";

interface AdminCreationProps {
  isDark: boolean;
  creatingAdmin: boolean;
  setCreatingAdmin: (loading: boolean) => void;
  showInviteCode: boolean;
  onAdminCreated: () => Promise<void>;
}

const AdminCreation: React.FC<AdminCreationProps> = ({
  isDark,
  creatingAdmin,
  setCreatingAdmin,
  showInviteCode,
  onAdminCreated
}) => {
  const [adminForm] = Form.useForm();

  const handleCreateAdminUser = async (values: any) => {
    setCreatingAdmin(true);
    try {
      await axios.post(
        `${API_URL}/auth/create-admin`,
        values,
        { withCredentials: true }
      );
      message.success("Admin account created successfully");
      adminForm.resetFields();
      await onAdminCreated();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to create admin");
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
          <UserAddOutlined style={{ marginRight: 8 }} /> Utwórz konto administratora
        </span>
      }
    >
      <Form
        form={adminForm}
        layout="inline"
        onFinish={handleCreateAdminUser}
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="firstName"
          label="Imię"
          rules={[{ required: true, message: "Podaj imię" }]}
        >
          <Input placeholder="Imię" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Nazwisko"
          rules={[{ required: true, message: "Podaj nazwisko" }]}
        >
          <Input placeholder="Nazwisko" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, type: "email", message: "Podaj email" },
          ]}
        >
          <Input placeholder="email@example.com" type="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Hasło"
          rules={[
            { required: true, message: "Podaj hasło" },
            { min: 12, message: "Hasło musi mieć co najmniej 12 znaków" },
            {
              pattern: /[A-Z]/,
              message: "Hasło musi zawierać wielką literę (A-Z)"
            },
            {
              pattern: /[a-z]/,
              message: "Hasło musi zawierać małą literę (a-z)"
            },
            {
              pattern: /[0-9]/,
              message: "Hasło musi zawierać cyfrę (0-9)"
            },
            {
              pattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
              message: "Hasło musi zawierać znak specjalny (!@#$%^&* itd.)"
            }
          ]}
          tooltip="Min. 12 znaków, wielka i mała litera, cyfra oraz znak specjalny"
        >
          <Input.Password placeholder="Min. 12 znaków z wymaganymi znakami" />
        </Form.Item>
        {showInviteCode && (
          <Form.Item
            name="inviteCode"
            label="Kod zaproszenia"
            rules={[{ required: true, message: "Podaj kod zaproszenia" }]}
            tooltip="Wymagany do utworzenia pierwszego konta administratora"
          >
            <Input placeholder="Kod zaproszenia" />
          </Form.Item>
        )}
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
            Utwórz administratora
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AdminCreation;