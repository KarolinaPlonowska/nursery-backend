import { useState, useEffect } from "react";
import { Card, List, Input, Button, Avatar, Empty, Spin, App } from "antd";
import { MessageOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { getUser } from "../utils/auth";
import { useTheme } from "../hooks/useTheme";

const API_URL = "http://localhost:3000";

interface Conversation {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: { firstName: string; lastName: string };
}

export default function MessagesView() {
  const currentUser = getUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { message } = App.useApp();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/messages/conversations`, {
        withCredentials: true,
      });
      setConversations(res.data);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd pobierania konwersacji");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const res = await axios.get(`${API_URL}/messages/conversation/${userId}`, {
        withCredentials: true,
      });
      setMessages(res.data);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd pobierania wiadomości");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return;

    setSending(true);
    try {
      await axios.post(
        `${API_URL}/messages`,
        { receiverId: selectedUserId, content: newMessage },
        { withCredentials: true }
      );
      setNewMessage("");
      fetchMessages(selectedUserId);
      fetchConversations();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd wysyłania wiadomości");
    } finally {
      setSending(false);
    }
  };

  const selectedConversation = conversations.find(c => c.userId === selectedUserId);

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 200px)" }}>
      {/* Lista konwersacji */}
      <Card
        style={{
          width: 350,
          borderRadius: 12,
          border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
          background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined
        }}
        title={<span style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#FBBF24" : "#7C3AED" }}>💬 Konwersacje</span>}
      >
        {loading ? (
          <Spin />
        ) : conversations.length === 0 ? (
          <Empty description="Brak konwersacji" />
        ) : (
          <List
            dataSource={conversations}
            renderItem={(conv) => (
              <List.Item
                onClick={() => setSelectedUserId(conv.userId)}
                style={{
                  cursor: "pointer",
                  background: selectedUserId === conv.userId ? (isDark ? "#2a1f3d" : "#F3F4F6") : undefined,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} style={{ background: "#FBBF24" }} />}
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: isDark ? "#fff" : "#000" }}>
                        {conv.firstName} {conv.lastName}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span style={{
                          background: "#EF4444",
                          color: "#fff",
                          borderRadius: 12,
                          padding: "2px 8px",
                          fontSize: 12,
                        }}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  }
                  description={
                    <span style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}>
                      {conv.lastMessage?.substring(0, 40)}...
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Okno czatu */}
      <Card
        style={{
          flex: 1,
          borderRadius: 12,
          border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
          background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined,
          display: "flex",
          flexDirection: "column",
        }}
        title={
          selectedConversation ? (
            <span style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#FBBF24" : "#7C3AED" }}>
              {selectedConversation.firstName} {selectedConversation.lastName}
              <span style={{ fontSize: 12, color: isDark ? "#9CA3AF" : "#6B7280", marginLeft: 8 }}>
                ({selectedConversation.role === 'PARENT' ? 'Rodzic' : selectedConversation.role === 'CAREGIVER' ? 'Opiekun' : 'Administrator'})
              </span>
            </span>
          ) : (
            <span style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#FBBF24" : "#7C3AED" }}>Wybierz konwersację</span>
          )
        }
      >
        {selectedUserId ? (
          <>
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 16, maxHeight: "calc(100vh - 400px)" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: msg.senderId === currentUser?.id ? "flex-end" : "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: 12,
                      borderRadius: 12,
                      background: msg.senderId === currentUser?.id
                        ? "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)"
                        : isDark ? "#2a1f3d" : "#F3F4F6",
                      color: msg.senderId === currentUser?.id ? "#fff" : isDark ? "#fff" : "#000",
                    }}
                  >
                    <div>{msg.content}</div>
                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>
                      {new Date(msg.createdAt).toLocaleString("pl-PL")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Input.TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Wpisz wiadomość..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                loading={sending}
                style={{
                  background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
                  border: "none",
                  height: "auto",
                }}
              >
                Wyślij
              </Button>
            </div>
          </>
        ) : (
          <Empty description="Wybierz konwersację aby rozpocząć czat" />
        )}
      </Card>
    </div>
  );
}
