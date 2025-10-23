import { api } from "../config/api";
import { getEmployeeCodeByEmail } from "./authService";
import { InformationUser, RoleUserMap } from "../types";
import { LeaveApplication, LeaveApprover, SaveLeaveApplicationPayload } from "../types/applicationLeave.types";
import { handleServiceError, handleServiceThrow } from "../utils/error/ErrorHandler";

// Interface cho kết quả trả về
interface ApplicationLeaveResult<T = any> {
  success: boolean;
  data?: T;
  error?: string; // Vietnamese error message
}

export async function getLeaveApprovers(): Promise<ApplicationLeaveResult<LeaveApprover[]>> {
  console.log('🔄 Calling getLeaveApprovers service');
  try {
    const employeeCode = await getEmployeeCodeByEmail();
    
    console.log('👤 Employee Code for leave approver request:', employeeCode);
    
    if (!employeeCode) {
      console.log('❌ No employee code found');
      handleServiceThrow(new Error('Không tìm thấy mã nhân viên'), 'Lỗi lấy mã nhân viên');
    }

    const payload = {
      employee: employeeCode
    };

    console.log('📤 Sending request with payload:', payload);
    const { data } = await api.post(
      "/api/method/hrms.hr.doctype.leave_application.leave_application.get_leave_approver", 
      payload
    );
    
    const approvers = data?.message || [];

    return { success: true, data: approvers };
  } catch (error) {
    return handleServiceError(error, 'Lỗi tải dữ liệu');
  }
}

/**
 * Lấy danh sách loại nghỉ phép
 */
export async function getLeaveTypes(): Promise<ApplicationLeaveResult<any[]>> {
  try {
    const { data } = await api.get("/api/resource/Leave Type");
    return { success: true, data: data?.data || [] };
  } catch (error) {
    return handleServiceError(error, 'Lỗi tải dữ liệu');
  }
}

/**
 * Lấy số dư nghỉ phép theo loại
 */
export async function getLeaveBalance(leaveType: string): Promise<ApplicationLeaveResult<any>> {
  try {
    const employeeCode = await getEmployeeCodeByEmail();
    
    if (!employeeCode) {
      handleServiceThrow(new Error('Không tìm thấy mã nhân viên'), 'Lỗi lấy mã nhân viên');
    }

    const { data } = await api.get("/api/method/hrms.hr.doctype.leave_application.leave_application.get_leave_balance_on", {
      params: {
        employee: employeeCode,
        date: new Date().toISOString().split('T')[0],
        leave_type: leaveType
      }
    });
    
    return { success: true, data: data?.message || {} };
  } catch (error) {
    return handleServiceError(error, 'Lỗi tải dữ liệu');
  }
}

/**
 * Tạo đơn xin nghỉ phép
 */
export async function createLeaveApplication(leaveData: LeaveApplication): Promise<ApplicationLeaveResult<any>> {
  try {
    const { data } = await api.post("/api/resource/Leave Application", leaveData);
    return { success: true, data: data || {} };
  } catch (error) {
    return handleServiceError(error, 'Lỗi tải dữ liệu');
  }
}

/**
 * Cập nhật đơn xin nghỉ phép
 */
export async function updateLeaveApplication(
  leaveId: string, 
  leaveData: Partial<LeaveApplication>
): Promise<ApplicationLeaveResult<any>> {
  try {
    const { data } = await api.put(`/api/resource/Leave Application/${leaveId}`, leaveData);
    return { success: true, data: data || {} };
  } catch (error) {
    return handleServiceError(error, 'Lỗi tải dữ liệu');
  }
}

/**
 * Hủy đơn xin nghỉ phép
 */
export async function cancelLeaveApplication(leaveId: string): Promise<ApplicationLeaveResult<any>> {
  try {
    const { data } = await api.put(`/api/resource/Leave Application/${leaveId}`, {
      status: "Cancelled"
    });
    return { success: true, data: data || {} };
  } catch (error) {
    return handleServiceError(error, 'Lỗi tải dữ liệu');
  }
}

/**
 * Lấy danh sách đơn nghỉ phép của nhân viên
 */
