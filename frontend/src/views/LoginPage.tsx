import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, message } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import axios from "axios";

const API_URL = "http://localhost:3000";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, values);
      localStorage.setItem("token", res.data.access_token);
      const payload = JSON.parse(atob(res.data.access_token.split(".")[1]));
      if (payload.role === "ADMIN") navigate("/admin");
      else if (payload.role === "PARENT") navigate("/parent");
      else if (payload.role === "CAREGIVER") navigate("/caregiver");
      else navigate("/");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Login" style={{ maxWidth: 400, margin: "auto" }}>
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
    </Card>
  );
}
