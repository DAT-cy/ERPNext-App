export type LoginPayload = {
  usr: string;
  pwd: string;
};

export type LoginResult = {
  ok: true;
  sid: string;
  data: any;                     // JSON ERPNext trả về khi login (message, home_page, full_name, ...)
  me?: LoggedUser;               // Tuỳ chọn: user hiện tại sau login
};

export type LoggedUser = {
  message: string;               // ERPNext trả về username trong field này
};
