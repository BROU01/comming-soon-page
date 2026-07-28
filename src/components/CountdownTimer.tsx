"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ============================================================
   Constants
   ============================================================ */
const STORAGE_KEY = "escen_launch_date";
const DURATION_MS = 60 * 24 * 60 * 60 * 1000; // 60 jours ≈ 2 mois
const TICK_MS = 1_000;
const LIVE_ANNOUNCE_INTERVAL = 60;

/* ============================================================
   Types
   ============================================================ */
interface TimeSegments {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeSegments(remaining: number): TimeSegments {
  const total = Math.max(0, Math.floor(remaining / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/* ============================================================
   FlipDigitSlot — Independent iPhone Slide-Up Digit Slot
   Staggered delay: units (index 1) slide first, tens (index 0) follow
   ============================================================ */
function FlipDigitSlot({ digit, index = 0 }: { digit: string; index?: number }) {
  const prevDigitRef = useRef(digit);
  const [animating, setAnimating] = useState(false);
  const [prevDigit, setPrevDigit] = useState(digit);

  useEffect(() => {
    if (prevDigitRef.current !== digit) {
      setPrevDigit(prevDigitRef.current);
      prevDigitRef.current = digit;

      // Stagger animation: units digit (index 1) slides at 0ms, tens digit (index 0) slides 110ms later
      const staggerDelay = index === 0 ? 110 : 0;

      const delayTimer = setTimeout(() => {
        setAnimating(true);
      }, staggerDelay);

      const clearTimer = setTimeout(() => {
        setAnimating(false);
      }, staggerDelay + 650);

      return () => {
        clearTimeout(delayTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [digit, index]);

  return (
    <div className="digit-slot">
      {animating && (
        <div key={`prev-${prevDigit}`} className="number animate-slide-up-out">
          {prevDigit}
        </div>
      )}
      <div
        key={`curr-${digit}-${animating}`}
        className={`number ${animating ? "animate-slide-up-in" : ""}`}
      >
        {digit}
      </div>
    </div>
  );
}

/* ============================================================
   TimerCard — White surface card containing distinct digit slots
   ============================================================ */
function TimerCard({
  value,
  label,
  id,
}: {
  value: number;
  label: string;
  id: string;
}) {
  const time = pad(value);

  return (
    <div
      className="bg-white border border-escen-border rounded-xl md:rounded-2xl shadow-[0_10px_30px_rgba(29,43,107,0.08)] p-4 sm:p-5 flex flex-col items-center justify-center gap-3 min-w-0 transition-transform duration-300 hover:scale-[1.02]"
      data-testid={id}
    >
      <div className="flex gap-1.5 sm:gap-2 items-center justify-center">
        <FlipDigitSlot digit={time[0]} index={0} />
        <FlipDigitSlot digit={time[1]} index={1} />
      </div>
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-escen-navy">
        {label}
      </span>
    </div>
  );
}

/* ============================================================
   Main Component: CountdownTimer
   ============================================================ */
export default function CountdownTimer() {
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [segments, setSegments] = useState<TimeSegments | null>(null);
  const [isLaunched, setIsLaunched] = useState(false);
  const tickCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* --- Read or set launch date --- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? parseInt(stored, 10) : NaN;

      if (!isNaN(parsed) && parsed - Date.now() <= DURATION_MS + 60_000) {
        setTargetTime(parsed);
      } else {
        const target = Date.now() + DURATION_MS;
        localStorage.setItem(STORAGE_KEY, String(target));
        setTargetTime(target);
      }
    } catch {
      setTargetTime(Date.now() + DURATION_MS);
    }
  }, []);

  /* --- Tick function --- */
  const tick = useCallback(() => {
    if (!targetTime) return;

    const remaining = targetTime - Date.now();

    if (remaining <= 0) {
      setIsLaunched(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setSegments(computeSegments(remaining));
    tickCount.current++;
  }, [targetTime]);

  /* --- Start/stop timer interval --- */
  useEffect(() => {
    if (!targetTime) return;

    tick();
    intervalRef.current = setInterval(tick, TICK_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [targetTime, tick]);

  /* --- Pause when tab is hidden --- */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        tick();
        if (!intervalRef.current && targetTime) {
          intervalRef.current = setInterval(tick, TICK_MS);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [targetTime, tick]);

  /* --- Loading / SSR State --- */
  if (!targetTime || (!isLaunched && !segments)) {
    return (
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-[640px]"
        role="group"
        aria-label="Compte à rebours"
      >
        <TimerCard value={0} label="Jours" id="countdown-days" />
        <TimerCard value={0} label="Heures" id="countdown-hours" />
        <TimerCard value={0} label="Minutes" id="countdown-minutes" />
        <TimerCard value={0} label="Secondes" id="countdown-seconds" />
      </div>
    );
  }

  /* --- Launched State --- */
  if (isLaunched) {
    return (
      <div
        className="bg-white border border-escen-border rounded-xl shadow-[0_10px_30px_rgba(29,43,107,0.08)] px-6 py-8 text-center"
        role="status"
      >
        <p className="text-xl md:text-2xl font-semibold text-escen-navy">
          Nous sommes en ligne.
        </p>
      </div>
    );
  }

  /* --- Active Timer State --- */
  const needsAnnounce = tickCount.current % LIVE_ANNOUNCE_INTERVAL === 0;

  return (
    <div className="relative w-full max-w-[640px]">
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        role="group"
        aria-label="Compte à rebours avant la mise en ligne"
      >
        <TimerCard value={segments!.days} label="Jours" id="countdown-days" />
        <TimerCard value={segments!.hours} label="Heures" id="countdown-hours" />
        <TimerCard value={segments!.minutes} label="Minutes" id="countdown-minutes" />
        <TimerCard value={segments!.seconds} label="Secondes" id="countdown-seconds" />
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {needsAnnounce
          ? `Il reste ${segments!.days} jours, ${segments!.hours} heures et ${segments!.minutes} minutes.`
          : ""}
      </p>
    </div>
  );
}
