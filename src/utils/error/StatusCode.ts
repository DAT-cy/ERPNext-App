// StatusCode.ts - Định nghĩa các mã trạng thái HTTP
export class StatusCode {
  public static readonly OK = 200;
  public static readonly CREATED = 201;
  public static readonly NO_CONTENT = 204;
  public static readonly BAD_REQUEST = 400;
  public static readonly UNAUTHORIZED = 401;
  public static readonly FORBIDDEN = 403;
  public static readonly NOT_FOUND = 404;
  public static readonly CONFLICT = 409;
  public static readonly PRECONDITION_FAILED = 412;
  public static readonly INTERNAL_SERVER_ERROR = 500;
  public static readonly SERVICE_UNAVAILABLE = 503;
  public static readonly DB_ERROR = 600;
}
