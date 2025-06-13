import { useEffect, useState } from "react";
import { Card, Button, Table, message } from "antd";
import axios from "axios";
import { getUser } from "../utils/auth";

const API_URL = "http://localhost:3000";

export default function CaregiverDashboard({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/children`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        // Filtrowanie dzieci do grupy opiekuna
        const user = getUser();
        const filtered = res.data.filter(
          (child: any) => child.group && user && child.group.id === user.groupId
        );
        setChildren(filtered);
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Błąd pobierania dzieci");
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  return (
    <Card
      title="Panel opiekuna"
      extra={<Button onClick={onLogout}>Wyloguj</Button>}
      style={{ maxWidth: 900, margin: "auto" }}
    >
      <h3>Dzieci przypisane do Twojej grupy</h3>
      <Table
        dataSource={children}
        rowKey="id"
        loading={loading}
        pagination={false}
        columns={[
          { title: "Imię", dataIndex: "firstName" },
          { title: "Nazwisko", dataIndex: "lastName" },
          {
            title: "Data urodzenia",
            dataIndex: "birthDate",
            render: (date) => date && date.slice(0, 10),
          },
          {
            title: "Grupa",
            dataIndex: ["group", "name"],
            render: (_: any, record: any) => record.group?.name || "-",
          },
        ]}
      />
    </Card>
  );
}
