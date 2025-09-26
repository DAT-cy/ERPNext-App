import { fetchCheckinRecords, submitCheckin } from "../services/checkinService";
import { useEffect, useState } from "react";
import { CheckinRecord, Checkin } from "../types/checkin.types";

export function useCheckin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Load dữ liệu
  const loadCheckinData = async () => {
    try {
      setLoading(true);
      console.log("[useCheckin] Đang tải dữ liệu chấm công...");
      const data = await fetchCheckinRecords();
      console.log("[useCheckin] Dữ liệu chấm công đã tải:", JSON.stringify(data, null, 2));
      setRecords(data);
      setError(null);
      return data; // Trả về data để có thể debug
    } catch (err) {
      setError("Không thể tải dữ liệu chấm công");
      console.error("[useCheckin] Lỗi khi tải dữ liệu chấm công:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckinData();
  }, []);

  // Lọc theo hôm nay
  const getTodayRecords = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return records.filter(record => record.time.startsWith(today));
  };

  // Lọc theo tuần này
  const getThisWeekRecords = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Lùi lại ngày đầu tuần (chủ nhật)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay())); // Tiến đến ngày cuối tuần (thứ 7)
    endOfWeek.setHours(23, 59, 59, 999);
    
    return records.filter(record => {
      const recordDate = new Date(record.time);
      return recordDate >= startOfWeek && recordDate <= endOfWeek;
    });
  };

  // Kiểm tra đã check in chưa
  const isCheckedIn = () => {
    const latestRecord = records[0]; // Giả sử records đã được sắp xếp theo thời gian mới nhất
    return latestRecord?.log_type === 'IN';
  };

  // Handle submit checkin với định dạng mới
  const handleSubmitCheckin = async (data: Checkin) => {
    setSubmitting(true);
    try {
      const response = await submitCheckin(data);
      setError(null);
      return response;
    } catch (err) {
      setError("Không thể gửi dữ liệu chấm công");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    records,
    loading,
    error,
    submitting,
    getTodayRecords,
    getThisWeekRecords,
    isCheckedIn,
    loadCheckinData,
    handleSubmitCheckin,
  };
}

