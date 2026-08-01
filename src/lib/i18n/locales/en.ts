/**
 * English translations — ESCEN Verification System
 */
import type { Translations } from "./fr";

const en: Translations = {
  app: {
    title: "ESCEN - Transcript Verification",
    short_title: "ESCEN Verification",
    tagline: "Official verification of ESCEN transcripts",
  },

  verify: {
    title: "Transcript Verification",
    subtitle:
      "Enter the unique identifier on your document to verify its authenticity.",
    input_label: "Transcript ID",
    input_placeholder: "e.g.: a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    submit: "Verify",
    verifying: "Verifying...",
    manual_link: "Already have an ID? Enter it here.",
    scan_title: "Scan the QR Code",
    scan_instruction:
      "Use your phone's camera to scan the QR Code on the transcript.",
  },

  result: {
    valid_title: "✅ Authenticated transcript",
    valid_description:
      "This transcript was issued by ESCEN University and is authentic.",
    not_found_title: "Unrecognized ID",
    not_found_description:
      "No transcript matches this identifier. Please check the entered code.",
    rate_limited_title: "Too many attempts",
    rate_limited_description:
      "You have made too many attempts. Please try again in a few minutes.",
    error_title: "Technical error",
    error_description:
      "An error occurred. Please try again or contact IT support.",
    back: "New verification",
    student: "Student",
    promo: "Program",
    moyenne: "Average grade",
    mention: "Honors",
    status: "Status",
    details_title: "Grade details",
    matiere: "Subject",
    code: "Code",
    credit: "Credits",
    note: "Grade",
    verified_at: "Verified on",
    download: "Download PDF",
  },

  admin: {
    login_title: "ESCEN Admin Panel",
    login_subtitle: "Sign in to manage transcripts.",
    email_label: "Email address",
    email_placeholder: "firstname@escen.university",
    password_label: "Password",
    password_placeholder: "Your password",
    login_button: "Sign in",
    logging_in: "Signing in...",
    login_error: "Invalid credentials. Please try again.",
    logout: "Sign out",
    dashboard: "Dashboard",
    releves: "Transcripts",
    logs: "History",
    settings: "Settings",

    dashboard_title: "Dashboard",
    stats_active: "Active transcripts",
    stats_cancelled: "Cancelled transcripts",
    stats_verifications: "Total verifications",
    stats_today: "Today",
    recent_verifications: "Recent verifications",
    recent_actions: "Recent actions",

    releves_title: "Transcript management",
    search_placeholder: "Search by name, ID or program...",
    create_releve: "New transcript",
    detail_title: "Transcript details",
    cancel_releve: "Cancel this transcript",
    cancel_confirm:
      "Are you sure you want to cancel this transcript? This action is irreversible.",
    replaced_by: "Replaced by",
    no_results: "No transcripts found.",

    logs_title: "Verification history",
    export_csv: "Export as CSV",
    no_logs: "No verifications recorded.",
    log_date: "Date",
    log_releve: "Transcript",
    log_result: "Result",
    log_ip: "IP (hashed)",
    log_user_agent: "Browser",
  },

  common: {
    loading: "Loading...",
    error: "An error occurred.",
    retry: "Retry",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    search: "Search",
    export: "Export",
    fr: "Français",
    en: "English",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
  },

  legal: {
    copyright: "ESCEN University. All rights reserved.",
    privacy: "Privacy policy",
    terms: "Terms of use",
  },
};

export default en;
