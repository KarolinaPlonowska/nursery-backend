import { useEffect, useState } from "react";
import { Card, Button, Table, message } from "antd";
import axios from "axios";

const API_URL = "http://localhost:3000";

export default function ParentDashboard({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div style={{ background: "#F9FAFB", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #E5E7EB"
          }}
          title={
            <span style={{ fontSize: 22, fontWeight: 700, color: "#1F2937" }}>📚 Panel rodzica</span>
          }
        >
          <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ color: "#6B7280", margin: 0 }}>Przeglądaj swoich dzieci i śledź ich aktywności</p>
            <Button 
              onClick={onLogout}
              style={{ background: "#EF4444", borderColor: "#EF4444", fontWeight: 600 }}
              type="primary"
            >
              Wyloguj
            </Button>
          </div>
        </Card>

        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #E5E7EB"
          }}
          title={<span style={{ fontSize: 18, fontWeight: 600, color: "#1F2937" }}>👶 Twoje dzieci</span>}
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
    </div>
  );
}
