import { useState } from "react";
import { Form, Input, DatePicker, Button, message } from "antd";
import axios from "axios";

const API_URL = "http://localhost:3000";

export default function ParentAddChildForm({
  onChildAdded,
}: {
  onChildAdded: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/children`,
        {
          firstName: values.firstName,
          lastName: values.lastName,
          birthDate: values.birthDate.format("YYYY-MM-DD"),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      message.success("Dodano dziecko!");
      onChildAdded();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd dodawania dziecka");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      style={{ marginBottom: 24, flexWrap: "wrap" }}
    >
      <Form.Item
        name="firstName"
        label="Imię"
        rules={[{ required: true, message: "Podaj imię" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="lastName"
        label="Nazwisko"
        rules={[{ required: true, message: "Podaj nazwisko" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="birthDate"
        label="Data urodzenia"
        rules={[{ required: true, message: "Podaj datę urodzenia" }]}
      >
        <DatePicker format="YYYY-MM-DD" />{" "}
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ marginTop: 16 }}
        >
          Dodaj dziecko
        </Button>
      </Form.Item>
    </Form>
  );
}
