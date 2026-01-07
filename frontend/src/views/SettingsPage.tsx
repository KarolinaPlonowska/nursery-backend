import { useState } from "react";
import { Card, Form, Input, Button, message, Divider } from "antd";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import axios from "axios";
import { getUser } from "../utils/auth";
import { useTheme } from "../hooks/useTheme";

const API_URL = "http://localhost:3000";

export default function SettingsPage() {
  const currentUser = getUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (values: any) => {
    setUpdatingProfile(true);
    try {
      const response = await axios.patch(
        `${API_URL}/users/${currentUser?.id}/profile`,
        {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        },
        { withCredentials: true }
      );
      message.success("Profil zaktualizowany pomyślnie");
      
      // Update localStorage with the response data
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Reload the page to refresh all data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd aktualizacji profilu");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Nowe hasła nie są identyczne");
      return;
    }

    setUpdatingPassword(true);
    try {
      await axios.patch(
        `${API_URL}/users/${currentUser?.id}/password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        { withCredentials: true }
      );
      message.success("Hasło zmienione pomyślnie");
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd zmiany hasła");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div style={{ 
      padding: "24px", 
      maxWidth: 800, 
      margin: "0 auto",
      minHeight: "100vh",
      background: isDark ? "linear-gradient(180deg, #0f0a1a 0%, #141414 50%, #0f0a1a 100%)" : "#F9FAFB",
      transition: "background-color 0.3s ease"
    }}>
      <h2 style={{ 
        fontSize: 28, 
        fontWeight: 700, 
        marginBottom: 24,
        background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>
        ⚙️ Ustawienia konta
      </h2>

      {/* Profile Settings Card */}
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
            <UserOutlined /> Dane osobowe
          </span>
        }
      >
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleUpdateProfile}
          initialValues={{
            firstName: currentUser?.firstName || "",
            lastName: currentUser?.lastName || "",
            email: currentUser?.email || "",
          }}
        >
          <Form.Item
            name="firstName"
            label={<span style={{ color: isDark ? "#E5E7EB" : undefined, fontWeight: 500 }}>Imię</span>}
            rules={[{ required: true, message: "Podaj imię" }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: isDark ? "#FBBF24" : undefined }} />}
              placeholder="Imię" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={<span style={{ color: isDark ? "#E5E7EB" : undefined, fontWeight: 500 }}>Nazwisko</span>}
            rules={[{ required: true, message: "Podaj nazwisko" }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: isDark ? "#FBBF24" : undefined }} />}
              placeholder="Nazwisko" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={{ color: isDark ? "#E5E7EB" : undefined, fontWeight: 500 }}>Email</span>}
            rules={[
              { required: true, message: "Podaj email" },
              { type: "email", message: "Podaj prawidłowy email" }
            ]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: isDark ? "#FBBF24" : undefined }} />}
              placeholder="email@example.com" 
              size="large"
              type="email"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={updatingProfile}
              size="large"
              style={{ 
                background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", 
                border: "none", 
                fontWeight: 600, 
                boxShadow: "0 4px 12px rgba(251,191,36,0.4)",
                width: "100%"
              }}
            >
              Zapisz zmiany
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Password Change Card */}
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
            <LockOutlined /> Zmiana hasła
          </span>
        }
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label={<span style={{ color: isDark ? "#E5E7EB" : undefined, fontWeight: 500 }}>Obecne hasło</span>}
            rules={[{ required: true, message: "Podaj obecne hasło" }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: isDark ? "#FBBF24" : undefined }} />}
              placeholder="Obecne hasło" 
              size="large"
            />
          </Form.Item>

          <Divider style={{ margin: "24px 0", borderColor: isDark ? "#4a3a5a" : undefined }} />

          <Form.Item
            name="newPassword"
            label={<span style={{ color: isDark ? "#E5E7EB" : undefined, fontWeight: 500 }}>Nowe hasło</span>}
            rules={[
              { required: true, message: "Podaj nowe hasło" },
              { min: 6, message: "Hasło musi mieć minimum 6 znaków" }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: isDark ? "#FBBF24" : undefined }} />}
              placeholder="Minimum 6 znaków" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span style={{ color: isDark ? "#E5E7EB" : undefined, fontWeight: 500 }}>Potwierdź nowe hasło</span>}
            rules={[
              { required: true, message: "Potwierdź nowe hasło" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Hasła nie są identyczne'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: isDark ? "#FBBF24" : undefined }} />}
              placeholder="Powtórz nowe hasło" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={updatingPassword}
              size="large"
              style={{ 
                background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", 
                border: "none", 
                fontWeight: 600, 
                boxShadow: "0 4px 12px rgba(251,191,36,0.4)",
                width: "100%"
              }}
            >
              Zmień hasło
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Account Info Card */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: isDark ? "0 0 20px rgba(251,191,36,0.15), 0 0 40px rgba(124,58,237,0.1)" : "0 2px 8px rgba(0,0,0,0.08)",
          border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
          background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined
        }}
        title={
          <span style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#FBBF24" : "#7C3AED" }}>
            📋 Informacje o koncie
          </span>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontWeight: 500 }}>Rola:</span>
            <span style={{ color: isDark ? "#FBBF24" : "#7C3AED", fontWeight: 600 }}>
              {currentUser?.role === 'ADMIN' ? 'Administrator' : 
               currentUser?.role === 'PARENT' ? 'Rodzic' : 
               currentUser?.role === 'CAREGIVER' ? 'Opiekun' : currentUser?.role}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontWeight: 500 }}>Status email:</span>
            <span style={{ color: currentUser?.emailVerified ? "#10B981" : "#EF4444", fontWeight: 600 }}>
              {currentUser?.emailVerified ? "✓ Zweryfikowany" : "✗ Niezweryfikowany"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
