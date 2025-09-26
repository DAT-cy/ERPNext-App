import { StatusCode } from "../enum/errorEnum";

export type ErrorDef = {
  status: StatusCode;
  sysCode: string;        
  defaultMessage: string; 
  uiMessage: string;     
};

