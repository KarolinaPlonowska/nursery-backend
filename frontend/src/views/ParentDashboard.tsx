import { useEffect, useState } from "react";
import { Card, Button, Table, message } from "antd";
import ParentAddChildForm from "./ParentAddChildForm";
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
      const res = await axios.get(`${API_URL}/children`, {
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
    <Card
      title="Panel rodzica"
      extra={<Button onClick={onLogout}>Wyloguj</Button>}
      style={{ maxWidth: 900, margin: "auto" }}
    >
      <h3>Dodaj dziecko</h3>
      <ParentAddChildForm onChildAdded={fetchChildren} />
      <h3>Twoje dzieci</h3>
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
        ]}
      />
    </Card>
  );
}
