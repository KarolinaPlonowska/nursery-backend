import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, message } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import axios from "axios";

const API_URL = "http://localhost:3000";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, values);
      localStorage.setItem("token", res.data.access_token);
      const payload = JSON.parse(atob(res.data.access_token.split(".")[1]));
      if (payload.role === "ADMIN") navigate("/admin");
      else if (payload.role === "PARENT") navigate("/parent");
      else if (payload.role === "CAREGIVER") navigate("/caregiver");
      else navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
      message.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Login" style={{ maxWidth: "50%", margin: "auto" }}>
      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        onFinishFailed={() =>
          message.error("Please fill in all required fields.")
        }
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            icon={<LoginOutlined />}
          >
            Login
          </Button>
        </Form.Item>
      </Form>
      {error && (
        <div style={{ color: "red", marginTop: 16, textAlign: "center" }}>
          {error}
        </div>
      )}
    </Card>
  );
}
