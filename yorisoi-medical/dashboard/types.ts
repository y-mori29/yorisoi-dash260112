export interface Medication {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  status: string;
  reason_or_note: string;
}

export interface PharmacyFocus {
  medications: Medication[];
  adherence: string;
  side_effects: string[];
  drug_related_problems: string[];
  labs_and_monitoring: string[];
  patient_education: string[];
  follow_up: string;
}

export interface Soap {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface HomeVisitData {
  basic_info: string;
  chief_complaint: string;
  observation_treatment: string;
  medication_instruction: string;
  next_plan_handover: string;
}

export interface Alerts {
  red_flags: string[];
  need_to_contact_physician: string[];
}

export interface Meta {
  main_problems: string[];
  note_for_pharmacy: string;
}

export interface FamilyShare {
  rephrased_content: string;
}

export interface ClinicalData {
  soap: Soap;
  home_visit: HomeVisitData;
  pharmacy_focus: PharmacyFocus;
  alerts: Alerts;
  meta: Meta;
  family_share?: FamilyShare;
  summary?: string; // 100-char summary (Legacy/AI generated)
  report_100?: string; // 100-char summary for Receipt Computer (Manual/Demo)
}

export interface Visit {
  id: string;
  order: number;
  transcript_summary: string; // AI generated summary for the list view
  estimated_patient_name: string;
  confirmed_patient_id: string | null; // Null if not yet matched

  // Data available after matching/generation
  clinicalData?: ClinicalData;
  transcript?: string;

  status: 'pending_match' | 'matched' | 'approved';
}

export interface Record {
  id: string;
  date: string;
  transcript: string;
  clinicalData: ClinicalData;
  status: 'approved' | 'pending';
}

export interface Round {
  id: string;
  date: string;
  time_slot: 'AM' | 'PM';
  facility_id: string;
  facility_name: string;
  visits: Visit[];
}

export interface Patient {
  id: string;
  name: string;
  kana: string;
  birthDate: string; // YYYY-MM-DD
  age: number;
  gender: 'male' | 'female';
  avatarColor: string;
  facility_id: string;
  room_number?: string;
  records: Record[];
}

export interface Facility {
  id: string;
  name: string;
  patients: Patient[];
}