// src/features/auth/model/auth.types.ts
export type LoggedUser = { message: string }; // ERPNext: { message: "<username>" }

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
