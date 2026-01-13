export enum Screen {
  LOGIN = 'LOGIN',
  FACILITY_LIST = 'FACILITY_LIST',
  PATIENT_LIST = 'PATIENT_LIST',
  RECORDING_CONFIRM = 'RECORDING_CONFIRM',
  RECORDING = 'RECORDING',
  RESULT = 'RESULT',
}

export interface Facility {
  id: string;
  name: string;
  type: string;
}

export interface Patient {
  id: string;
  facilityId: string;
  name: string;
  dob: string;
  roomNumber?: string;
  status: 'completed' | 'incomplete';
}

export interface User {
  id: string;
  name: string;
}

export interface SoapContent {
  s: string;
  o: string;
  a: string;
  p: string;
}

export interface SoapResult {
  report_100: string;
  soap: SoapContent;
}