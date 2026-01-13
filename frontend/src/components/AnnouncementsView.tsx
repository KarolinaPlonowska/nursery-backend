import { useState, useEffect } from "react";
import { Card, List, Button, Modal, Form, Input, Select, Empty, Spin, App, Tag } from "antd";
import { PlusOutlined, DeleteOutlined, SoundOutlined } from "@ant-design/icons";
import axios from "axios";
import { getUser } from "../utils/auth";
import { useTheme } from "../hooks/useTheme";

const API_URL = "http://localhost:3000";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; role: string };
  group?: { name: string };
}

interface Group {
  id: string;
  name: string;
}

interface AnnouncementsViewProps {
  onAnnouncementsViewed?: () => void;
}

export default function AnnouncementsView({ onAnnouncementsViewed }: AnnouncementsViewProps = {}) {
  const currentUser = getUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { message } = App.useApp();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [creating, setCreating] = useState(false);

  const canCreate = currentUser?.role === 'ADMIN' || currentUser?.role === 'CAREGIVER';

  useEffect(() => {
    fetchAnnouncements();
    if (canCreate) {
      fetchGroups();
    }
  }, []);

  const markAllAsViewed = async () => {
    if (announcements.length === 0) {
      message.info("Brak ogłoszeń do oznaczenia");
      return;
    }
    
    try {
      // Oznacz każde ogłoszenie jako przeczytane
      const promises = announcements.map(ann =>
        axios.patch(
          `${API_URL}/announcements/${ann.id}/view`,
          {},
          { withCredentials: true }
        )
      );
      
      await Promise.all(promises);
      message.success("Wszystkie ogłoszenia oznaczone jako przeczytane");
      
      // Dodaj krótkie opóźnienie aby backend zdążył przetworzyć zmiany
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Odśwież licznik w dashboardzie po wszystkich operacjach
      if (onAnnouncementsViewed) {
        onAnnouncementsViewed();
      }
    } catch (err) {
      console.error('Failed to mark announcements as viewed:', err);
      message.error("Błąd podczas oznaczania ogłoszeń");
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/announcements`, {
        withCredentials: true,
      });
      setAnnouncements(res.data);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd pobierania ogłoszeń");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_URL}/groups`, {
        withCredentials: true,
      });
      setGroups(res.data);
    } catch (err: any) {
      console.error("Błąd pobierania grup:", err);
    }
  };

  const createAnnouncement = async (values: any) => {
    setCreating(true);
    try {
      await axios.post(
        `${API_URL}/announcements`,
        values,
        { withCredentials: true }
      );
      message.success("Ogłoszenie dodane!");
      setModalVisible(false);
      form.resetFields();
      fetchAnnouncements();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd tworzenia ogłoszenia");
    } finally {
      setCreating(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/announcements/${id}`, {
        withCredentials: true,
      });
      message.success("Ogłoszenie usunięte");
      fetchAnnouncements();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd usuwania ogłoszenia");
    }
  };

  const priorityColors = {
    LOW: { color: "#10B981", label: "Niski" },
    NORMAL: { color: "#3B82F6", label: "Normalny" },
    HIGH: { color: "#F59E0B", label: "Wysoki" },
    URGENT: { color: "#EF4444", label: "Pilne" },
  };

  return (
    <div>
      <Card
        style={{
          borderRadius: 12,
          border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
          background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined
        }}
        title={
          <span style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#FBBF24" : "#7C3AED" }}>
            <SoundOutlined style={{ marginRight: 8 }} /> Ogłoszenia
          </span>
        }
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            {announcements.length > 0 && (
              <Button
                type="default"
                onClick={markAllAsViewed}
                style={{
                  background: isDark ? "#2a1f3d" : "#F3F4F6",
                  border: isDark ? "1px solid #4a3a5a" : "1px solid #D1D5DB",
                  color: isDark ? "#FBBF24" : "#7C3AED",
                }}
              >
                ✓ Oznacz wszystkie jako przeczytane
              </Button>
            )}
            {canCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                style={{
                  background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
                  border: "none",
                }}
              >
                Dodaj ogłoszenie
              </Button>
            )}
          </div>
        }
      >
        {loading ? (
          <Spin />
        ) : announcements.length === 0 ? (
          <Empty description="Brak ogłoszeń" />
        ) : (
          <List
            dataSource={announcements}
            renderItem={(ann) => (
                <List.Item
                  actions={
                    (currentUser?.role === 'ADMIN' || (currentUser?.id === ann.author.id && currentUser?.role !== 'PARENT')) ? [
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteAnnouncement(ann.id)}
                      >
                      Usuń
                    </Button>
                  ] : undefined
                }
                style={{
                  background: isDark ? "#2a1f3d" : "#F9FAFB",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
                }}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: isDark ? "#fff" : "#000" }}>
                        {ann.title}
                      </span>
                      <Tag color={priorityColors[ann.priority].color}>
                        {priorityColors[ann.priority].label}
                      </Tag>
                      {ann.group && (
                        <Tag color="purple">{ann.group.name}</Tag>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <p style={{ color: isDark ? "#D1D5DB" : "#374151", marginBottom: 8 }}>
                        {ann.content}
                      </p>
                      <div style={{ fontSize: 12, color: isDark ? "#9CA3AF" : "#6B7280" }}>
                        <span>
                          Autor: {ann.author.firstName} {ann.author.lastName} ({ann.author.role === 'ADMIN' ? 'Administrator' : 'Opiekun'})
                        </span>
                        <span style={{ marginLeft: 16 }}>
                          {new Date(ann.createdAt).toLocaleString("pl-PL")}
                        </span>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title="Nowe ogłoszenie"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={createAnnouncement}>
          <Form.Item
            name="title"
            label="Tytuł"
            rules={[{ required: true, message: "Podaj tytuł" }]}
          >
            <Input placeholder="Tytuł ogłoszenia" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Treść"
            rules={[{ required: true, message: "Podaj treść" }]}
          >
            <Input.TextArea rows={4} placeholder="Treść ogłoszenia" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priorytet"
            initialValue="NORMAL"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="LOW">Niski</Select.Option>
              <Select.Option value="NORMAL">Normalny</Select.Option>
              <Select.Option value="HIGH">Wysoki</Select.Option>
              <Select.Option value="URGENT">Pilne</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="groupId"
            label="Grupa (opcjonalnie)"
            tooltip="Pozostaw puste aby ogłoszenie było widoczne dla wszystkich"
          >
            <Select allowClear placeholder="Wybierz grupę lub pozostaw puste">
              {groups.map(g => (
                <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating} block>
              Dodaj ogłoszenie
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
