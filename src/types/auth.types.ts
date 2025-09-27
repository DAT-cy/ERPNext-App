// src/features/auth/model/auth.types.ts
export type LoggedUser = { message: string }; // ERPNext: { message: "<username>" }
export type UserSettings = {
  message: string[];
};


export type LoginFailCode =
  | "INVALID_CREDENTIALS"
  | "NETWORK_TIMEOUT"
  | "FORBIDDEN"
  | "SESSION_EXPIRED"
  | "UNKNOWN";

export type LoginOk = {
  ok: true;
  sid?: string;    
  data: any;        
  me?: LoggedUser;  
  settings?: UserSettings;
};

export type LoginFail = {
  ok: false;
  error: LoginFailCode;
  status?: number;
  raw?: any;
};

export type LoginResult = LoginOk | LoginFail;

export type LoginPayload = {
  usr: string;
  pwd: string;
};

export type RoleUsers = {
  message: string[];
};
export type RoleUserMap = {
    doctype: string;
    docname: string;
    fields: string[];
}

export type InformationUser = {
  name: string;
  employee_name: string;
  company: string;
  department: string;
};
