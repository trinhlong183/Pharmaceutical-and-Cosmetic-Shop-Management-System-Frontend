/* eslint-disable @typescript-eslint/no-explicit-any */

import envConfig from "@/config";


type CustomOptions = Omit<RequestInit, "method"> & {
  baseUrl?: string | undefined;
  params?: Record<string, any>;
};

const ENTITY_ERROR_STATUS = 422;

type EntityErrorPayload = {
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
};

export class HttpError extends Error {
  status: number;
  payload: {
    message: string;
    [key: string]: any;
  };
  constructor({ status, payload }: { status: number; payload: any }) {
    // Create a more descriptive error message
    const errorMsg = payload?.message || `HTTP Error ${status}`;
    super(errorMsg);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

export class EntityError extends HttpError {
  status: 422;
  payload: EntityErrorPayload;
  constructor({
    status,
    payload,
  }: {
    status: 422;
    payload: EntityErrorPayload;
  }) {
    super({ status, payload });
    this.status = status;
    this.payload = payload;
  }
}

export const isClient = () => typeof window !== "undefined";
const request = async <Response>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  options?: CustomOptions | undefined
) => {
  let body: FormData | string | undefined = undefined;
  if (options?.body instanceof FormData) {
    body = options.body;
  } else if (options?.body) {
    body = JSON.stringify(options.body);
  }
  const baseHeaders: {
    [key: string]: string;
  } =
    body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        };
  if (isClient()) {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      baseHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }
  // Nếu không truyền baseUrl (hoặc baseUrl = undefined) thì lấy từ envConfig.NEXT_PUBLIC_API_ENDPOINT

  const baseUrl =
    options?.baseUrl === undefined
      ? envConfig.NEXT_PUBLIC_API_ENDPOINT
      : options.baseUrl;

  const fullUrl = url.startsWith("/")
    ? `${baseUrl}${url}`
    : `${baseUrl}/${url}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    } as any,
    body,
    method,
  });
  
  let payload: Response;
  try {
    payload = await res.json();
  } catch (error) {
    // Handle JSON parsing errors
    console.error(`JSON parsing error for ${method} ${fullUrl}:`, error);
    if (!res.ok) {
      throw new HttpError({ 
        status: res.status, 
        payload: { 
          message: `Error ${res.status}: Failed to parse response as JSON`,
          originalError: error instanceof Error ? error.message : String(error)
        } 
      });
    }
    // For successful responses with invalid JSON, return an empty response
    payload = { message: "No valid data returned" } as any;
  }
  
  const data = {
    status: res.status,
    payload,
  };
  // Interceptor là nời chúng ta xử lý request và response trước khi trả về cho phía component
  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(
        data as {
          status: 422;
          payload: EntityErrorPayload;
        }
      );
    } else {
      console.log("Error in login:", data);
      throw new HttpError(data);
    }
  }
  return data;
};

// Helper: build query string from params
function buildQueryString(params: Record<string, any>) {
  const esc = encodeURIComponent;
  return (
    "?" +
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) =>
        Array.isArray(v)
          ? v.map((item) => `${esc(k)}=${esc(item)}`).join("&")
          : `${esc(k)}=${esc(v)}`
      )
      .join("&")
  );
}

const http = {
  get<Response>(
    url: string,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    let fullUrl = url;
    if (options?.params && Object.keys(options.params).length > 0) {
      const query = buildQueryString(options.params);
      // Nếu url đã có dấu ? thì nối thêm, nếu chưa thì thêm ?
      fullUrl += url.includes("?") ? "&" + query.slice(1) : query;
    }
    // Loại bỏ params khỏi options khi truyền xuống request
    const { params: _, ...restOptions } = options || {};
    return request<Response>("GET", fullUrl, restOptions);
  },
  post<Response>(
    url: string,
    body?: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("POST", url, { ...options, body });
  },
  patch<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("PATCH", url, { ...options, body });
  },
  put<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("PUT", url, { ...options, body });
  },
  delete<Response>(
    url: string,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("DELETE", url, { ...options });
  },
};

export default http;
