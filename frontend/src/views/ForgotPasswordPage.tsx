import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, message, Divider, Steps } from "antd";
import { MailOutlined, HomeOutlined } from "@ant-design/icons";
import axios from "axios";
import { useTheme } from "../hooks/useTheme";

import { API_URL } from "../config/api";

type FormStep = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<FormStep>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [form] = Form.useForm();
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';

  const stepIndex = step === "email" ? 0 : step === "code" ? 1 : 2;

  const onEmailSubmit = async (values: any) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/request-password-reset`, {
        email: values.email,
      });
      setEmail(values.email);
      setStep("code");
      message.success("Link do resetowania hasła został wysłany na email");
      form.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd przy wysyłaniu linku");
    } finally {
      setLoading(false);
    }
  };

  const onPasswordReset = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Hasła nie pasują!");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        token: resetToken,
        newPassword: values.newPassword,
      });
      message.success("Hasło zostało zmienione! Zaloguj się z nowym hasłem");
      navigate("/login");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd przy zmianie hasła");
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
          maxWidth: 500, 
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #E5E7EB"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <MailOutlined style={{ fontSize: 40, color: "#7C3AED", marginBottom: 16 }} />
          <h1 style={{ fontSize: 28, color: isDark ? "rgba(255,255,255,0.87)" : "#1F2937", fontWeight: 700, margin: 0 }}>
            Zresetuj hasło
          </h1>
          <p style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6B7280", marginTop: 8 }}>
            {step === "email"
              ? "Wpisz swój email aby otrzymać link do resetowania"
              : step === "code"
              ? "Wpisz kod resetowania"
              : "Utwórz nowe hasło"}
          </p>
        </div>

        <Steps
          current={stepIndex}
          items={[
            { title: "Email", status: stepIndex >= 0 ? "process" : "wait" },
            { title: "Kod", status: stepIndex >= 1 ? "process" : "wait" },
            { title: "Hasło", status: stepIndex >= 2 ? "process" : "wait" },
          ]}
          style={{ marginBottom: 32 }}
        />

        {step === "email" && (
          <Form name="email-form" onFinish={onEmailSubmit} layout="vertical">
            <Form.Item
              name="email"
              label={<span style={{ color: "#374151", fontWeight: 500 }}>Email</span>}
              rules={[
                { required: true, message: "Podaj email!" },
                { type: "email", message: "Podaj prawidłowy email!" },
              ]}
            >
              <Input placeholder="email@example.com" size="large" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{ background: "#7C3AED", borderColor: "#7C3AED", fontWeight: 600 }}
              >
                Wyślij link
              </Button>
            </Form.Item>
          </Form>
        )}

        {step === "code" && (
          <Form layout="vertical">
            <Form.Item label={<span style={{ color: "#374151", fontWeight: 500 }}>Kod resetowania</span>}>
              <Input
                placeholder="Wpisz kod z emaila"
                size="large"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                loading={loading}
                block
                size="large"
                onClick={() => {
                  if (resetToken.trim()) {
                    setStep("password");
                  } else {
                    message.error("Wpisz kod!");
                  }
                }}
                style={{ background: "#7C3AED", borderColor: "#7C3AED", fontWeight: 600 }}
              >
                Dalej
              </Button>
            </Form.Item>
          </Form>
        )}

        {step === "password" && (
          <Form name="password-form" onFinish={onPasswordReset} layout="vertical" form={form}>
            <Form.Item
              name="newPassword"
              label={<span style={{ color: "#374151", fontWeight: 500 }}>Nowe hasło</span>}
              rules={[
                { required: true, message: "Podaj hasło!" },
                { min: 12, message: "Hasło musi mieć minimum 12 znaków!" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                  message: "Hasło musi zawierać: małe litery, wielkie litery, liczby, znaki specjalne",
                },
              ]}
            >
              <Input.Password placeholder="••••••••" size="large" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label={<span style={{ color: "#374151", fontWeight: 500 }}>Potwierdź hasło</span>}
              rules={[{ required: true, message: "Potwierdź hasło!" }]}
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
                style={{ background: "#7C3AED", borderColor: "#7C3AED", fontWeight: 600 }}
              >
                Zmień hasło
              </Button>
            </Form.Item>
          </Form>
        )}

        <Divider style={{ margin: "24px 0", borderColor: "#E5E7EB" }} />

        <div style={{ textAlign: "center" }}>
          <Button
            type="default"
            block
            size="large"
            onClick={() => navigate("/login")}
            icon={<HomeOutlined />}
            style={{ fontWeight: 600, fontSize: 15, color: "#7C3AED", borderColor: "#7C3AED" }}
          >
            Wróć do logowania
          </Button>
        </div>
      </Card>
    </div>
  );
}
