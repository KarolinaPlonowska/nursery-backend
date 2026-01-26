import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Alert, Spin, App } from 'antd';
import { UserAddOutlined, CheckCircleOutlined } from '@ant-design/icons';
import apiClient from '../utils/axiosConfig';
import { useTheme } from '../hooks/useTheme';

export default function AdminInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    if (!token) {
      setError('Nieprawidłowy link zaproszenia');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(
        `/auth/validate-admin-invitation/${token}`
      );
      setInvitationData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Zaproszenie jest nieprawidłowe lub wygasło');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await apiClient.post('/auth/accept-admin-invitation', {
        token,
        password: values.password,
      });
      
      setSuccess(true);
      message.success('Konto administratora zostało utworzone!');
      
      // Przekieruj do logowania po 3 sekundach
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Konto zostało utworzone. Możesz się teraz zalogować.' 
          }
        });
      }, 3000);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Błąd podczas tworzenia konta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? "linear-gradient(180deg, #0f0a1a 0%, #141414 50%, #0f0a1a 100%)" : "#F9FAFB"
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? "linear-gradient(180deg, #0f0a1a 0%, #141414 50%, #0f0a1a 100%)" : "#F9FAFB",
        padding: 20
      }}>
        <Card style={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined,
          border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB"
        }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ color: isDark ? "#FBBF24" : "#7C3AED", fontSize: 24, marginBottom: 8 }}>
              Zaproszenie nieprawidłowe
            </h1>
            <Alert
              message="Błąd"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Button
              type="primary"
              onClick={() => navigate('/login')}
              style={{
                background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
                border: "none",
                fontWeight: 600
              }}
            >
              Wróć do logowania
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? "linear-gradient(180deg, #0f0a1a 0%, #141414 50%, #0f0a1a 100%)" : "#F9FAFB",
        padding: 20
      }}>
        <Card style={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined,
          border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB"
        }}>
          <div style={{ marginBottom: 24 }}>
            <CheckCircleOutlined 
              style={{ 
                fontSize: 48, 
                color: '#10B981', 
                marginBottom: 16 
              }} 
            />
            <h1 style={{ color: isDark ? "#FBBF24" : "#7C3AED", fontSize: 24, marginBottom: 8 }}>
              Konto utworzone!
            </h1>
            <p style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#6B7280", marginBottom: 24 }}>
              Twoje konto administratora zostało pomyślnie utworzone. 
              Za chwilę zostaniesz przekierowany do logowania.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark ? "linear-gradient(180deg, #0f0a1a 0%, #141414 50%, #0f0a1a 100%)" : "#F9FAFB",
      padding: 20
    }}>
      <Card style={{
        maxWidth: 500,
        width: '100%',
        background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined,
        border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
        boxShadow: isDark ? "0 0 20px rgba(251,191,36,0.15)" : "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <UserAddOutlined 
            style={{ 
              fontSize: 48, 
              color: isDark ? "#FBBF24" : "#7C3AED", 
              marginBottom: 16 
            }} 
          />
          <h1 style={{ color: isDark ? "#FBBF24" : "#7C3AED", fontSize: 24, marginBottom: 8 }}>
            Zaproszenie do administracji
          </h1>
          <p style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#6B7280", marginBottom: 0 }}>
            Witaj {invitationData?.firstName}! Utwórz hasło dla swojego konta administratora.
          </p>
        </div>

        <Alert
          message="Informacje o zaproszeniu"
          description={
            <div>
              <p style={{ margin: 0 }}>
                <strong>Email:</strong> {invitationData?.email}<br />
                <strong>Imię i nazwisko:</strong> {invitationData?.firstName} {invitationData?.lastName}<br />
                <strong>Zaproszenie ważne do:</strong> {new Date(invitationData?.expiresAt).toLocaleString('pl-PL')}
              </p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
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
            <Input.Password 
              placeholder="Wprowadź swoje hasło" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Potwierdź hasło"
            dependencies={['password']}
            rules={[
              { required: true, message: "Potwierdź hasło" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Hasła nie są identyczne'));
                },
              }),
            ]}
          >
            <Input.Password 
              placeholder="Potwierdź hasło" 
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              size="large"
              block
              style={{
                background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
                border: "none",
                fontWeight: 600,
                height: 48,
                fontSize: 16
              }}
            >
              Utwórz konto administratora
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}