"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

/* ============================================================
   Email Notification Form
   Collecte les emails pour notifier au lancement.
   ============================================================ */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FeedbackState =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>({ type: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (feedback.type === "error") {
      setFeedback({ type: "idle" });
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = email.trim();

    if (!trimmed) {
      setFeedback({ type: "error", message: "Veuillez saisir votre adresse e-mail." });
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setFeedback({ type: "error", message: "Veuillez saisir une adresse e-mail valide." });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setFeedback({
          type: "error",
          message: data.error || "Une erreur est survenue. Réessayez.",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: "Merci ! Nous vous tiendrons informé du lancement.",
      });
      setEmail("");
    } catch {
      setFeedback({
        type: "error",
        message: "Une erreur est survenue. Réessayez.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-[480px] flex flex-col items-center gap-3"
    >
      <div
        className={`
          flex flex-col sm:flex-row gap-3 w-full
          transition-opacity duration-240
          ${isSubmitting ? "opacity-60 pointer-events-none" : ""}
        `}
      >
        <div className="relative flex-1">
          <label htmlFor="notify-email" className="sr-only">
            Adresse e-mail
          </label>
          <input
            id="notify-email"
            type="email"
            value={email}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="votre@gmail.com"
            required
            autoComplete="email"
            disabled={isSubmitting}
            className={`
              w-full h-[50px] px-4 text-base font-sans text-escen-text
              bg-escen-surface border rounded-xl outline-none
              transition-all duration-160
              placeholder:text-escen-text-secondary/60
              disabled:cursor-not-allowed
              ${
                feedback.type === "error"
                  ? "border-escen-cyan ring-1 ring-escen-cyan"
                  : isFocused
                    ? "border-escen-cyan ring-1 ring-escen-cyan/30"
                    : "border-escen-border hover:border-escen-navy/20"
              }
            `}
            aria-describedby="email-feedback"
            aria-invalid={feedback.type === "error" ? true : undefined}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            h-[50px] px-6 text-sm font-semibold font-sans text-white
            bg-escen-navy rounded-xl border-none
            cursor-pointer whitespace-nowrap
            transition-all duration-160
            hover:bg-escen-navy-500 active:scale-[0.97]
            disabled:cursor-not-allowed disabled:opacity-60
            focus-visible:outline-2 focus-visible:outline-escen-cyan focus-visible:outline-offset-3
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Envoi...
            </span>
          ) : (
            "Me notifier"
          )}
        </button>
      </div>

      {/* Feedback */}
      <div
        id="email-feedback"
        role="status"
        aria-live="polite"
        className={`
          flex items-center gap-2 text-sm font-medium min-h-[24px]
          transition-all duration-240
          ${
            feedback.type === "idle"
              ? "opacity-0"
              : "opacity-100"
          }
          ${
            feedback.type === "success"
              ? "text-escen-cyan"
              : feedback.type === "error"
                ? "text-escen-navy"
                : ""
          }
        `}
      >
        {feedback.type === "success" && (
          <>
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="10" fill="#00B7D9" />
              <path
                d="M6 10L9 13L14 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{feedback.message}</span>
          </>
        )}
        {feedback.type === "error" && (
          <>
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="10" fill="#1D2B6B" />
              <path
                d="M10 6V11M10 14H10.01"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>{feedback.message}</span>
          </>
        )}
      </div>
    </form>
  );
}
