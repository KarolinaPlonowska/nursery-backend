import { useNavigate } from "react-router-dom";
import { Button, Row, Col, Card, Space } from "antd";
import {
  LoginOutlined,
  PlusOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  SmileOutlined,
  UserOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "calc(100vh - 200px)", background: "#F9FAFB" }}>
      {/* Hero Section */}
      <div>
        <div className="landing-hero">
          <div className="hero-content">
            <h1 className="hero-title"><ScheduleOutlined style={{ marginRight: 12 }} />Nursery Management System</h1>
            <p className="hero-subtitle">
              Nowoczesny system zarządzania przedszkolem dla rodziców, opiekunów i administratorów
            </p>
            <p className="hero-description">
              Łatwe zarządzanie dziećmi, grupami, obecnością i komunikacją między stronami
            </p>

            {/* Action Buttons */}
            <Space size="large" style={{ marginTop: 40 }}>
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={() => navigate("/login")}
                style={{ paddingInline: 48, height: 50, fontSize: 16, background: "#FBBF24", borderColor: "#FBBF24", color: "#1F2937", fontWeight: 600 }}
              >
                Zaloguj się
              </Button>
            </Space>
            <p style={{ fontSize: 14, marginTop: 30, marginBottom: 10, opacity: 0.9 }}>Utwórz konto jako:</p>
            <Space size="middle" style={{ marginTop: 0 }}>
              <Button
                size="large"
                icon={<UserOutlined />}
                onClick={() => navigate("/register?role=PARENT")}
                style={{ paddingInline: 40, height: 48, fontSize: 15, background: "white", borderColor: "white", color: "#7C3AED", fontWeight: 600 }}
              >
                Rodzic
              </Button>
              <Button
                size="large"
                icon={<TeamOutlined />}
                onClick={() => navigate("/register?role=CAREGIVER")}
                style={{ paddingInline: 40, height: 48, fontSize: 15, background: "rgba(255,255,255,0.9)", borderColor: "rgba(255,255,255,0.9)", color: "#7C3AED", fontWeight: 600 }}
              >
                Opiekun
              </Button>
            </Space>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ padding: "60px 20px", background: "white", marginTop: 40 }}>
          <h2 style={{ textAlign: "center", fontSize: 28, marginBottom: 50 }}>
            Funkcjonalności aplikacji
          </h2>

          <Row gutter={[32, 32]} style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Col xs={24} sm={12} md={8}>
              <Card
                bordered={false}
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  height: "100%",
                  padding: 32,
                }}
              >
                <TeamOutlined style={{ fontSize: 48, color: "#7C3AED", marginBottom: 16 }} />
                <h3 style={{ color: "#1F2937", fontWeight: 600 }}>Zarządzanie dziećmi</h3>
                <p style={{ color: "#666" }}>
                  Dodawaj dzieci, przypisuj je do grup i monitoruj ich aktywności
                </p>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card
                bordered={false}
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  height: "100%",
                  padding: 32,
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 48, color: "#FBBF24", marginBottom: 16 }} />
                <h3 style={{ color: "#1F2937", fontWeight: 600 }}>Śledzenie obecności</h3>
                <p style={{ color: "#666" }}>
                  Rejestruj obecność dzieci i analizuj raporty uczestnictwa
                </p>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card
                bordered={false}
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  height: "100%",
                  padding: 32,
                }}
              >
                <SafetyOutlined style={{ fontSize: 48, color: "#8B5CF6", marginBottom: 16 }} />
                <h3 style={{ color: "#1F2937", fontWeight: 600 }}>Bezpieczeństwo danych</h3>
                <p style={{ color: "#666" }}>
                  Zabezpieczone hasła i autoryzacja na każdym kroku
                </p>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card
                bordered={false}
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  height: "100%",
                  padding: 32,
                }}
              >
                <SmileOutlined style={{ fontSize: 48, color: "#F59E0B", marginBottom: 16 }} />
                <h3 style={{ color: "#1F2937", fontWeight: 600 }}>Łatwy interfejs</h3>
                <p style={{ color: "#666" }}>
                  Intuicyjny design dostępny dla wszystkich użytkowników
                </p>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card
                bordered={false}
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  height: "100%",
                  padding: 32,
                }}
              >
                <PlusOutlined style={{ fontSize: 48, color: "#7C3AED", marginBottom: 16 }} />
                <h3 style={{ color: "#1F2937", fontWeight: 600 }}>Role użytkowników</h3>
                <p style={{ color: "#666" }}>
                  Różne poziomy dostępu dla rodziców, opiekunów i administratorów
                </p>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card
                bordered={false}
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  height: "100%",
                  padding: 32,
                }}
              >
                <TeamOutlined style={{ fontSize: 48, color: "#FBBF24", marginBottom: 16 }} />
                <h3 style={{ color: "#1F2937", fontWeight: 600 }}>Zarządzanie grupami</h3>
                <p style={{ color: "#666" }}>
                  Twórz grupy, przypisuj opiekunów i organizuj dzieci
                </p>
              </Card>
            </Col>
          </Row>
        </div>

        {/* CTA Section */}
        <div style={{ padding: "60px 20px", background: "#F3F4F6", marginTop: 0 }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: 28, marginBottom: 20, color: "#1F2937", fontWeight: 700 }}>Gotowy do rozpoczęcia?</h2>
            <p style={{ fontSize: 16, color: "#6B7280", marginBottom: 40 }}>
              Dołącz do nas już dziś i ułatw sobie zarządzanie przedszkolem
            </p>
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={() => navigate("/login")}
              style={{ paddingInline: 48, height: 48, fontSize: 16, background: "#7C3AED", borderColor: "#7C3AED", fontWeight: 600, marginBottom: 20 }}
            >
              Zaloguj się
            </Button>
            <p style={{ fontSize: 14, marginBottom: 15, color: "#6B7280" }}>lub utwórz konto jako:</p>
            <Space size="middle">
              <Button
                size="large"
                icon={<UserOutlined />}
                onClick={() => navigate("/register?role=PARENT")}
                style={{ paddingInline: 40, height: 48, fontSize: 15, background: "#FBBF24", borderColor: "#FBBF24", color: "#1F2937", fontWeight: 600 }}
              >
                Rodzic
              </Button>
              <Button
                size="large"
                icon={<TeamOutlined />}
                onClick={() => navigate("/register?role=CAREGIVER")}
                style={{ paddingInline: 40, height: 48, fontSize: 15, background: "#F59E0B", borderColor: "#F59E0B", color: "#1F2937", fontWeight: 600 }}
              >
                Opiekun
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
}
