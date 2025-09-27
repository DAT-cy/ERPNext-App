import { api, SID_KEY } from "../config/api";
import { CheckinRecord, Checkin, CheckinAPIRequest } from "../types/checkin.types";
import * as SecureStore from "expo-secure-store";
import { getLoggedUser } from "./authService";



// Hàm lấy mã nhân viên từ người dùng đã đăng nhập
export async function getCodeNameEmployee(): Promise<string | null> {
    const filters = JSON.stringify([["user_id", "=", getLoggedUser()]]);
    const fields = JSON.stringify([
    "name",
    "employee",
  ]);
    try {
        const res = await api.get("/", {
            params: {
                filters,
                fields,
            }
        });
        const employees = res.data.message;
        if (Array.isArray(employees) && employees.length > 0) {
            return employees[0].employee;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching employee:", error);
        throw error;
    }
}

export async function fetchCheckinRecords(): Promise<CheckinRecord[]> {

    const filters = JSON.stringify([["employee", "=", getLoggedUser()]]);
    const fields = JSON.stringify([
    "name",
    "employee_name",
    "checkin_time",
    "type",
    "location",
    "attendance_device_id",
  ]);
  try {
    const res = await api.get("/", {
      params: {
        cmd: "frappe.www.list.get_list_data",
        doctype: "Employee Checkin",
        limit_start: 0,
        limit : 20,
        web_form_name: "checkin",
        filters,
        fields,
      },
    });
    // API trả về { message: [...] }
    return res.data.message;
  } catch (error) {
    console.error("Error fetching checkins:", error);
    throw error;
  }
}

export async function submitCheckin(data: Checkin): Promise<any> {
  try {
    // Tạo FormData thay vì JSON để tránh lỗi 417
    const formData = new FormData();
    
    // Tạo data object
    const checkinData = {
      log_type: data.log_type,
      custom_checkin: data.custom_checkin,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude), 
      custom_auto_load_location: 1,
      doctype: "Employee Checkin",
      web_form_name: "checkin"
    };
  
    formData.append('data', JSON.stringify(checkinData));
    formData.append('web_form', 'checkin');
    formData.append('for_payment', 'false');
    formData.append('cmd', 'frappe.website.doctype.web_form.web_form.accept');
    const res = await api.post("/", formData)
    
    return res.data;
    
  } catch (error: any) {

    throw error;
  }
}
