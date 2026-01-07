import { useEffect, useState } from "react";
import { Card, Button, Table, message, Collapse, Menu, Layout } from "antd";
import { LogoutOutlined, TeamOutlined, SettingOutlined } from "@ant-design/icons";
import axios from "axios";
import { useTheme } from "../hooks/useTheme";
import SettingsPage from "./SettingsPage";

const { Panel } = Collapse;
const { Header, Content } = Layout;
const API_URL = "http://localhost:3000";

export default function CaregiverDashboard({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("groups");
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchMyGroups = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/groups/my-groups`, {
          withCredentials: true,
        });
        setGroups(res.data);
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Błąd pobierania grup");
      } finally {
        setLoading(false);
      }
    };
    fetchMyGroups();
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
          <Menu.Item key="groups" icon={<TeamOutlined />}>
            Moje grupy
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
        {activeTab === "groups" && (
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {loading ? (
              <Card loading />
            ) : groups.length === 0 ? (
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: isDark ? "0 0 20px rgba(123,58,237,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
                  border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
                  background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : "white"
                }}
              >
                <p style={{ textAlign: "center", color: isDark ? "#A78BFA" : "#6B7280", fontSize: 16 }}>
                  Nie masz przypisanych żadnych grup. Skontaktuj się z administratorem.
                </p>
              </Card>
            ) : (
              <Collapse 
                defaultActiveKey={groups.map(g => g.id)}
                style={{ background: "transparent", border: "none" }}
              >
                {groups.map((group: any) => (
                  <Panel
                    header={
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 18, fontWeight: 600, color: isDark ? "#FBBF24" : "#1F2937" }}>
                          👶 Grupa: {group.name}
                        </span>
                        <span style={{ fontSize: 14, color: isDark ? "#A78BFA" : "#6B7280" }}>
                          Dzieci: {group.children?.length || 0}
                        </span>
                      </div>
                    }
                    key={group.id}
                    style={{
                      marginBottom: 16,
                      borderRadius: 12,
                      boxShadow: isDark ? "0 0 20px rgba(123,58,237,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
                      border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
                      background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : "white"
                    }}
                  >
                    <Table
                      dataSource={group.children || []}
                      rowKey="id"
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
                          render: (date) => date && (
                            <span style={{ color: "#6B7280" }}>{date.slice(0, 10)}</span>
                          ),
                        },
                        {
                          title: "Rodzic",
                          render: (_: any, record: any) => {
                            if (record.parent) {
                              const hasName = record.parent.firstName && record.parent.lastName;
                              return (
                                <div>
                                  <div style={{ fontWeight: 500, color: "#1F2937" }}>
                                    {hasName 
                                      ? `${record.parent.firstName} ${record.parent.lastName}`
                                      : record.parent.email
                                    }
                                  </div>
                                  {hasName && (
                                    <div style={{ fontSize: 12, color: "#6B7280" }}>
                                      {record.parent.email}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return <span style={{ color: "#9CA3AF" }}>Brak rodzica</span>;
                          },
                        },
                      ]}
                      locale={{ emptyText: "Brak dzieci w tej grupie" }}
                    />
                  </Panel>
                ))}
              </Collapse>
            )}
          </div>
        )}
        {activeTab === "settings" && <SettingsPage />}
      </Content>
    </Layout>
  );
}
