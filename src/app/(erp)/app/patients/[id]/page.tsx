import { PatientProfileClient } from "./PatientProfileClient";
import { getPatientById } from "@/domain/patients/actions";
import { notFound } from "next/navigation";

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const patient = await getPatientById(id);
  
  if (!patient) {
     notFound();
  }

  return <PatientProfileClient patient={patient} />;
}
