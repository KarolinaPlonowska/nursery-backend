import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Select, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState } from "react";

const { Option } = Select;
const API_URL = "http://localhost:3000";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, values);
      message.success("Registration successful! You can now log in.");
      navigate("/login");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Register" style={{ maxWidth: "50%", margin: "auto" }}>
      <Form
        name="register"
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
          rules={[
            {
              required: true,
              type: "email",
              message: "Please input a valid email!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            {
              required: true,
              min: 6,
              message: "Password must be at least 6 characters!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Please select a role!" }]}
        >
          <Select placeholder="Select a role">
            <Option value="ADMIN">Admin</Option>
            <Option value="PARENT">Parent</Option>
            <Option value="CAREGIVER">Caregiver</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            icon={<UserOutlined />}
          >
            Register
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
