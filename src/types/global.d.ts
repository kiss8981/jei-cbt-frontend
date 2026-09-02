declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    __JEI_CBT_APP__?: {
      version: string;
      platform: string;
    };
  }
}

export {};
