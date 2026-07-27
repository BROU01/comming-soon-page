"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ============================================================
   Constants
   ============================================================ */
const STORAGE_KEY = "escen_launch_date";
const DURATION_MS = 60 * 24 * 60 * 60 * 1000; // 60 jours ≈ 2 mois
const TICK_MS = 1_000;
const LIVE_ANNOUNCE_INTERVAL = 60; // annonce ARIA toutes les 60s

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
   Component
   ============================================================ */
export default function CountdownTimer() {
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [segments, setSegments] = useState<TimeSegments | null>(null);
  const [isLaunched, setIsLaunched] = useState(false);
  const tickCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* --- Établir ou lire la date cible --- */
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
      // localStorage indisponible (mode privé) → date de session
      setTargetTime(Date.now() + DURATION_MS);
    }
  }, []);

  /* --- Tick --- */
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

  /* --- Démarrer / arrêter l'interval --- */
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

  /* --- Pause quand l'onglet est caché --- */
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

  /* --- États vides (SSR / chargement) --- */
  if (!targetTime || (!isLaunched && !segments)) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-[640px]" role="group" aria-label="Compte à rebours">
        {["Jours", "Heures", "Minutes", "Secondes"].map((label) => (
          <div key={label} className="bg-white border border-escen-border rounded-xl shadow-[0_10px_30px_rgba(29,43,107,0.08)] p-5 md:p-6 flex flex-col items-center gap-2">
            <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-escen-cyan tabular-nums leading-none">
              --
            </span>
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-escen-navy">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  /* --- État lancé --- */
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

  /* --- Timer actif --- */
  const needsAnnounce = tickCount.current % LIVE_ANNOUNCE_INTERVAL === 0;

  return (
    <div className="relative w-full max-w-[640px]">
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        role="group"
        aria-label="Compte à rebours avant la mise en ligne"
      >
        {/* Jours */}
        <TimerCard
          value={segments!.days}
          label="Jours"
          id="countdown-days"
        />
        {/* Heures */}
        <TimerCard
          value={segments!.hours}
          label="Heures"
          id="countdown-hours"
        />
        {/* Minutes */}
        <TimerCard
          value={segments!.minutes}
          label="Minutes"
          id="countdown-minutes"
        />
        {/* Secondes */}
        <TimerCard
          value={segments!.seconds}
          label="Secondes"
          id="countdown-seconds"
        />
      </div>

      {/* Annonce ARIA — discrète, une fois par minute */}
      <p
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {needsAnnounce
          ? `Il reste ${segments!.days} jours, ${segments!.hours} heures et ${segments!.minutes} minutes.`
          : ""}
      </p>
    </div>
  );
}

/* ============================================================
   TimerCard — sous-composant
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
  return (
    <div
      className="bg-white border border-escen-border rounded-xl shadow-[0_10px_30px_rgba(29,43,107,0.08)] p-5 md:p-6 flex flex-col items-center gap-2 min-w-0"
      data-testid={id}
    >
      <span
        className="text-[clamp(2.5rem,6vw,4rem)] font-bold text-escen-cyan tabular-nums leading-none transition-all duration-160"
        key={value}
      >
        {pad(value)}
      </span>
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-escen-navy">
        {label}
      </span>
    </div>
  );
}
