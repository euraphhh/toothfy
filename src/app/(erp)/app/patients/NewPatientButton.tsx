"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NewPatientWizard } from "./NewPatientWizard";

export function NewPatientButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="bg-[var(--color-foreground)] hover:bg-slate-800 text-white px-6 py-3.5 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 group"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        Novo Paciente
      </button>

      {open && <NewPatientWizard onClose={() => setOpen(false)} />}
    </>
  );
}
