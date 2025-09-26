export type CheckinRecord = {
    name: string;
    employee: string;
    employee_name: string; 
    log_type: string; 
    time: string;
    custom_status: string;
}

export type Checkin = {
  log_type: "IN" | "OUT";
  custom_checkin: string;
  latitude: number;
  longitude: number;
  custom_auto_load_location: number;
  doctype: string;
  web_form_name: string;
}

export type CheckinAPIRequest = {
  data: string; 
  web_form: string;
  for_payment: string;
  cmd: string;
}
