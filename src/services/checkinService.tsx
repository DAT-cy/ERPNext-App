import { api, SID_KEY } from "../config/api";
import { CheckinRecord, Checkin, CheckinAPIRequest } from "../types/checkin.types";
import { InformationUser, RoleUserMap } from "../types/auth.types";
import { getLoggedUser , getEmployeeCodeByEmail } from "./authService";




// // Hàm lấy mã nhân viên từ người dùng đã đăng nhập
// export async function getCodeNameEmployee(): Promise<string | null> {
//     console.log('🔍 [getCodeNameEmployee] Starting function...');
    
//     let loggedUser;
//     try {
//         loggedUser = await getLoggedUser();
//         console.log('✅ [getCodeNameEmployee] Got logged user:', loggedUser);
//     } catch (error) {
//         console.error('❌ [getCodeNameEmployee] Error getting logged user:', error);
//         return null;
//     }
    
//     const filters = JSON.stringify([["user_id", "=", loggedUser.message]]);
//     const fields = JSON.stringify([
//         "name",
//         "employee",
//     ]);
    
//     try {
//         const res = await api.get("/", {
//             params: {
//                 cmd: "frappe.www.list.get_list_data",
//                 doctype: "Employee", 
//                 limit_start: 0,
//                 limit: 20,
//                 filters,
//                 fields,
//             }
//         });
                
//         const employees = res.data.message;
    
//         if (Array.isArray(employees) && employees.length > 0) {
//             console.log('✅ [getCodeNameEmployee] Found employee:', employees[0]);
//             return employees[0].employee;
//         } else {
//             console.warn('⚠️  [getCodeNameEmployee] No employee found for user:', loggedUser.message);
//             return null;
//         }
//     } catch (error: any) {
//         console.error("❌ [getCodeNameEmployee] Error fetching employee:", error);
//         if (error?.response) {
//             console.error("📡 [getCodeNameEmployee] Response error:", error.response.data);
//             console.error("📡 [getCodeNameEmployee] Status:", error.response.status);
//         }
//         throw error;
//     }
// }



export async function fetchCheckinRecords(): Promise<CheckinRecord[]> {
    console.log('🔍 [fetchCheckinRecords] Starting function...');
    
    let loggedUser;
    try {
        console.log('🔄 [fetchCheckinRecords] Getting logged user...');
        loggedUser = await getLoggedUser();
        console.log('✅ [fetchCheckinRecords] Got logged user:', loggedUser.message);
    } catch (error: any) {
        console.error('❌ [fetchCheckinRecords] Error getting logged user:', {
            message: error?.message,
            code: error?.code,
            timeout: error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')
        });
        
        // Return empty array for timeout or network errors
        if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
            console.log('⏰ [fetchCheckinRecords] Request timeout - returning empty array');
        }
        return [];
    }
    
    const employeeCode = await getEmployeeCodeByEmail();
    if (!employeeCode) {
        console.log('⚠️ [fetchCheckinRecords] No employee code found');
        return [];
    }

    console.log('👤 [fetchCheckinRecords] Using employee code:', employeeCode);

    const filters = JSON.stringify([["employee", "=", employeeCode]]);
    const fields = JSON.stringify([
        "name",
        "employee_name",
        "checkin_time",
        "type",
        "location",
        "attendance_device_id",
    ]);
    
    try {
        console.log('🚀 [fetchCheckinRecords] Making API request...');
        
        const requestParams = {
            cmd: "frappe.www.list.get_list_data",
            doctype: "Employee Checkin",
            limit_start: 0,
            limit: 10,
            web_form_name: "checkin",
            filters,
            fields,
        };
        
        console.log('📤 [fetchCheckinRecords] Request params:', requestParams);
        
        const res = await api.get("/", {
            params: requestParams
        });
        
        console.log('📡 [fetchCheckinRecords] API response:', {
            status: res.status,
            dataExists: !!res.data,
            messageExists: !!(res.data && res.data.message),
            recordCount: res.data?.message?.length || 0
        });
        
        console.log('✅ [fetchCheckinRecords] Successfully fetched records');
        return res.data.message || [];
    } catch (error: any) {
        console.error('❌ [fetchCheckinRecords] Error details:', {
            message: error?.message,
            code: error?.code,
            status: error?.response?.status,
            timeout: error?.code === 'ECONNABORTED' || error?.message?.includes('timeout'),
            network: !error?.response
        });
        
        // Specific handling for timeout errors
        if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
            console.error('⏰ [fetchCheckinRecords] Request timeout exceeded - returning empty array');
            return [];
        }
        
        // For other errors, still return empty array instead of throwing
        console.warn('🔄 [fetchCheckinRecords] Returning empty array due to error');
        return [];
    }
}
export async function getInformationEmployee(): Promise<InformationUser> {
  const getEmployeeCodeByEmailValue = await getEmployeeCodeByEmail();

  // Kiểm tra current user để xử lý trường hợp đặc biệt
  const loggedUser = await getLoggedUser();
  const currentUser = loggedUser.message;
  
  if (!getEmployeeCodeByEmailValue) {
    if (currentUser === 'Administrator' || currentUser === 'administrator' || currentUser.includes('administrator')) {
      console.log('👑 [getInformationEmployee] Administrator detected, returning default info');
      return {
        name: 'Administrator',
        employee_name: 'Administrator',
        company: 'REMAK',
        department: ''
      };
    }
    console.error('❌ [getInformationEmployee] No employee code found for user:', currentUser);
    throw new Error("Không thể lấy mã nhân viên từ người dùng đã đăng nhập");
  }
  
  const payload : RoleUserMap = {
    doctype: "Employee",
    docname: getEmployeeCodeByEmailValue,
    fields: [
      "employee_name",
      "company",
      "department",
    ]
  };
  
  console.log('📦 [getInformationEmployee] API payload:', payload);
  
  try {
    const res = await api.post<{ message: InformationUser }>("/api/method/frappe.client.validate_link", payload);
    console.log('✅ [getInformationEmployee] API response:', res.data);
    console.log('👨‍💼 [getInformationEmployee] Employee info:', {
      name: res.data.message.name,
      employee_name: res.data.message.employee_name,
      company: res.data.message.company
    });
    return res.data.message;
  } catch (error: any) {
    console.error("❌ [getInformationEmployee] Error fetching employee info:", error);
    
    // Nếu là Administrator và gặp lỗi, trả về thông tin mặc định
    if (currentUser === 'Administrator' || currentUser === 'administrator@example.com' || currentUser.includes('administrator')) {
      console.log('👑 [getInformationEmployee] API failed for Administrator, returning fallback info');
      return {
        name: getEmployeeCodeByEmailValue,
        employee_name: 'System Administrator',
        company: 'System',
        department: 'Administration'
      };
    }
    
    if (error?.response) {
      console.error("📡 [getInformationEmployee] Response error:", error.response.data);
      console.error("📡 [getInformationEmployee] Status:", error.response.status);
    }
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
