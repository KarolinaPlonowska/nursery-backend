import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, message, Divider, Alert } from "antd";
import { LoginOutlined, HomeOutlined } from "@ant-design/icons";
import axios from "axios";
import { setUser, getLogoutReason } from "../utils/auth";
import { useTheme } from "../hooks/useTheme";

const API_URL = "http://localhost:3000";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';

  // Sprawdź czy jest komunikat o wylogowaniu
  useEffect(() => {
    const reason = getLogoutReason();
    if (reason) {
      setLogoutMessage(reason);
      message.warning(reason, 5); // Pokaż na 5 sekund
    }
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, values, {
        withCredentials: true, // Istotne - wysłanie cookies
      });
      
      // Debug - sprawdź odpowiedź z backendu
      console.log('Login response:', res.data);
      console.log('User data:', res.data.user);
      console.log('emailVerified from backend:', res.data.user?.emailVerified);
      
      // Przechowaj dane użytkownika w sessionStorage
      setUser(res.data.user, res.data.user.role);
      
      // Nawiguj na podstawie roli
      if (res.data.user.role === "ADMIN") navigate("/admin");
      else if (res.data.user.role === "PARENT") navigate("/parent");
      else if (res.data.user.role === "CAREGIVER") navigate("/caregiver");
      else navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
      message.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: isDark ? "#0f0f0f" : "#F9FAFB", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "20px",
      transition: "background-color 0.3s ease"
    }}>
      <Card 
        style={{ 
          width: "100%", 
          maxWidth: 450, 
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #E5E7EB"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <LoginOutlined style={{ fontSize: 40, color: "#7C3AED", marginBottom: 16 }} />
          <h1 style={{ fontSize: 28, color: isDark ? "rgba(255,255,255,0.87)" : "#1F2937", fontWeight: 700, margin: 0 }}>Zaloguj się</h1>
          <p style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6B7280", marginTop: 8 }}>Dostęp do systemu zarządzania przedszkolem</p>
        </div>

        {logoutMessage && (
          <Alert
            message="Wylogowano automatycznie"
            description={logoutMessage}
            type="warning"
            showIcon
            closable
            onClose={() => setLogoutMessage(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
          onFinishFailed={() => message.error("Uzupełnij wszystkie wymagane pola")}
        >
          <Form.Item
            name="email"
            label={<span style={{ color: isDark ? "rgba(255,255,255,0.87)" : "#374151", fontWeight: 500 }}>Email</span>}
            rules={[{ required: true, message: "Podaj email!" }]}
          >
            <Input placeholder="email@example.com" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span style={{ color: isDark ? "rgba(255,255,255,0.87)" : "#374151", fontWeight: 500 }}>Hasło</span>}
            rules={[{ required: true, message: "Podaj hasło!" }]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              icon={<LoginOutlined />}
              style={{ background: "#7C3AED", borderColor: "#7C3AED", fontWeight: 600, fontSize: 16 }}
            >
              Zaloguj się
            </Button>
          </Form.Item>
        </Form>

        {error && (
          <div style={{ color: "#DC2626", marginTop: 16, padding: 12, background: "#FEE2E2", borderRadius: 8, textAlign: "center", fontWeight: 500 }}>
            {error}
          </div>
        )}

        <Divider style={{ margin: "24px 0", borderColor: "#E5E7EB" }} />

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Button
            type="link"
            onClick={() => navigate("/forgot-password")}
            style={{ color: "#7C3AED", fontWeight: 500, padding: 0, fontSize: 14 }}
          >
            Zapomniałeś hasła?
          </Button>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6B7280", marginBottom: 12 }}>Nie masz konta?</p>
          <Button
            type="default"
            block
            size="large"
            onClick={() => navigate("/")}
            icon={<HomeOutlined />}
            style={{ fontWeight: 600, fontSize: 15, color: "#7C3AED", borderColor: "#7C3AED" }}
          >
            Wróć do strony głównej
          </Button>
        </div>
      </Card>
    </div>
  );
}
