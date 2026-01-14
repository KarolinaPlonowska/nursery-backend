import { useEffect, useState } from "react";
import { Card, Button, Table, message, Menu, Layout, Select, Space, Tabs, Badge } from "antd";
import { LogoutOutlined, TeamOutlined, SettingOutlined, CheckSquareOutlined, MessageOutlined, SoundOutlined } from "@ant-design/icons";
import axios from "axios";
import { useTheme } from "../hooks/useTheme";
import SettingsPage from "./SettingsPage";
import ChildAttendanceHistory from "../components/ChildAttendanceHistory";
import MessagesView from "../components/MessagesView";
import AnnouncementsView from "../components/AnnouncementsView";

const { Header, Content } = Layout;

import { API_URL } from "../config/api";

export default function ParentDashboard({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("children");
  const [selectedChildForAttendance, setSelectedChildForAttendance] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [unviewedCount, setUnviewedCount] = useState(0);

  const fetchUnviewedCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/announcements/unviewed/count`, {
        withCredentials: true,
      });
      setUnviewedCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unviewed count:', err);
    }
  };

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
    fetchUnviewedCount();
    // Odśwież co minutę
    const interval = setInterval(fetchUnviewedCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Automatycznie wybierz pierwsze dziecko dla widoku obecności
    if (children.length > 0 && !selectedChildForAttendance) {
      setSelectedChildForAttendance(children[0].id);
    }
  }, [children]);

  const menuItems = [
    {
      key: "children",
      icon: <TeamOutlined />,
      label: "Moje dzieci",
    },
    {
      key: "attendance",
      icon: <CheckSquareOutlined />,
      label: "Historia obecności",
    },
    {
      key: "communication",
      icon: <MessageOutlined />,
      label: (
        <Badge count={unviewedCount} offset={[10, 0]}>
          <span style={{ color: "rgba(255, 255, 255, 0.85)" }}>Komunikacja</span>
        </Badge>
      ),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Ustawienia",
    },
  ];

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
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          height: "64px",
        }}
      >
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          width: "100%",
          gap: "16px",
        }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[activeTab]}
            items={menuItems}
            onClick={({ key }) => setActiveTab(key)}
            style={{ 
              flex: 1,
              background: "transparent",
              border: "none",
            }}
          />
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={onLogout}
            style={{
              color: "white",
              flexShrink: 0,
              height: "40px",
              padding: "0 15px",
            }}
          >
            Wyloguj
          </Button>
        </div>
      </Header>
      <Content style={{ margin: "24px auto 32px auto", width: "100%", padding: "24px", maxWidth: 1200 }}>
        {activeTab === "children" && (
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: isDark ? "0 0 20px rgba(251,191,36,0.15), 0 0 40px rgba(124,58,237,0.1)" : "0 2px 8px rgba(0,0,0,0.08)",
                border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
                background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined
              }}
              title={
                <span style={{ fontSize: 20, fontWeight: 700, background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  <TeamOutlined style={{ color: "#FBBF24", marginRight: 8 }} /> Twoje dzieci
                </span>
              }
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
                  <span style={{ fontWeight: 500, color: isDark ? "#E5E7EB" : "#1F2937" }}>{record.firstName}</span>
                ) 
              },
              { 
                title: "Nazwisko", 
                dataIndex: "lastName", 
                render: (_: any, record: any) => (
                  <span style={{ fontWeight: 500, color: isDark ? "#E5E7EB" : "#1F2937" }}>{record.lastName}</span>
                ) 
              },
              {
                title: "Data urodzenia",
                dataIndex: "birthDate",
                render: (date) => date && <span style={{ color: isDark ? "#D1D5DB" : "#6B7280" }}>{date.slice(0, 10)}</span>,
              },
              {
                title: "Grupa",
                render: (_: any, record: any) => {
                  if (record.group) {
                    return (
                      <span style={{ fontWeight: 500, color: isDark ? "#A78BFA" : "#7C3AED" }}>
                        {record.group.name}
                      </span>
                    );
                  }
                  return <span style={{ color: isDark ? "#9CA3AF" : "#9CA3AF" }}>Brak grupy</span>;
                },
              },
              {
                title: "Opiekun grupy",
                render: (_: any, record: any) => {
                  if (record.group?.caregiver) {
                    return (
                      <div>
                        <div style={{ fontWeight: 500, color: isDark ? "#E5E7EB" : "#1F2937" }}>
                          {record.group.caregiver.firstName} {record.group.caregiver.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: isDark ? "#D1D5DB" : "#6B7280" }}>
                          {record.group.caregiver.email}
                        </div>
                      </div>
                    );
                  }
                  return <span style={{ color: isDark ? "#9CA3AF" : "#9CA3AF" }}>Brak opiekuna</span>;
                },
              },
            ]}
          />
        </Card>
          </div>
        )}
        {activeTab === "attendance" && (
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {children.length === 0 ? (
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: isDark ? "0 0 20px rgba(123,58,237,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
                  border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
                  background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : "white"
                }}
              >
                <p style={{ textAlign: "center", color: isDark ? "#A78BFA" : "#6B7280", fontSize: 16 }}>
                  Nie masz zarejestrowanych dzieci.
                </p>
              </Card>
            ) : (
              <div>
                {children.length > 1 && (
                  <Card
                    style={{
                      marginBottom: 16,
                      borderRadius: 12,
                      boxShadow: isDark ? "0 0 20px rgba(123,58,237,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
                      border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
                      background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : "white"
                    }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <span style={{ fontWeight: 500, color: isDark ? "#E5E7EB" : "#1F2937" }}>
                        Wybierz dziecko:
                      </span>
                      <Select
                        value={selectedChildForAttendance}
                        onChange={setSelectedChildForAttendance}
                        style={{ width: "100%" }}
                      >
                        {children.map(child => (
                          <Select.Option key={child.id} value={child.id}>
                            {child.firstName} {child.lastName} {child.group ? `- Grupa: ${child.group.name}` : ""}
                          </Select.Option>
                        ))}
                      </Select>
                    </Space>
                  </Card>
                )}
                
                {selectedChildForAttendance && (() => {
                  const selectedChild = children.find(c => c.id === selectedChildForAttendance);
                  return selectedChild ? (
                    <ChildAttendanceHistory
                      childId={selectedChild.id}
                      childName={`${selectedChild.firstName} ${selectedChild.lastName}`}
                    />
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}
        {activeTab === "communication" && (
          <div>
            <Tabs
              defaultActiveKey={unviewedCount > 0 ? "announcements" : "messages"}
              items={[
                {
                  key: "messages",
                  label: (
                    <span>
                      <MessageOutlined style={{ marginRight: 8 }} /> Wiadomości
                    </span>
                  ),
                  children: <MessagesView />,
                },
                {
                  key: "announcements",
                  label: (
                    <Badge count={unviewedCount} offset={[10, 0]}>
                      <span>
                        <SoundOutlined style={{ marginRight: 8 }} /> Ogłoszenia
                      </span>
                    </Badge>
                  ),
                  children: <AnnouncementsView onAnnouncementsViewed={fetchUnviewedCount} />,
                },
              ]}
            />
          </div>
        )}
        {activeTab === "settings" && <SettingsPage />}
      </Content>
    </Layout>
  );
}
