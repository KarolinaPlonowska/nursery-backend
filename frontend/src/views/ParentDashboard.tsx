import { useEffect, useState } from "react";
import { Card, Button, Table, message, Menu, Layout } from "antd";
import { LogoutOutlined, TeamOutlined, SettingOutlined } from "@ant-design/icons";
import axios from "axios";
import { useTheme } from "../hooks/useTheme";
import SettingsPage from "./SettingsPage";

const { Header, Content } = Layout;

const API_URL = "http://localhost:3000";

export default function ParentDashboard({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("children");
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/parents/children`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setChildren(res.data);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd pobierania dzieci");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  return (
    <Layout style={{ background: isDark ? "linear-gradient(180deg, #0f0a1a 0%, #141414 50%, #0f0a1a 100%)" : "#F9FAFB", minHeight: "100vh", transition: "background-color 0.3s ease" }}>
      <Header
        style={{
          background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #FBBF24 100%)",
          position: "fixed",
          zIndex: 100,
          width: "100%",
          top: 0,
          boxShadow: "0 2px 12px rgba(251,191,36,0.3)",
          padding: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[activeTab]}
          onClick={({ key }) => {
            if (key === "logout") onLogout();
            else setActiveTab(key);
          }}
          style={{ flex: 1, minWidth: 0, display: "flex", background: "transparent" }}
        >
          <Menu.Item key="children" icon={<TeamOutlined />}>
            Moje dzieci
          </Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            Ustawienia
          </Menu.Item>
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            style={{ marginLeft: "auto" }}
          >
            Wyloguj
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ margin: "96px auto 32px auto", width: "100%", padding: "24px", maxWidth: 1200 }}>
        {activeTab === "children" && (
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: isDark ? "0 0 20px rgba(251,191,36,0.15), 0 0 40px rgba(124,58,237,0.1)" : "0 2px 8px rgba(0,0,0,0.08)",
                border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
                background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined
              }}
              title={<span style={{ fontSize: 20, fontWeight: 700, background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>👶 Twoje dzieci</span>}
            >
          <Table
            dataSource={children}
            rowKey="id"
            loading={loading}
            pagination={false}
            columns={[
              { 
                title: "Imię", 
                dataIndex: "firstName", 
                render: (_: any, record: any) => (
                  <span style={{ fontWeight: 500, color: "#1F2937" }}>{record.firstName}</span>
                ) 
              },
              { 
                title: "Nazwisko", 
                dataIndex: "lastName", 
                render: (_: any, record: any) => (
                  <span style={{ fontWeight: 500, color: "#1F2937" }}>{record.lastName}</span>
                ) 
              },
              {
                title: "Data urodzenia",
                dataIndex: "birthDate",
                render: (date) => date && <span style={{ color: "#6B7280" }}>{date.slice(0, 10)}</span>,
              },
              {
                title: "Grupa",
                render: (_: any, record: any) => {
                  if (record.group) {
                    return (
                      <span style={{ fontWeight: 500, color: "#7C3AED" }}>
                        {record.group.name}
                      </span>
                    );
                  }
                  return <span style={{ color: "#9CA3AF" }}>Brak grupy</span>;
                },
              },
              {
                title: "Opiekun grupy",
                render: (_: any, record: any) => {
                  if (record.group?.caregiver) {
                    return (
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {record.group.caregiver.firstName} {record.group.caregiver.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>
                          {record.group.caregiver.email}
                        </div>
                      </div>
                    );
                  }
                  return <span style={{ color: "#9CA3AF" }}>Brak opiekuna</span>;
                },
              },
            ]}
          />
        </Card>
          </div>
        )}
        {activeTab === "settings" && <SettingsPage />}
      </Content>
    </Layout>
  );
}
