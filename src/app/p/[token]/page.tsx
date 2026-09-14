import { getPatientByToken } from "@/domain/patients/actions";
import { notFound } from "next/navigation";
import { PatientSelfRegistrationForm } from "./PatientSelfRegistrationForm";
import { Sparkles, CheckCircle } from "lucide-react";

export default async function PatientSelfRegistrationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const patient = await getPatientByToken(token);

  if (!patient) {
    notFound();
  }

  if (patient.selfRegistrationCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Cadastro Concluído!</h1>
        <p className="text-slate-500 text-lg max-w-md">
          Agradecemos por completar seu cadastro. Seus dados já estão seguros em nosso sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-[var(--color-primary)] z-0 rounded-b-[3rem] shadow-lg"></div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-8 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-brand text-3xl font-bold tracking-tight">
            toothfy
          </span>
        </div>

        <div className="bg-white w-full rounded-[2rem] shadow-2xl p-6 sm:p-10 mb-10 border border-slate-100">
          <div className="mb-10 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Olá, {patient.name.split(' ')[0]}!</h1>
            <p className="text-slate-500">
              Para agilizar seu atendimento e garantir a segurança das suas informações, por favor complete seu cadastro abaixo.
            </p>
          </div>

          <PatientSelfRegistrationForm token={token} initialData={patient} />
        </div>
        
        <p className="text-slate-400 text-xs text-center flex items-center gap-1">
           Ambiente seguro e protegido <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
        </p>
      </div>
    </div>
  );
}
