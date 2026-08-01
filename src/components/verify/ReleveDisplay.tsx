"use client";

import type { Releve } from "@/lib/types/database";
import type { Locale } from "@/lib/types/database";

interface ReleveDisplayProps {
  releve: Releve;
  locale: Locale;
  verifiedAt: string;
}

/**
 * Affiche le relevé de notes officiel (version numérique).
 * Utilisé sur la page de vérification après validation de l'identifiant.
 */
export default function ReleveDisplay({ releve, locale, verifiedAt }: ReleveDisplayProps) {
  const isFrench = locale === "fr";

  return (
    <div className="w-full max-w-[800px] mx-auto">
      {/* En-tête du document officiel */}
      <div className="bg-white border-2 border-escen-navy rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(29,43,107,0.12)]">
        {/* Bandeau ESCEN */}
        <div className="bg-escen-navy px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">
              ESCEN University
            </h2>
            <p className="text-escen-cyan-300 text-xs">
              {isFrench
                ? "Document officiel — Relevé de notes"
                : "Official document — Transcript of records"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-xs">
              {isFrench ? "Date d'émission" : "Issued on"}
            </p>
            <p className="text-white font-medium text-sm">
              {new Date(releve.created_at).toLocaleDateString(isFrench ? "fr-FR" : "en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Sceau de vérification */}
        <div className="bg-escen-cyan-50 px-6 py-3 flex items-center gap-2 border-b border-escen-cyan-100">
          <span className="text-lg">✅</span>
          <span className="text-sm font-semibold text-escen-navy">
            {isFrench
              ? "Document authentifié par ESCEN"
              : "Document authenticated by ESCEN"}
          </span>
          <span className="ml-auto text-[0.65rem] text-escen-text-secondary/60">
            {isFrench ? "Vérifié le" : "Verified on"} {verifiedAt}
          </span>
        </div>

        {/* Informations étudiant */}
        <div className="px-6 py-4 border-b border-escen-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
                {isFrench ? "Étudiant" : "Student"}
              </p>
              <p className="text-base font-semibold text-escen-navy">
                {releve.student_name}
              </p>
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
                {isFrench ? "N° Étudiant" : "Student ID"}
              </p>
              <p className="text-base font-semibold text-escen-navy">
                {releve.student_id}
              </p>
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
                {isFrench ? "Promotion" : "Program"}
              </p>
              <p className="text-sm text-escen-text">{releve.promo || "—"}</p>
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
                {isFrench ? "ID Relevé" : "Transcript ID"}
              </p>
              <p className="text-xs font-mono text-escen-text-secondary break-all">
                {releve.id}
              </p>
            </div>
          </div>
        </div>

        {/* Tableau des notes */}
        <div className="px-6 py-4">
          <h3 className="text-sm font-bold text-escen-navy mb-3">
            {isFrench ? "Détail des notes" : "Grade details"}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-escen-border">
                  <th className="text-left py-2 pr-2 text-[0.65rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
                    {isFrench ? "Matière" : "Subject"}
                  </th>
                  <th className="text-left py-2 px-2 text-[0.65rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
                    {isFrench ? "Code" : "Code"}
                  </th>
                  <th className="text-center py-2 px-2 text-[0.65rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
                    {isFrench ? "Crédits" : "Credits"}
                  </th>
                  <th className="text-right py-2 pl-2 text-[0.65rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
                    {isFrench ? "Note" : "Grade"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {releve.notes_data?.length > 0 ? (
                  releve.notes_data.map((note, index) => (
                    <tr
                      key={index}
                      className="border-b border-escen-border/50 last:border-b-0 hover:bg-escen-cyan-50/50 transition-colors"
                    >
                      <td className="py-2 pr-2 font-medium text-escen-navy">{note.matiere}</td>
                      <td className="py-2 px-2 text-escen-text-secondary font-mono text-xs">{note.code}</td>
                      <td className="py-2 px-2 text-center text-escen-text">{note.credit}</td>
                      <td className="py-2 pl-2 text-right font-semibold text-escen-navy">
                        {note.note.toFixed(2)}
                        {note.mention ? (
                          <span className="text-[0.6rem] text-escen-cyan ml-1">({note.mention})</span>
                        ) : null}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-escen-text-secondary text-sm">
                      {isFrench ? "Aucune note enregistrée." : "No grades recorded."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé */}
        <div className="bg-escen-cyan-50 px-6 py-4 border-t border-escen-cyan-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
                  {isFrench ? "Moyenne" : "Average"}
                </p>
                <p className="text-xl font-bold text-escen-navy">
                  {releve.moyenne > 0 ? releve.moyenne.toFixed(2) : "—"}
                </p>
              </div>
              {releve.mention && (
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
                    {isFrench ? "Mention" : "Honors"}
                  </p>
                  <p className="text-base font-bold text-escen-cyan">
                    {releve.mention}
                  </p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
                {isFrench ? "Statut" : "Status"}
              </p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {isFrench ? "Actif" : "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Code QR et vérification */}
        <div className="px-6 py-4 bg-escen-bg border-t border-escen-border">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* QR Code re-généré (le même que sur le document papier) */}
            <div className="bg-white p-2 rounded-xl border border-escen-border shadow-sm shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/releve/${releve.id}/qrcode`}
                alt={isFrench ? "QR Code de vérification" : "Verification QR Code"}
                width={96}
                height={96}
                className="w-24 h-24"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold text-escen-navy mb-1">
                {isFrench
                  ? "Ce QR Code authentifie ce document"
                  : "This QR Code authenticates this document"}
              </p>
              <p className="text-[0.65rem] text-escen-text-secondary mb-3">
                {isFrench
                  ? "Scannez-le pour revérifier ce relevé à tout moment."
                  : "Scan it to re-verify this transcript at any time."}
              </p>
              <a
                href={`/api/releve/${releve.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-escen-navy rounded-xl hover:bg-escen-navy-500 transition-colors"
              >
                📄 {isFrench ? "Télécharger le PDF" : "Download PDF"}
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[0.6rem] text-escen-text-secondary/60 text-center">
        ESCEN — {isFrench ? "Relevé officiel" : "Official transcript"}
      </p>
    </div>
  );
}
