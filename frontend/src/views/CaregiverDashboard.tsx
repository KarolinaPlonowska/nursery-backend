import { useEffect, useState } from "react";
import { Card, Button, Table, message, Collapse, Menu, Layout, Select, Tabs, Badge } from "antd";
import { LogoutOutlined, TeamOutlined, SettingOutlined, CheckSquareOutlined, MessageOutlined } from "@ant-design/icons";
import axios from "axios";
import { useTheme } from "../hooks/useTheme";
import SettingsPage from "./SettingsPage";
import AttendanceView from "../components/AttendanceView";
import MessagesView from "../components/MessagesView";
import AnnouncementsView from "../components/AnnouncementsView";

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
  const [selectedGroupForAttendance, setSelectedGroupForAttendance] = useState<string | null>(null);
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
    fetchUnviewedCount();
    // Odśwież co minutę
    const interval = setInterval(fetchUnviewedCount, 60000);
    return () => clearInterval(interval);
  }, []);
useEffect(() => {
    // Automatycznie wybierz pierwszą grupę dla widoku obecności
    if (groups.length > 0 && !selectedGroupForAttendance) {
      setSelectedGroupForAttendance(groups[0].id);
    }
  }, [groups]);

  const menuItems = [
    {
      key: "groups",
      icon: <TeamOutlined />,
      label: "Moje grupy",
    },
    {
      key: "attendance",
      icon: <CheckSquareOutlined />,
      label: "Lista obecności",
    },
    {
      key: "communication",
      icon: <MessageOutlined />,
      label: (
        <Badge count={unviewedCount} offset={[10, 0]}>
          Komunikacja
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
                items={groups.map((group: any) => ({
                  key: group.id,
                  label: (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 18, fontWeight: 600, color: isDark ? "#FBBF24" : "#1F2937" }}>
                        👶 Grupa: {group.name}
                      </span>
                      <span style={{ fontSize: 14, color: isDark ? "#A78BFA" : "#6B7280" }}>
                        Dzieci: {group.children?.length || 0}
                      </span>
                    </div>
                  ),
                  children: (
                    <Table
                      dataSource={group.children || []}
                      rowKey="id"
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
                          render: (date) => date && (
                            <span style={{ color: isDark ? "#D1D5DB" : "#6B7280" }}>{date.slice(0, 10)}</span>
                          ),
                        },
                        {
                          title: "Rodzic",
                          render: (_: any, record: any) => {
                            if (record.parent) {
                              const hasName = record.parent.firstName && record.parent.lastName;
                              return (
                                <div>
                                  <div style={{ fontWeight: 500, color: isDark ? "#E5E7EB" : "#1F2937" }}>
                                    {hasName 
                                      ? `${record.parent.firstName} ${record.parent.lastName}`
                                      : record.parent.email
                                    }
                                  </div>
                                  {hasName && (
                                    <div style={{ fontSize: 12, color: isDark ? "#D1D5DB" : "#6B7280" }}>
                                      {record.parent.email}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return <span style={{ color: isDark ? "#9CA3AF" : "#9CA3AF" }}>Brak rodzica</span>;
                          },
                        },
                      ]}
                      locale={{ emptyText: "Brak dzieci w tej grupie" }}
                    />
                  ),
                  style: {
                    marginBottom: 16,
                    borderRadius: 12,
                    boxShadow: isDark ? "0 0 20px rgba(123,58,237,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
                    border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
                    background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : "white"
                  }
                }))}
              />
            )}
          </div>
        )}
        {activeTab === "attendance" && (
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {groups.length === 0 ? (
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: isDark ? "0 0 20px rgba(123,58,237,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
                  border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
                  background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : "white"
                }}
              >
                <p style={{ textAlign: "center", color: isDark ? "#A78BFA" : "#6B7280", fontSize: 16 }}>
                  Nie masz przypisanych żadnych grup.
                </p>
              </Card>
            ) : (
              <div style={{ marginBottom: 16 }}>
                {groups.length > 1 && (
                  <Card
                    style={{
                      marginBottom: 16,
                      borderRadius: 12,
                      boxShadow: isDark ? "0 0 20px rgba(123,58,237,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
                      border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
                      background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : "white"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontWeight: 500, color: isDark ? "#E5E7EB" : "#1F2937" }}>
                        Wybierz grupę:
                      </span>
                      <Select
                        value={selectedGroupForAttendance}
                        onChange={setSelectedGroupForAttendance}
                        style={{ width: 300 }}
                      >
                        {groups.map(group => (
                          <Select.Option key={group.id} value={group.id}>
                            {group.name} ({group.children?.length || 0} dzieci)
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  </Card>
                )}
                
                {selectedGroupForAttendance && (() => {
                  const selectedGroup = groups.find(g => g.id === selectedGroupForAttendance);
                  return selectedGroup ? (
                    <AttendanceView
                      groupId={selectedGroup.id}
                      groupName={selectedGroup.name}
                      children={selectedGroup.children || []}
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
                  label: "💬 Wiadomości",
                  children: <MessagesView />,
                },
                {
                  key: "announcements",
                  label: (
                    <Badge count={unviewedCount} offset={[10, 0]}>
                      📢 Ogłoszenia
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
