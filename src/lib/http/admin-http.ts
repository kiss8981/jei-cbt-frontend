import axios, { AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { getAuth, refreshToken, setAuth } from "./apis/admin/auth";

export interface BaseResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginationResponse<T> {
  totalCount: number;

  perPage: number;

  pageNum: number;

  items: T[];
}

export const adminHttp = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const adminHttpSWR = (url: string) =>
  adminHttp.get(url).then(res => res.data);

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig & { _retryCount?: number };
}[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      resolve(adminHttp(config));
    }
  });
  failedQueue = [];
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

adminHttp.interceptors.response.use(async response => {
  const code = (response.data?.code ?? null) as number | null;

  if (code && code == 4001) {
    const originalRequest = response.config as AxiosRequestConfig & {
      _retryCount?: number;
    };

    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    if (originalRequest._retryCount >= 3) {
      toast.error("인증 만료. 다시 로그인해주세요.");
      return Promise.reject(response);
    }

    originalRequest._retryCount += 1;

    if (isRefreshing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new Promise((resolve: any, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    isRefreshing = true;

    try {
      const auth = await getAuth();
      if (!auth.refreshToken) {
        toast.error("로그인이 필요합니다.");
        return Promise.reject(response);
      }

      const data = await refreshToken(auth.refreshToken)
        .then(res => res.data)
        .catch(() => null);

      if (!data) {
        toast.error("세션 갱신 실패. 다시 로그인해주세요.");
        return Promise.reject(response);
      }

      await setAuth(data.accessToken, data.refreshToken);
      processQueue(null, data.accessToken);

      if (originalRequest.headers) {
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
      }

      const waitTime = 500 * Math.pow(2, originalRequest._retryCount - 1);
      await delay(waitTime);

      return adminHttp(originalRequest);
    } catch (err) {
      processQueue(err, null);
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }

  return response;
});
