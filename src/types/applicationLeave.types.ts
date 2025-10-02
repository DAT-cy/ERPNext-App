// Application Leave Types

export interface SaveLeaveApplicationPayload {
  employee: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  half_day: number; // 0 = cả ngày, 1 = nửa ngày
  half_day_date: string;
  description: string;
  doctype: string;
  web_form_name: string;
}

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