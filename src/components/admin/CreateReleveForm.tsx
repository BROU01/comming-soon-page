"use client";

import { useState, type FormEvent } from "react";
import type { Releve, ApiResponse } from "@/lib/types/database";

interface NoteRow {
  matiere: string;
  code: string;
  credit: number;
  note: number;
}

interface CreateReleveFormProps {
  onCreated: (releve: Releve) => void;
  onCancel: () => void;
}

const emptyNote = (): NoteRow => ({ matiere: "", code: "", credit: 3, note: 10 });

/**
 * Formulaire de création d'un relevé de notes.
 * Après la création, un QR Code est généré automatiquement
 * (l'URL /verify/[id] existe dès la création du relevé).
 */
export default function CreateReleveForm({ onCreated, onCancel }: CreateReleveFormProps) {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [promo, setPromo] = useState("");
  const [notes, setNotes] = useState<NoteRow[]>([emptyNote()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateNote(index: number, field: keyof NoteRow, value: string | number) {
    setNotes((prev) =>
      prev.map((n, i) => (i === index ? { ...n, [field]: value } : n))
    );
  }

  function addNote() {
    setNotes((prev) => [...prev, emptyNote()]);
  }

  function removeNote(index: number) {
    setNotes((prev) => prev.filter((_, i) => i !== index));
  }

  // Calcul de la moyenne pondérée par les crédits
  // NB: une note à 0 (matière ratée) doit être prise en compte.
  const validNotes = notes.filter(
    (n) => n.matiere.trim() && !Number.isNaN(n.note)
  );
  const totalCredits = validNotes.reduce((sum, n) => sum + (n.credit || 0), 0);
  const moyenne =
    totalCredits > 0
      ? validNotes.reduce((sum, n) => sum + n.note * (n.credit || 0), 0) / totalCredits
      : 0;

  function computeMention(m: number): string {
    if (m >= 16) return "Très bien";
    if (m >= 14) return "Bien";
    if (m >= 12) return "Assez bien";
    if (m >= 10) return "Passable";
    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!studentName.trim() || !studentId.trim()) {
      setError("Le nom de l'étudiant et le n° étudiant sont obligatoires.");
      return;
    }

    if (validNotes.length === 0) {
      setError("Ajoutez au moins une note avec une matière.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/releves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: studentName.trim(),
          student_id: studentId.trim(),
          promo: promo.trim(),
          notes_data: validNotes.map((n) => ({
            matiere: n.matiere.trim(),
            code: n.code.trim(),
            credit: n.credit || 0,
            note: Number(n.note),
          })),
          moyenne: Math.round(moyenne * 100) / 100,
          mention: computeMention(moyenne),
        }),
      });

      const data: ApiResponse<Releve> = await res.json();

      if (!data.success || !data.data) {
        setError(data.error || "Erreur lors de la création du relevé.");
        return;
      }

      onCreated(data.data);
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-escen-border rounded-2xl p-6 mb-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-escen-navy">Nouveau relevé de notes</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-escen-text-secondary hover:text-escen-cyan transition-colors"
        >
          ✕ Fermer
        </button>
      </div>

      {/* Infos étudiant */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-escen-text-secondary mb-1.5">
            Nom de l'étudiant *
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Ex : Jeanne Moreau"
            className="w-full h-[44px] px-3 text-sm bg-escen-bg border border-escen-border rounded-xl outline-none focus:border-escen-cyan focus:ring-1 focus:ring-escen-cyan/30"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-escen-text-secondary mb-1.5">
            N° étudiant *
          </label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Ex : ESC2025001"
            className="w-full h-[44px] px-3 text-sm bg-escen-bg border border-escen-border rounded-xl outline-none focus:border-escen-cyan focus:ring-1 focus:ring-escen-cyan/30"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-escen-text-secondary mb-1.5">
            Promotion
          </label>
          <input
            type="text"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="Ex : Licence 3 — 2025-2026"
            className="w-full h-[44px] px-3 text-sm bg-escen-bg border border-escen-border rounded-xl outline-none focus:border-escen-cyan focus:ring-1 focus:ring-escen-cyan/30"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-escen-navy">Notes</h3>
          <button
            type="button"
            onClick={addNote}
            className="px-3 py-1.5 text-xs font-semibold text-escen-cyan bg-escen-cyan-50 border border-escen-cyan-100 rounded-lg hover:bg-escen-cyan-100 transition-colors"
          >
            + Ajouter une matière
          </button>
        </div>

        <div className="space-y-2">
          {notes.map((note, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={note.matiere}
                onChange={(e) => updateNote(index, "matiere", e.target.value)}
                placeholder="Matière"
                className="col-span-4 h-[40px] px-3 text-sm bg-escen-bg border border-escen-border rounded-xl outline-none focus:border-escen-cyan"
              />
              <input
                type="text"
                value={note.code}
                onChange={(e) => updateNote(index, "code", e.target.value)}
                placeholder="Code"
                className="col-span-3 h-[40px] px-3 text-sm bg-escen-bg border border-escen-border rounded-xl outline-none focus:border-escen-cyan font-mono text-xs"
              />
              <input
                type="number"
                min={1}
                max={30}
                value={note.credit}
                onChange={(e) => updateNote(index, "credit", Number(e.target.value))}
                placeholder="Crédits"
                className="col-span-2 h-[40px] px-3 text-sm bg-escen-bg border border-escen-border rounded-xl outline-none focus:border-escen-cyan"
              />
              <input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={note.note}
                onChange={(e) => updateNote(index, "note", Number(e.target.value))}
                placeholder="Note /20"
                className="col-span-2 h-[40px] px-3 text-sm bg-escen-bg border border-escen-border rounded-xl outline-none focus:border-escen-cyan"
              />
              <button
                type="button"
                onClick={() => removeNote(index)}
                disabled={notes.length === 1}
                className="col-span-1 text-center text-escen-text-secondary hover:text-red-500 transition-colors disabled:opacity-30"
                title="Supprimer cette ligne"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Aperçu moyenne / mention */}
      <div className="flex items-center gap-6 px-4 py-3 bg-escen-cyan-50 border border-escen-cyan-100 rounded-xl">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
            Moyenne calculée
          </p>
          <p className="text-lg font-bold text-escen-navy">
            {moyenne > 0 ? `${moyenne.toFixed(2)}/20` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-escen-text-secondary">
            Mention
          </p>
          <p className="text-base font-bold text-escen-cyan">
            {computeMention(moyenne) || "—"}
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-escen-text-secondary bg-escen-bg border border-escen-border rounded-xl hover:bg-escen-border transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-semibold text-white bg-escen-navy rounded-xl hover:bg-escen-navy-500 transition-all duration-160 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Création en cours..." : "Créer le relevé"}
        </button>
      </div>
    </form>
  );
}
