import { useEffect, useState } from "react";
import { Card, Button, Table, message, Collapse } from "antd";
import axios from "axios";

const { Panel } = Collapse;
const API_URL = "http://localhost:3000";

export default function CaregiverDashboard({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div style={{ background: "#F9FAFB", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #E5E7EB"
          }}
          title={
            <span style={{ fontSize: 22, fontWeight: 700, color: "#1F2937" }}>👥 Panel opiekuna</span>
          }
        >
          <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ color: "#6B7280", margin: 0 }}>Zarządzaj dziećmi przypisanymi do Twoich grup</p>
            <Button 
              onClick={onLogout}
              style={{ background: "#EF4444", borderColor: "#EF4444", fontWeight: 600 }}
              type="primary"
            >
              Wyloguj
            </Button>
          </div>
        </Card>

        {loading ? (
          <Card loading />
        ) : groups.length === 0 ? (
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid #E5E7EB"
            }}
          >
            <p style={{ textAlign: "center", color: "#6B7280", fontSize: 16 }}>
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
                    <span style={{ fontSize: 18, fontWeight: 600, color: "#1F2937" }}>
                      👶 Grupa: {group.name}
                    </span>
                    <span style={{ fontSize: 14, color: "#6B7280" }}>
                      Dzieci: {group.children?.length || 0}
                    </span>
                  </div>
                }
                key={group.id}
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #E5E7EB",
                  background: "white"
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
    </div>
  );
}
