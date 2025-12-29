import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Form, Input, Button, message, Alert, Spin } from "antd";
import { CheckCircleOutlined, MailOutlined, HomeOutlined } from "@ant-design/icons";
import axios from "axios";

const API_URL = "http://localhost:3000";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const email = location.state?.email;

  if (!email) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <Card style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
          <p style={{ color: "#6B7280" }}>Brak danych weryfikacyjnych. Wróć do strony głównej.</p>
          <Button
            type="primary"
            onClick={() => navigate("/")}
            style={{ background: "#7C3AED" }}
            icon={<HomeOutlined />}
          >
            Strona główna
          </Button>
        </Card>
      </div>
    );
  }

  const handleVerify = async (values: any) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-email`, {
        email,
        code: values.code,
      });

      message.success("Email zweryfikowany! Teraz możesz się zalogować.");
      setVerified(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Weryfikacja nie powiodła się");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post(`${API_URL}/auth/resend-verification-code`, { email });
      message.success("Nowy kod wysłany na email");
      setResendCooldown(60); // 60 sekund cooldown

      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Nie udało się wysłać kodu");
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <Card style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
          <div style={{ fontSize: 60, color: "#10B981", marginBottom: 16 }}>
            <CheckCircleOutlined />
          </div>
          <h1 style={{ fontSize: 24, color: "#1F2937", fontWeight: 700 }}>Gratulacje!</h1>
          <p style={{ color: "#6B7280", marginTop: 8 }}>
            Email zweryfikowany pomyślnie. Zostaniesz przekierowany do logowania...
          </p>
          <Spin />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
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
          <div style={{ fontSize: 40, color: "#7C3AED", marginBottom: 16, display: "flex", justifyContent: "center" }}>
            <MailOutlined />
          </div>
          <h1 style={{ fontSize: 28, color: "#1F2937", fontWeight: 700, margin: 0 }}>Weryfikacja emaila</h1>
          <p style={{ color: "#6B7280", marginTop: 8 }}>Potwierdź swój adres email</p>
        </div>

        <Alert
          message={`Wysłaliśmy kod weryfikacyjny na: ${email}`}
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />

        <div style={{ marginBottom: 24, padding: "12px", background: "#FEF3C7", borderRadius: 8, border: "1px solid #FCD34D" }}>
          <p style={{ color: "#92400E", fontSize: 13, margin: 0 }}>
            ⏱️ Kod ważny przez 15 minut. Sprawdź folder spam jeśli nie widzisz emaila.
          </p>
        </div>

        <Form
          onFinish={handleVerify}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="code"
            label={<span style={{ color: "#374151", fontWeight: 500 }}>Kod weryfikacyjny</span>}
            rules={[
              { required: true, message: "Wpisz kod z emaila" },
              { len: 6, message: "Kod musi mieć 6 cyfr" },
            ]}
          >
            <Input
              placeholder="Wpisz 6-cyfrowy kod"
              size="large"
              maxLength={6}
              style={{ letterSpacing: "4px", fontSize: 18, textAlign: "center" }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ background: "#7C3AED", borderColor: "#7C3AED", fontWeight: 600, fontSize: 16 }}
            >
              Potwierdź email
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", paddingTop: 24, borderTop: "1px solid #E5E7EB" }}>
          <p style={{ color: "#6B7280", marginBottom: 12, fontSize: 14 }}>Nie otrzymałeś kodu?</p>
          <Button
            type="text"
            loading={resending}
            disabled={resendCooldown > 0}
            onClick={handleResend}
            style={{ color: "#7C3AED", fontWeight: 600 }}
          >
            {resendCooldown > 0 ? `Poczekaj ${resendCooldown}s` : "Wyślij kod ponownie"}
          </Button>

          <Button
            type="text"
            block
            size="large"
            onClick={() => navigate("/")}
            icon={<HomeOutlined />}
            style={{ fontWeight: 600, fontSize: 15, color: "#6B7280", marginTop: 16 }}
          >
            Wróć do strony głównej
          </Button>
        </div>
      </Card>
    </div>
  );
}
