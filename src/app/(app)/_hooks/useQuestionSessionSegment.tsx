// hooks/useSessionSegment.ts
"use client";

import { BaseResponse, http } from "@/lib/http/http";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type GetQuestionSessionElapsedMsAppDto = {
  sessionId: number;
  elapsedMs: number;
};

type Options = {
  pollMs?: number;
  tickMs?: number;
  syncMs?: number;
};

export function useSessionSegment(
  sessionId: number,
  opts: Options = { pollMs: 1500, tickMs: 100, syncMs: 10_000 }
) {
  const pollMs = opts.pollMs ?? 1500;
  const tickMs = opts.tickMs ?? 100;
  const syncMs = opts.syncMs ?? 10_000;

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickAtRef = useRef<number | null>(null);
  const runningRef = useRef<boolean>(false);

  const clear = (
    ref: typeof tickTimerRef | typeof pollTimerRef | typeof syncTimerRef
  ) => {
    if (ref.current) {
      clearInterval(ref.current);
      ref.current = null;
    }
  };
  const clearAll = () => {
    clear(tickTimerRef);
    clear(pollTimerRef);
    clear(syncTimerRef);
    lastTickAtRef.current = null;
  };

  /** GET /elapsed-ms (안전) */
  const fetchElapsed = useCallback(async () => {
    const { data } = await http.get<
      BaseResponse<GetQuestionSessionElapsedMsAppDto>
    >(`/questions/sessions/${sessionId}/elapsed-ms`);
    if (data.code !== 200)
      throw new Error(data.message || "elapsed-ms 조회 실패");
    return data.data;
  }, [sessionId]);

  /** 서버 시각으로 보정 (poll 호출 없음) */
  const syncElapsed = useCallback(async () => {
    try {
      setIsPolling(true);
      setLastError(null);
      const res = await fetchElapsed();
      setElapsedMs(res?.elapsedMs ?? 0);
      lastTickAtRef.current = Date.now();
    } catch (e: any) {
      setLastError(e?.message ?? "elapsed-ms 요청 실패");
    } finally {
      setIsPolling(false);
    }
  }, [fetchElapsed]);

  /** POST /poll — 반드시 running 상태에서만 */
  const pollOnce = useCallback(async () => {
    if (!runningRef.current) return; // ✅ 시작 전 poll 금지
    try {
      setIsPolling(true);
      setLastError(null);
      const poll = await http.post<BaseResponse<any>>(
        `/questions/sessions/${sessionId}/poll`
      );
      if (poll.data.code !== 200)
        throw new Error(poll.data.message || "poll 실패");
    } catch (e: any) {
      setLastError(e?.message ?? "poll 실패");
    } finally {
      setIsPolling(false);
    }
  }, [sessionId]);

  /** 로컬 틱 (부드러운 증가) */
  const startTick = useCallback(() => {
    clear(tickTimerRef);
    lastTickAtRef.current = Date.now();
    tickTimerRef.current = setInterval(() => {
      if (!runningRef.current) return;
      const now = Date.now();
      const last = lastTickAtRef.current;
      if (last == null) {
        lastTickAtRef.current = now;
        return;
      }
      const delta = now - last;
      lastTickAtRef.current = now;
      setElapsedMs(prev => prev + delta);
    }, tickMs);
  }, [tickMs]);

  /** poll 타이머 — 반드시 running 상태에서만 시작 */
  const startPolling = useCallback(() => {
    clear(pollTimerRef);
    if (!runningRef.current) return; // ✅ 시작 전 생략
    // 즉시 1회
    pollOnce();
    pollTimerRef.current = setInterval(() => {
      if (runningRef.current) pollOnce();
    }, pollMs);
  }, [pollMs, pollOnce]);

  /** 주기적 서버 동기화(드리프트 보정). poll과 별개, 안전 */
  const startPeriodicSync = useCallback(() => {
    clear(syncTimerRef);
    // 즉시 1회
    syncElapsed();
    syncTimerRef.current = setInterval(syncElapsed, syncMs);
  }, [syncElapsed, syncMs]);

  /** 세션 시작: 이때부터 poll 허용 */
  const start = useCallback(async () => {
    try {
      setIsStarting(true);
      setLastError(null);
      const { data } = await http.post<BaseResponse<any>>(
        `/questions/sessions/${sessionId}/start`
      );
      if (data.code !== 200) throw new Error(data.message || "세션 시작 실패");

      setIsRunning(true);
      runningRef.current = true;

      await syncElapsed(); // 서버 시각 보정
      startTick(); // 로컬 증가
      startPolling(); // ✅ 이제부터 poll 시작
      startPeriodicSync(); // 드리프트 보정 주기
    } catch (e: any) {
      setLastError(e?.message ?? "세션 시작 실패");
    } finally {
      setIsStarting(false);
    }
  }, [sessionId, syncElapsed, startTick, startPolling, startPeriodicSync]);

  /** 세션 종료: poll·tick 모두 종료 */
  const stop = useCallback(async () => {
    try {
      setIsStopping(true);
      setLastError(null);
      const { data } = await http.post<BaseResponse<any>>(
        `/questions/sessions/${sessionId}/stop`
      );
      if (data.code !== 200) throw new Error(data.message || "세션 종료 실패");

      setIsRunning(false);
      runningRef.current = false;

      await syncElapsed(); // 종료 직후 서버값으로 보정
      clearAll(); // ✅ poll/tick/sync 모두 정리
    } catch (e: any) {
      setLastError(e?.message ?? "세션 종료 실패");
    } finally {
      setIsStopping(false);
    }
  }, [sessionId, syncElapsed]);

  /** 가시성 변화: running일 때만 재개 */
  useEffect(() => {
    const onVis = () => {
      if (!runningRef.current) return;
      if (document.hidden) {
        clear(pollTimerRef);
        clear(tickTimerRef);
      } else {
        syncElapsed();
        startTick();
        startPolling(); // ✅ running일 때만 동작
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [startPolling, startTick, syncElapsed]);

  /** 마운트: 세션 이력 표시용으로만 동기화 (poll 금지) */
  useEffect(() => {
    syncElapsed(); // 안전: GET만
    return () => clearAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return useMemo(
    () => ({
      elapsedMs,
      isRunning,
      isStarting,
      isStopping,
      isPolling,
      lastError,

      start,
      stop,
      pollOnce, // 고급 사용: 외부에서 수동 호출해도 running 아닐 땐 no-op
      syncElapsed, // 필요 시 수동 보정
      startPolling, // 고급 사용: running 아닐 땐 no-op
    }),
    [
      elapsedMs,
      isRunning,
      isStarting,
      isStopping,
      isPolling,
      lastError,
      start,
      stop,
      pollOnce,
      syncElapsed,
      startPolling,
    ]
  );
}
