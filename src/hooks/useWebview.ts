"use client";

export type WebviewEventType = "ROUTER_EVENT" | "AUTH_EVENT" | "TITLE_UPDATE";
export type WebviewEventMessage = { type: WebviewEventType } & (
  | ({
      type: "ROUTER_EVENT";
    } & WebviewEventPayload["ROUTER_EVENT"])
  | ({
      type: "AUTH_EVENT";
    } & WebviewEventPayload["AUTH_EVENT"])
  | ({
      type: "TITLE_UPDATE";
    } & WebviewEventPayload["TITLE_UPDATE"])
);

export interface WebviewEventPayload {
  AUTH_EVENT: {
    method: "LOGIN" | "LOGOUT" | "REFRESH_TOKEN";
    accessToken?: string;
    refreshToken?: string;
  };
  ROUTER_EVENT: {
    method: "PUSH" | "REPLACE" | "GO_BACK" | "RESET" | "GO_FORWARD";
    path?: string;
    screenName?: string;
    data?: Record<string, any>;
  };
  TITLE_UPDATE: {
    title: string;
  };
}

const useWebview = () => {
  const isWebView =
    typeof window !== "undefined" && !!window.ReactNativeWebView;

  const event = <T extends WebviewEventType>(
    type: T,
    payload: WebviewEventPayload[T]
  ) => {
    if (isWebView) {
      return window.ReactNativeWebView?.postMessage(
        JSON.stringify({
          type: type,
          ...payload,
        })
      );
    } else {
    }
  };

  return { event };
};

export default useWebview;
