import { useState, useEffect } from "react";
import { Card, Table, Tag, DatePicker, Space, message, Empty } from "antd";
import { CheckOutlined, CloseOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
import { API_URL } from "../config/api";

interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "sick";
  notes?: string;
  created_at: string;
}

interface ChildAttendanceHistoryProps {
  childId: string;
  childName: string;
}

export default function ChildAttendanceHistory({ childId, childName }: ChildAttendanceHistoryProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);

  useEffect(() => {
    fetchAttendance();
  }, [childId]);

  useEffect(() => {
    filterAttendance();
  }, [attendance, dateRange]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/attendance/${childId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAttendance(res.data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Błąd pobierania danych obecności");
    } finally {
      setLoading(false);
    }
  };

  const filterAttendance = () => {
    if (!dateRange) {
      setFilteredAttendance(attendance);
      return;
    }

    const [start, end] = dateRange;
    const filtered = attendance.filter(record => {
      const recordDate = dayjs(record.date);
      return recordDate.isBetween(start, end, "day", "[]");
    });
    setFilteredAttendance(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "success";
      case "absent": return "default";
      case "sick": return "warning";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckOutlined />;
      case "absent": return <CloseOutlined />;
      case "sick": return <MedicineBoxOutlined />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "present": return "Obecny";
      case "absent": return "Nieobecny";
      case "sick": return "Chory";
      default: return status;
    }
  };

  const columns = [
    {
      title: "Data",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
      sorter: (a: AttendanceRecord, b: AttendanceRecord) => 
        dayjs(a.date).unix() - dayjs(b.date).unix(),
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: "Obecny", value: "present" },
        { text: "Nieobecny", value: "absent" },
        { text: "Chory", value: "sick" },
      ],
      onFilter: (value: any, record: AttendanceRecord) => record.status === value,
    },
    {
      title: "Notatki",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => notes || <span style={{ color: "#999" }}>Brak notatek</span>,
    },
  ];

  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(a => a.status === "present").length,
    absent: filteredAttendance.filter(a => a.status === "absent").length,
    sick: filteredAttendance.filter(a => a.status === "sick").length,
  };

  const attendanceRate = stats.total > 0 
    ? ((stats.present / stats.total) * 100).toFixed(1)
    : "0";

  return (
    <Card
      title={`Historia obecności - ${childName}`}
      extra={
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
            format="DD.MM.YYYY"
            placeholder={["Od", "Do"]}
          />
        </Space>
      }
    >
      <div style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
          <div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#52c41a" }}>
              {attendanceRate}%
            </div>
            <div style={{ fontSize: 14, color: "#999" }}>Frekwencja</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {stats.total}
            </div>
            <div style={{ fontSize: 14, color: "#999" }}>Dni razem</div>
          </div>
          <Tag color="success" icon={<CheckOutlined />} style={{ padding: "8px 12px", fontSize: 14 }}>
            Obecny: {stats.present}
          </Tag>
          <Tag color="default" icon={<CloseOutlined />} style={{ padding: "8px 12px", fontSize: 14 }}>
            Nieobecny: {stats.absent}
          </Tag>
          <Tag color="warning" icon={<MedicineBoxOutlined />} style={{ padding: "8px 12px", fontSize: 14 }}>
            Chory: {stats.sick}
          </Tag>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredAttendance}
        rowKey="id"
        loading={loading}
        locale={{ 
          emptyText: (
            <Empty
              description="Brak danych o obecności w wybranym okresie"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Łącznie ${total} rekordów`,
        }}
      />
    </Card>
  );
}
