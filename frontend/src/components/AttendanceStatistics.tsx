import { useState, useEffect } from "react";
import { Card, Statistic, Row, Col, Table, message, Select, Space, Progress } from "antd";
import { CheckOutlined, CloseOutlined, MedicineBoxOutlined, TeamOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

import { API_URL } from "../config/api";

interface AttendanceStats {
  childId: string;
  childName: string;
  groupName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  sickDays: number;
  attendanceRate: number;
}

export default function AttendanceStatistics() {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);

  const [stats, setStats] = useState<AttendanceStats[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (children.length > 0) {
      fetchAttendanceData();
    }
  }, [children, period]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [groupsRes, childrenRes] = await Promise.all([
        axios.get(`${API_URL}/groups`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        axios.get(`${API_URL}/children`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);
      
      setGroups(groupsRes.data);
      setChildren(childrenRes.data);
    } catch (error: any) {
      message.error("Błąd pobierania danych");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const attendancePromises = children.map(child =>
        axios.get(`${API_URL}/attendance/${child.id}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }).catch(() => ({ data: [] }))
      );

      const results = await Promise.all(attendancePromises);
      const allAttendance = results.flatMap((res, index) => 
        res.data.map((record: any) => ({
          ...record,
          childId: children[index].id,
          childName: `${children[index].firstName} ${children[index].lastName}`,
          groupName: children[index].group?.name || "Brak grupy",
          groupId: children[index].group?.id,
        }))
      );

      calculateStats(allAttendance);
    } catch (error: any) {
      message.error("Błąd pobierania danych obecności");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    const now = dayjs();
    let startDate = dayjs();

    switch (period) {
      case "week":
        startDate = now.subtract(7, "day");
        break;
      case "month":
        startDate = now.subtract(30, "day");
        break;
      case "all":
        startDate = dayjs("2000-01-01");
        break;
    }

    const filteredData = data.filter(record => 
      dayjs(record.date).isAfter(startDate)
    );

    const childrenToAnalyze = selectedGroup
      ? children.filter(c => c.group?.id === selectedGroup)
      : children;

    const statsMap = childrenToAnalyze.map(child => {
      const childRecords = filteredData.filter(r => r.childId === child.id);
      const presentDays = childRecords.filter(r => r.status === "present").length;
      const absentDays = childRecords.filter(r => r.status === "absent").length;
      const sickDays = childRecords.filter(r => r.status === "sick").length;
      const totalDays = childRecords.length;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      return {
        childId: child.id,
        childName: `${child.firstName} ${child.lastName}`,
        groupName: child.group?.name || "Brak grupy",
        totalDays,
        presentDays,
        absentDays,
        sickDays,
        attendanceRate,
      };
    });

    setStats(statsMap);
  };

  const columns = [
    {
      title: "Dziecko",
      dataIndex: "childName",
      key: "childName",
      sorter: (a: AttendanceStats, b: AttendanceStats) => a.childName.localeCompare(b.childName),
    },
    {
      title: "Grupa",
      dataIndex: "groupName",
      key: "groupName",
      filters: [...new Set(stats.map(s => s.groupName))].map(name => ({
        text: name,
        value: name,
      })),
      onFilter: (value: any, record: AttendanceStats) => record.groupName === value,
    },
    {
      title: "Frekwencja",
      dataIndex: "attendanceRate",
      key: "attendanceRate",
      render: (rate: number) => (
        <Progress
          percent={parseFloat(rate.toFixed(1))}
          size="small"
          status={rate >= 80 ? "success" : rate >= 60 ? "normal" : "exception"}
        />
      ),
      sorter: (a: AttendanceStats, b: AttendanceStats) => a.attendanceRate - b.attendanceRate,
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Obecny",
      dataIndex: "presentDays",
      key: "presentDays",
      render: (days: number) => (
        <span style={{ color: "#52c41a", fontWeight: 500 }}>
          <CheckOutlined /> {days}
        </span>
      ),
      sorter: (a: AttendanceStats, b: AttendanceStats) => a.presentDays - b.presentDays,
    },
    {
      title: "Nieobecny",
      dataIndex: "absentDays",
      key: "absentDays",
      render: (days: number) => (
        <span style={{ color: "#999", fontWeight: 500 }}>
          <CloseOutlined /> {days}
        </span>
      ),
      sorter: (a: AttendanceStats, b: AttendanceStats) => a.absentDays - b.absentDays,
    },
    {
      title: "Chory",
      dataIndex: "sickDays",
      key: "sickDays",
      render: (days: number) => (
        <span style={{ color: "#faad14", fontWeight: 500 }}>
          <MedicineBoxOutlined /> {days}
        </span>
      ),
      sorter: (a: AttendanceStats, b: AttendanceStats) => a.sickDays - b.sickDays,
    },
    {
      title: "Razem dni",
      dataIndex: "totalDays",
      key: "totalDays",
      sorter: (a: AttendanceStats, b: AttendanceStats) => a.totalDays - b.totalDays,
    },
  ];

  const overallStats = {
    totalChildren: stats.length,
    avgAttendanceRate: stats.length > 0
      ? stats.reduce((sum, s) => sum + s.attendanceRate, 0) / stats.length
      : 0,
    totalPresent: stats.reduce((sum, s) => sum + s.presentDays, 0),
    totalAbsent: stats.reduce((sum, s) => sum + s.absentDays, 0),
    totalSick: stats.reduce((sum, s) => sum + s.sickDays, 0),
  };

  return (
    <div>
      <Card
        title="Statystyki obecności"
        extra={
          <Space>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 150 }}
            >
              <Select.Option value="week">Ostatni tydzień</Select.Option>
              <Select.Option value="month">Ostatni miesiąc</Select.Option>
              <Select.Option value="all">Cały czas</Select.Option>
            </Select>
            <Select
              value={selectedGroup}
              onChange={setSelectedGroup}
              style={{ width: 200 }}
              placeholder="Wszystkie grupy"
              allowClear
            >
              {groups.map(group => (
                <Select.Option key={group.id} value={group.id}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </Space>
        }
      >
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Dzieci"
                value={overallStats.totalChildren}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Średnia frekwencja"
                value={overallStats.avgAttendanceRate.toFixed(1)}
                suffix="%"
                valueStyle={{ color: overallStats.avgAttendanceRate >= 80 ? "#52c41a" : "#faad14" }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Obecni"
                value={overallStats.totalPresent}
                prefix={<CheckOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Nieobecni"
                value={overallStats.totalAbsent}
                prefix={<CloseOutlined />}
                valueStyle={{ color: "#999" }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Chorzy"
                value={overallStats.totalSick}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={stats}
          rowKey="childId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Łącznie ${total} dzieci`,
          }}
          locale={{ emptyText: "Brak danych" }}
        />
      </Card>
    </div>
  );
}
