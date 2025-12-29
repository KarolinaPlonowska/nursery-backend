import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Form, Input, Button, message, Alert } from "antd";
import { UserOutlined, TeamOutlined, HomeOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000";

const validatePasswordStrength = (password: string) => {
  const requirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  return {
    ...requirements,
    metRequirements,
    strength: metRequirements === 5 ? 100 : metRequirements === 4 ? 80 : metRequirements === 3 ? 50 : 20,
  };
};

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  
  const roleFromUrl = searchParams.get("role");
  const role = (roleFromUrl === "PARENT" || roleFromUrl === "CAREGIVER") ? roleFromUrl : null;

  const handlePasswordChange = (e: any) => {
    const value = e.target.value;
    if (value) {
      setPasswordStrength(validatePasswordStrength(value));
    } else {
      setPasswordStrength(null);
    }
  };

  useEffect(() => {
    if (!role) {
      message.warning("Wybierz rolę na stronie głównej");
      navigate("/");
    } else {
      form.setFieldsValue({ role });
    }
  }, [role, navigate, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, values);
      message.success("Kod weryfikacyjny wysłany na email!");
      navigate("/verify-email", {
        state: {
          email: values.email,
          firstName: values.firstName,
        },
      });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Rejestracja nie powiodła się");
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;

  const roleLabel = role === "PARENT" ? "Rodzic" : "Opiekun";
  const roleIcon = role === "PARENT" ? <UserOutlined /> : <TeamOutlined />;

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
            {roleIcon}
          </div>
          <h1 style={{ fontSize: 28, color: "#1F2937", fontWeight: 700, margin: 0 }}>Utwórz konto</h1>
          <p style={{ color: "#6B7280", marginTop: 8 }}>Rejestracja jako {roleLabel.toLowerCase()}</p>
        </div>

        <Alert
          message={`Tworzysz konto dla: ${roleLabel}`}
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
          onFinishFailed={() => message.error("Uzupełnij wszystkie wymagane pola")}
        >
          <Form.Item name="role" initialValue={role} hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name="firstName"
            label={<span style={{ color: "#374151", fontWeight: 500 }}>Imię</span>}
            rules={[{ required: true, message: "Podaj imię" }]}
          >
            <Input placeholder="np. Jan" size="large" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label={<span style={{ color: "#374151", fontWeight: 500 }}>Nazwisko</span>}
            rules={[{ required: true, message: "Podaj nazwisko" }]}
          >
            <Input placeholder="np. Kowalski" size="large" />
          </Form.Item>
          <Form.Item
            name="email"
            label={<span style={{ color: "#374151", fontWeight: 500 }}>Email</span>}
            rules={[
              {
                required: true,
                type: "email",
                message: "Podaj prawidłowy email!",
              },
            ]}
          >
            <Input placeholder="email@example.com" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span style={{ color: "#374151", fontWeight: 500 }}>Hasło (Silne)</span>}
            rules={[
              {
                required: true,
                message: "Hasło jest wymagane!",
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  
                  const strength = validatePasswordStrength(value);
                  if (strength.metRequirements < 4) {
                    return Promise.reject(new Error(
                      "Hasło musi spełniać: co najmniej 12 znaków, wielka litera, mała litera, cyfrę i znak specjalny"
                    ));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password placeholder="•••••••••••" size="large" onChange={handlePasswordChange} />
          </Form.Item>
          
          {passwordStrength && (
            <div style={{ marginTop: -20, marginBottom: 16, padding: "12px", background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>Siła hasła:</div>
                <div style={{
                  height: 6,
                  background: "#E5E7EB",
                  borderRadius: 3,
                  overflow: "hidden"
                }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${passwordStrength.strength}%`,
                      background: passwordStrength.strength >= 80 ? "#10B981" : passwordStrength.strength >= 50 ? "#F59E0B" : "#EF4444",
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>
                <div style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: passwordStrength.metRequirements >= 4 ? "#10B981" : "#EF4444" }}>
                    {passwordStrength.metRequirements >= 4 ? "✓" : "✗"}
                  </span>
                  Co najmniej 12 znaków ({passwordStrength.minLength ? "✓" : "✗"})
                </div>
                <div style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{passwordStrength.hasUppercase ? "✓" : "✗"}</span>
                  Wielka litera (A-Z)
                </div>
                <div style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{passwordStrength.hasLowercase ? "✓" : "✗"}</span>
                  Mała litera (a-z)
                </div>
                <div style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{passwordStrength.hasNumber ? "✓" : "✗"}</span>
                  Cyfra (0-9)
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{passwordStrength.hasSpecialChar ? "✓" : "✗"}</span>
                  Znak specjalny (!@#$%^&* itp.)
                </div>
              </div>
            </div>
          )}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ background: "#7C3AED", borderColor: "#7C3AED", fontWeight: 600, fontSize: 16 }}
            >
              Zarejestruj się jako {roleLabel.toLowerCase()}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 24, paddingTop: 24, borderTop: "1px solid #E5E7EB" }}>
          <p style={{ color: "#6B7280", marginBottom: 12 }}>Masz już konto?</p>
          <Button
            type="default"
            block
            size="large"
            onClick={() => navigate("/login")}
            style={{ fontWeight: 600, fontSize: 15, color: "#7C3AED", borderColor: "#7C3AED" }}
          >
            Zaloguj się
          </Button>
          <Button
            type="text"
            block
            size="large"
            onClick={() => navigate("/")}
            icon={<HomeOutlined />}
            style={{ fontWeight: 600, fontSize: 15, color: "#6B7280", marginTop: 8 }}
          >
            Wróć do strony głównej
          </Button>
        </div>
      </Card>
    </div>
  );
}
