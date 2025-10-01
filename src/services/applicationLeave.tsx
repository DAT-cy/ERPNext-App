import { api, SID_KEY } from "../config/api";
import * as SecureStore from "expo-secure-store";
import { getCodeNameEmployee } from "./checkinService";
import { 
  ApplicationLeaveErrorHandler, 
  ApplicationLeaveResult,
  ApplicationLeaveErrorCode 
} from "../utils/error/applicationLeave";

// Types cho Leave Application
export interface LeaveApprover {
  name: string;
  employee_name: string;
  employee: string;
}

export interface LeaveApplication {
  employee: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_leave_days: number;
  description?: string;
  leave_approver?: string;
}

/**
 * Lấy danh sách người phê duyệt nghỉ phép
 */
export async function getLeaveApprovers(): Promise<ApplicationLeaveResult<LeaveApprover[]>> {
  return ApplicationLeaveErrorHandler.withErrorHandling(async () => {
    const employeeCode = await getCodeNameEmployee();
    
    if (!employeeCode) {
      throw ApplicationLeaveErrorHandler.createEmployeeNotFoundError();
    }

    const payload = {
      employee: employeeCode
    };

    const { data } = await api.post(
      "/api/method/hrms.hr.doctype.leave_application.leave_application.get_leave_approver", 
      payload
    );
    
    return data?.message || [];
  }, 'Get Leave Approvers');
}

/**
 * Lấy danh sách loại nghỉ phép
 */
export async function getLeaveTypes(): Promise<ApplicationLeaveResult<any[]>> {
  return ApplicationLeaveErrorHandler.withErrorHandling(async () => {
    const { data } = await api.get("/api/resource/Leave Type");
    return data?.data || [];
  }, 'Get Leave Types');
}

/**
 * Lấy số dư nghỉ phép theo loại
 */
export async function getLeaveBalance(leaveType: string): Promise<ApplicationLeaveResult<any>> {
  return ApplicationLeaveErrorHandler.withErrorHandling(async () => {
    const employeeCode = await getCodeNameEmployee();
    
    if (!employeeCode) {
      throw ApplicationLeaveErrorHandler.createEmployeeNotFoundError();
    }

    const { data } = await api.get("/api/method/hrms.hr.doctype.leave_application.leave_application.get_leave_balance_on", {
      params: {
        employee: employeeCode,
        date: new Date().toISOString().split('T')[0],
        leave_type: leaveType
      }
    });
    
    return data?.message || {};
  }, 'Get Leave Balance');
}

/**
 * Tạo đơn xin nghỉ phép
 */
export async function createLeaveApplication(leaveData: LeaveApplication): Promise<ApplicationLeaveResult<any>> {
  return ApplicationLeaveErrorHandler.withErrorHandling(async () => {
    const { data } = await api.post("/api/resource/Leave Application", leaveData);
    return data || {};
  }, 'Create Leave Application');
}

/**
 * Cập nhật đơn xin nghỉ phép
 */
export async function updateLeaveApplication(
  leaveId: string, 
  leaveData: Partial<LeaveApplication>
): Promise<ApplicationLeaveResult<any>> {
  return ApplicationLeaveErrorHandler.withErrorHandling(async () => {
    const { data } = await api.put(`/api/resource/Leave Application/${leaveId}`, leaveData);
    return data || {};
  }, 'Update Leave Application');
}

/**
 * Hủy đơn xin nghỉ phép
 */
export async function cancelLeaveApplication(leaveId: string): Promise<ApplicationLeaveResult<any>> {
  return ApplicationLeaveErrorHandler.withErrorHandling(async () => {
    const { data } = await api.put(`/api/resource/Leave Application/${leaveId}`, {
      status: "Cancelled"
    });
    return data || {};
  }, 'Cancel Leave Application');
}

/**
 * Lấy danh sách đơn nghỉ phép của nhân viên
 */
export async function getEmployeeLeaveApplications(): Promise<ApplicationLeaveResult<any[]>> {
  return ApplicationLeaveErrorHandler.withErrorHandling(async () => {
    const employeeCode = await getCodeNameEmployee();
    
    if (!employeeCode) {
      throw ApplicationLeaveErrorHandler.createEmployeeNotFoundError();
    }

    const { data } = await api.get(`/api/resource/Leave Application`, {
      params: {
        filters: JSON.stringify([["employee", "=", employeeCode]]),
        fields: JSON.stringify([
          "name", "employee", "employee_name", "leave_type", 
          "from_date", "to_date", "total_leave_days", "status", 
          "description", "leave_approver"
        ]),
        order_by: "creation desc"
      }
    });
    
    return data?.data || [];
  }, 'Get Employee Leave Applications');
}
