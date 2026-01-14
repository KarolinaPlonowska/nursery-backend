import { useState, useEffect } from "react";
import { Card, Table, Button, Select, message, DatePicker, Space, Tag, Modal, Input } from "antd";
import { CheckOutlined, CloseOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";

const { TextArea } = Input;
const { Option } = Select;
import { API_URL } from "../config/api";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}

interface AttendanceRecord {
  id?: string;
  childId: string;
  date: string;
  status: "present" | "absent" | "sick";
  notes?: string;
}

interface AttendanceViewProps {
  groupId: string;
  groupName: string;
  children: Child[];
}

export default function AttendanceView({ groupName, children }: AttendanceViewProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notesModal, setNotesModal] = useState<{ visible: boolean; childId: string; childName: string; notes: string } | null>(null);

  useEffect(() => {
    fetchAttendanceForDate(selectedDate);
  }, [selectedDate, children]);

  const fetchAttendanceForDate = async (date: Dayjs) => {
    setLoading(true);
    try {
      const dateStr = date.format("YYYY-MM-DD");
      const attendancePromises = children.map(child =>
        axios.get(`${API_URL}/attendance/${child.id}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).catch(() => ({ data: [] }))
      );

      const results = await Promise.all(attendancePromises);
      
      const newAttendanceData: Record<string, AttendanceRecord> = {};
      
      children.forEach((child, index) => {
        const childAttendance = results[index].data;
        const todayRecord = childAttendance.find((record: any) => record.date === dateStr);
        
        if (todayRecord) {
          newAttendanceData[child.id] = {
            id: todayRecord.id,
            childId: child.id,
            date: dateStr,
            status: todayRecord.status,
            notes: todayRecord.notes || "",
          };
        } else {
          // Domyślnie ustawiamy jako nieobecny
          newAttendanceData[child.id] = {
            childId: child.id,
            date: dateStr,
            status: "absent",
            notes: "",
          };
        }
      });

      setAttendanceData(newAttendanceData);
    } catch (error: any) {
      message.error("Błąd pobierania danych obecności");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (childId: string, status: "present" | "absent" | "sick") => {
    setAttendanceData(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        status,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const savePromises = Object.values(attendanceData).map(async (record) => {
        if (record.id) {
          // Update existing
          return axios.put(`${API_URL}/attendance/${record.id}`, {
            status: record.status,
          }, {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
        } else {
          // Create new
          return axios.post(`${API_URL}/attendance`, {
            childId: record.childId,
            date: record.date,
            status: record.status,
            notes: record.notes,
          }, {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
        }
      });

      await Promise.all(savePromises);
      message.success("Obecność została zapisana");
      
      // Refresh data to get IDs
      await fetchAttendanceForDate(selectedDate);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Błąd zapisywania obecności");
    } finally {
      setSaving(false);
    }
  };

  const openNotesModal = (childId: string, childName: string) => {
    const currentNotes = attendanceData[childId]?.notes || "";
    setNotesModal({
      visible: true,
      childId,
      childName,
      notes: currentNotes,
    });
  };

  const handleSaveNotes = async () => {
    if (!notesModal) return;

    const { childId, notes } = notesModal;
    
    setAttendanceData(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        notes,
      },
    }));

    const record = attendanceData[childId];
    
    if (record.id) {
      try {
        await axios.post(`${API_URL}/attendance`, {
          childId: record.childId,
          date: record.date,
          status: record.status,
          notes,
        }, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        message.success("Notatka zapisana");
      } catch (error) {
        message.error("Błąd zapisywania notatki");
      }
    }

    setNotesModal(null);
  };



  const columns = [
    {
      title: "Dziecko",
      key: "child",
      render: (_: any, record: Child) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.firstName} {record.lastName}</div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Wiek: {dayjs().diff(dayjs(record.birthDate), "year")} lat
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: Child) => {
        const attendance = attendanceData[record.id];
        return (
          <Select
            value={attendance?.status || "absent"}
            onChange={(value) => handleStatusChange(record.id, value)}
            style={{ width: 150 }}
          >
            <Option value="present">
              <Space>
                <CheckOutlined style={{ color: "#52c41a" }} />
                Obecny
              </Space>
            </Option>
            <Option value="absent">
              <Space>
                <CloseOutlined style={{ color: "#999" }} />
                Nieobecny
              </Space>
            </Option>
            <Option value="sick">
              <Space>
                <MedicineBoxOutlined style={{ color: "#faad14" }} />
                Chory
              </Space>
            </Option>
          </Select>
        );
      },
    },
    {
      title: "Notatki",
      key: "notes",
      render: (_: any, record: Child) => {
        const attendance = attendanceData[record.id];
        const hasNotes = attendance?.notes && attendance.notes.length > 0;
        
        return (
          <Button
            size="small"
            type={hasNotes ? "primary" : "default"}
            onClick={() => openNotesModal(record.id, `${record.firstName} ${record.lastName}`)}
          >
            {hasNotes ? "Edytuj notatki" : "Dodaj notatki"}
          </Button>
        );
      },
    },
  ];

  const stats = {
    present: Object.values(attendanceData).filter(a => a.status === "present").length,
    absent: Object.values(attendanceData).filter(a => a.status === "absent").length,
    sick: Object.values(attendanceData).filter(a => a.status === "sick").length,
  };

  return (
    <div>
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Lista obecności - {groupName}</span>
            <Space size="large">
              <DatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                format="DD.MM.YYYY"
                placeholder="Wybierz datę"
              />
              <Button
                type="primary"
                onClick={handleSaveAttendance}
                loading={saving}
                disabled={children.length === 0}
              >
                Zapisz obecność
              </Button>
            </Space>
          </div>
        }
      >
        <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
          <Tag color="success" icon={<CheckOutlined />}>
            Obecni: {stats.present}
          </Tag>
          <Tag color="default" icon={<CloseOutlined />}>
            Nieobecni: {stats.absent}
          </Tag>
          <Tag color="warning" icon={<MedicineBoxOutlined />}>
            Chorzy: {stats.sick}
          </Tag>
        </div>

        <Table
          columns={columns}
          dataSource={children}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: "Brak dzieci w grupie" }}
        />
      </Card>

      <Modal
        title={`Notatki - ${notesModal?.childName}`}
        open={notesModal?.visible}
        onOk={handleSaveNotes}
        onCancel={() => setNotesModal(null)}
        okText="Zapisz"
        cancelText="Anuluj"
      >
        <TextArea
          rows={4}
          value={notesModal?.notes}
          onChange={(e) => setNotesModal(prev => prev ? { ...prev, notes: e.target.value } : null)}
          placeholder="Wpisz notatki dotyczące dziecka..."
        />
      </Modal>
    </div>
  );
}
