import { useState } from "react";
import { Card, Form, Input, Button, Divider, App, Modal } from "antd";
import { LockOutlined, MailOutlined, InfoCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { getUser } from "../utils/auth";
import { useTheme } from "../hooks/useTheme";

import { API_URL } from "../config/api";

export default function SettingsPage() {
  const currentUser = getUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [passwordForm] = Form.useForm();
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyingCode, setVerifyingCode] = useState(false);
  const { message } = App.useApp();

  // Debug - sprawdź dane użytkownika
  console.log('SettingsPage - currentUser:', currentUser);
  console.log('SettingsPage - emailVerified:', currentUser?.emailVerified);

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Nowe hasła nie są identyczne");
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await axios.patch(
        `${API_URL}/users/${currentUser?.id}/password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        { withCredentials: true }
      );
      
      console.log('Password change response:', response.data);
      
      message.success("Hasło zmienione pomyślnie! Email z potwierdzeniem został wysłany.");
      passwordForm.resetFields();
    } catch (err: any) {
      console.error('Password change error:', err);
      const errorMessage = err?.response?.data?.message || "Błąd zmiany hasła";
      message.error(errorMessage);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setSendingVerification(true);
    try {
      await axios.post(
        `${API_URL}/auth/resend-verification-code`,
        { email: currentUser?.email },
        { withCredentials: true }
      );
      message.success("Kod weryfikacyjny został wysłany na email!");
      setVerificationModalVisible(true);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Błąd wysyłania kodu weryfikacyjnego";
      message.error(errorMessage);
    } finally {
      setSendingVerification(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      message.error("Wprowadź 6-cyfrowy kod");
      return;
    }

    setVerifyingCode(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/verify-email`,
        { 
          email: currentUser?.email,
          code: verificationCode 
        },
        { withCredentials: true }
      );
      
      // Zaktualizuj dane użytkownika w sessionStorage
      if (response.data.user) {
        const updatedUser = { ...currentUser, emailVerified: true };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      message.success("Email został zweryfikowany pomyślnie!");
      setVerificationModalVisible(false);
      setVerificationCode("");
      // Odśwież stronę aby zaktualizować status
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Nieprawidłowy kod weryfikacyjny";
      message.error(errorMessage);
    } finally {
      setVerifyingCode(false);
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

      {/* Account Info Card */}
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
            <span>
              <InfoCircleOutlined style={{ color: isDark ? "#FBBF24" : "#7C3AED", marginRight: 8 }} /> Informacje o koncie
            </span>
          </span>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontWeight: 500 }}>Imię i nazwisko:</span>
            <span style={{ color: isDark ? "#E5E7EB" : "#1F2937", fontWeight: 600 }}>
              {currentUser?.firstName} {currentUser?.lastName}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontWeight: 500 }}>Email:</span>
            <span style={{ color: isDark ? "#E5E7EB" : "#1F2937", fontWeight: 600 }}>
              {currentUser?.email}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontWeight: 500 }}>Rola:</span>
            <span style={{ color: isDark ? "#FBBF24" : "#7C3AED", fontWeight: 600 }}>
              {currentUser?.role === 'ADMIN' ? 'Administrator' : 
               currentUser?.role === 'PARENT' ? 'Rodzic' : 
               currentUser?.role === 'CAREGIVER' ? 'Opiekun' : currentUser?.role}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", alignItems: "center" }}>
            <span style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontWeight: 500 }}>Status email:</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: currentUser?.emailVerified ? "#10B981" : "#EF4444", fontWeight: 600 }}>
                {currentUser?.emailVerified ? "✓ Zweryfikowany" : "✗ Niezweryfikowany"}
              </span>
              {!currentUser?.emailVerified && currentUser?.role !== 'ADMIN' && (
                <Button
                  type="primary"
                  size="small"
                  icon={<MailOutlined />}
                  onClick={handleSendVerificationEmail}
                  loading={sendingVerification}
                  style={{
                    background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
                    border: "none",
                  }}
                >
                  Zweryfikuj
                </Button>
              )}
            </div>
          </div>
        </div>
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
              { min: 12, message: "Hasło musi mieć minimum 12 znaków" },
              {
                pattern: /[a-z]/,
                message: "Hasło musi zawierać co najmniej jedną małą literę",
              },
              {
                pattern: /[A-Z]/,
                message: "Hasło musi zawierać co najmniej jedną wielką literę",
              },
              {
                pattern: /[0-9]/,
                message: "Hasło musi zawierać co najmniej jedną cyfrę",
              },
              {
                pattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
                message: "Hasło musi zawierać co najmniej jeden znak specjalny",
              },
            ]}
            extra={
              <span style={{ fontSize: 12, color: isDark ? "#9CA3AF" : "#6B7280" }}>
                Hasło musi zawierać: min. 12 znaków, wielką i małą literę, cyfrę i znak specjalny
              </span>
            }
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: isDark ? "#FBBF24" : undefined }} />}
              placeholder="Minimum 12 znaków" 
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

      {/* Email Verification Modal */}
      <Modal
        title="📧 Weryfikacja emaila"
        open={verificationModalVisible}
        onCancel={() => {
          setVerificationModalVisible(false);
          setVerificationCode("");
        }}
        footer={null}
      >
        <div style={{ padding: "20px 0" }}>
          <p style={{ marginBottom: 20, fontSize: 15 }}>
            Wprowadź 6-cyfrowy kod weryfikacyjny wysłany na adres:
            <br />
            <strong>{currentUser?.email}</strong>
          </p>
          <Input
            placeholder="Kod weryfikacyjny (6 cyfr)"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            size="large"
            style={{ marginBottom: 20 }}
          />
          <Button
            type="primary"
            block
            size="large"
            onClick={handleVerifyEmail}
            loading={verifyingCode}
            style={{
              background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
              border: "none",
              fontWeight: 600,
            }}
          >
            Weryfikuj
          </Button>
          <Button
            type="link"
            block
            onClick={handleSendVerificationEmail}
            loading={sendingVerification}
            style={{ marginTop: 10 }}
          >
            Wyślij kod ponownie
          </Button>
        </div>
      </Modal>
    </div>
  );
}
