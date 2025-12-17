import { useNavigate } from "react-router-dom";
import { Button, Row, Col, Card, Space } from "antd";
import {
  LoginOutlined,
  PlusOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "calc(100vh - 200px)", background: "#f5f7fa", marginTop: -32, marginLeft: -32, marginRight: -32 }}>
      {/* Hero Section */}
      <div>
        <div className="landing-hero">
          <div className="hero-content">
            <h1 className="hero-title">🎨 Nursery Management System</h1>
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
                style={{ paddingInline: 48, height: 50, fontSize: 16 }}
              >
                Zaloguj się
              </Button>
              <Button
                size="large"
                icon={<PlusOutlined />}
                onClick={() => navigate("/register")}
                style={{ paddingInline: 48, height: 50, fontSize: 16 }}
              >
                Utwórz konto
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
                <TeamOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
                <h3>Zarządzanie dziećmi</h3>
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
                <ClockCircleOutlined style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }} />
                <h3>Śledzenie obecności</h3>
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
                <SafetyOutlined style={{ fontSize: 48, color: "#faad14", marginBottom: 16 }} />
                <h3>Bezpieczeństwo danych</h3>
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
                <SmileOutlined style={{ fontSize: 48, color: "#f5222d", marginBottom: 16 }} />
                <h3>Łatwy interfejs</h3>
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
                <PlusOutlined style={{ fontSize: 48, color: "#722ed1", marginBottom: 16 }} />
                <h3>Role użytkowników</h3>
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
                <TeamOutlined style={{ fontSize: 48, color: "#13c2c2", marginBottom: 16 }} />
                <h3>Zarządzanie grupami</h3>
                <p style={{ color: "#666" }}>
                  Twórz grupy, przypisuj opiekunów i organizuj dzieci
                </p>
              </Card>
            </Col>
          </Row>
        </div>

        {/* CTA Section */}
        <div style={{ padding: "60px 20px", background: "#f5f7fa", marginTop: 0 }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: 28, marginBottom: 20 }}>Gotowy do rozpoczęcia?</h2>
            <p style={{ fontSize: 16, color: "#666", marginBottom: 40 }}>
              Dołącz do nas już dziś i ułatw sobie zarządzanie przedszkolem
            </p>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={() => navigate("/login")}
                style={{ paddingInline: 48, height: 48, fontSize: 16 }}
              >
                Zaloguj się
              </Button>
              <Button
                type="default"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => navigate("/register")}
                style={{ paddingInline: 48, height: 48, fontSize: 16 }}
              >
                Utwórz konto
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
}