export async function getEmployeeLeaveApplications(): Promise<ApplicationLeaveResult<any[]>> {
  try {
    const employeeCode = await getEmployeeCodeByEmail();

    if (!employeeCode) {
      handleServiceThrow(new Error('Không tìm thấy mã nhân viên'), 'Lỗi lấy mã nhân viên');
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
    
    return { success: true, data: data?.data || [] };
  } catch (error) {
    return handleServiceError(error, 'Lỗi tải dữ liệu');
  }
}


export async function getInformationEmployeeApplicationLeave(codeName: string): Promise<InformationUser> {

  if (!codeName) {
    throw new Error("Mã nhân viên không được để trống");
  }
  const payload : RoleUserMap = {
    doctype: "Employee",
    docname: codeName,
    fields: [
      "employee_name",
      "company",
      "department",
    ]
  };
  try {
    const res = await api.post<{ message: InformationUser }>("/api/method/frappe.client.validate_link", payload);
    return res.data.message;
  } catch (error) {
    console.error("Error fetching employee info:", error);
    handleServiceThrow(error, 'Lỗi tải thông tin nhân viên');
  }
}


export async function getCodeNameEmployee1(email: string): Promise<string | null> {
    console.log('🔍 [getCodeNameEmployee] Starting function...');
    
    let loggedUser;
    try {
        console.log('✅ [getCodeNameEmployee] Got logged user:', loggedUser);
    } catch (error) {
        console.error('❌ [getCodeNameEmployee] Error getting logged user:', error);
        return null;
    }
    
    const filters = JSON.stringify([["user_id", "=", email]]);
    const fields = JSON.stringify([
        "name",
        "employee",
    ]);
    
    try {
        const res = await api.get("/", {
            params: {
                cmd: "frappe.www.list.get_list_data",
                doctype: "Employee", 
                limit_start: 0,
                limit: 20,
                filters,
                fields,
            }
        });
                
        const employees = res.data.message;
    
        if (Array.isArray(employees) && employees.length > 0) {
            console.log('✅ [getCodeNameEmployee] Found employee:', employees[0]);
            return employees[0].employee;
        } else {
            console.warn('⚠️  [getCodeNameEmployee] No employee found for user:', email);
            return null;
        }
    } catch (error: any) {
        console.error("❌ [getCodeNameEmployee] Error fetching employee:", error);
        if (error?.response) {
            console.error("📡 [getCodeNameEmployee] Response error:", error.response.data);
            console.error("📡 [getCodeNameEmployee] Status:", error.response.status);
        }
        throw error;
    }
}

/**
 * Lưu đơn xin nghỉ phép sử dụng API frappe.desk.form.save.savedocs
 * API này cho phép tạo mới hoặc cập nhật đơn xin nghỉ phép
 */
export async function saveLeaveApplication(payload: SaveLeaveApplicationPayload): Promise<any> {
    console.log('🔄 [saveLeaveApplication] Starting function');
    console.log('📥 [saveLeaveApplication] Input payload:', JSON.stringify(payload, null, 2));

    try {
        // Chuẩn bị dữ liệu để gửi đi dưới dạng FormData
        const formData = new FormData();
        formData.append('data', JSON.stringify(payload)); // Dữ liệu JSON đã được mã hóa
        formData.append('web_form', 'leave-application');
        formData.append('for_payment', 'false');
        formData.append('cmd', 'frappe.website.doctype.web_form.web_form.accept');

        console.log('  - data:', JSON.stringify(payload));
        
        // Gửi yêu cầu POST
        console.log('🚀 [saveLeaveApplication] Sending POST request to "/"');
        const res = await api.post("/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        console.log('✅ [saveLeaveApplication] Response status:', res.status);
        console.log('✅ [saveLeaveApplication] Response headers:', res.headers);
        console.log('✅ [saveLeaveApplication] Response data:', JSON.stringify(res.data, null, 2));
        return res.data || {};
    } catch (error: any) {
        console.error("❌ [saveLeaveApplication] Error occurred:");
        console.error("❌ [saveLeaveApplication] Error message:", error.message);
        console.error("❌ [saveLeaveApplication] Error stack:", error.stack);

        if (error.response) {
            console.error("❌ [saveLeaveApplication] Response status:", error.response.status);
            console.error("❌ [saveLeaveApplication] Response statusText:", error.response.statusText);
            console.error("❌ [saveLeaveApplication] Response headers:", error.response.headers);
            console.error("❌ [saveLeaveApplication] Response data:", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error("❌ [saveLeaveApplication] Request was made but no response:", error.request);
        } else {
            console.error("❌ [saveLeaveApplication] Error setting up request:", error.message);
        }

        handleServiceThrow(error, 'Lỗi lưu đơn xin nghỉ phép');
    }
}


export async function getLeaveApproversName(email: string): Promise<string | null> {
  if (!email) {
    throw new Error("Email is required");
  }
  try {
    const apiUrl = `/api/method/remak.utils.user.get_fullname_by_user?user=${email}`;
    const response = await api.get(apiUrl);    
    const { data } = response;
    const result = data?.message || data || '';    
    return result;
  } catch (error) {
    throw error;
  }
}
