import React, { useState, useRef, useEffect } from 'react';
import { MOCK_PATIENTS, MOCK_ROUNDS, MOCK_FACILITIES } from './data/mockData';
import { RoundList } from './components/RoundList';
import { RoundDetail } from './components/RoundDetail';
import { PatientSidebar } from './components/PatientSidebar';
import { RecordList } from './components/RecordList';
import { SoapView } from './components/SoapView';
import { CsvImportModal } from './components/CsvImportModal';
import { Round, Visit, ClinicalData, Patient, Facility } from './types';
import { Toast } from './components/ui/Toast';
import { calculateAge } from './utils/dateUtils';

// Helper to create dummy clinical data for newly matched visits
const generateDummyClinicalData = (patientName: string, date: string): ClinicalData => ({
  soap: {
    subjective: "特になし。",
    objective: "バイタル安定。",
    assessment: "現状維持。",
    plan: "次回定期訪問。"
  },
  home_visit: {
    basic_info: `${date} ${patientName}`,
    chief_complaint: "なし",
    observation_treatment: "特記事項なし",
    medication_instruction: "定期処方継続",
    next_plan_handover: "予定通り"
  },
  pharmacy_focus: {
    medications: [],
    adherence: "良好",
    side_effects: [],
    drug_related_problems: [],
    labs_and_monitoring: [],
    patient_education: [],
    follow_up: ""
  },
  alerts: {
    red_flags: [],
    need_to_contact_physician: []
  },
  meta: {
    main_problems: [],
    note_for_pharmacy: ""
  }
});

function App() {
  const [rounds, setRounds] = useState<Round[]>(MOCK_ROUNDS);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [facilities, setFacilities] = useState<Facility[]>(MOCK_FACILITIES);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'info' });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleRoundSelect = (roundId: string) => {
    setSelectedRoundId(roundId);
    setSelectedPatientId(null); // Clear patient selection when entering round
  };

  const handleBackToRoundList = () => {
    setSelectedRoundId(null);
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedRoundId(null); // Clear round selection when selecting patient
    setSelectedRecordId(null);
  };

  const handleRecordSelect = (recordId: string) => {
    setSelectedRecordId(recordId);
  };

  const handleBackToRecordList = () => {
    setSelectedRecordId(null);
  };

  const handleConfirmMatch = (visitId: string, patientId: string) => {
    setRounds(prevRounds => prevRounds.map(round => {
      if (round.id !== selectedRoundId) return round;

      return {
        ...round,
        visits: round.visits.map(visit => {
          if (visit.id !== visitId) return visit;

          // Find patient to get name
          const patient = patients.find(p => p.id === patientId);

          return {
            ...visit,
            confirmed_patient_id: patientId,
            status: 'matched' as const,
            // Generate dummy data if not present
            clinicalData: visit.clinicalData || generateDummyClinicalData(patient?.name || '', round.date)
          };
        })
      };
    }));
    showToast('患者割り当てを確定しました', 'success');
  };

  const handleUpdateVisit = (roundId: string, visitId: string, updates: Partial<Visit>) => {
    setRounds(prevRounds => prevRounds.map(round => {
      if (round.id !== roundId) return round;
      return {
        ...round,
        visits: round.visits.map(visit => {
          if (visit.id !== visitId) return visit;
          return { ...visit, ...updates };
        })
      };
    }));
  };

  const handleImportData = (data: any[]) => {
    let newPatientsCount = 0;
    let newFacilitiesCount = 0;
    const updatedFacilities = [...facilities];
    const newPatients: Patient[] = [];

    data.forEach((row, index) => {
      // 1. Handle Facility
      let facilityId = '';
      if (row.facility) {
        const existingFacility = updatedFacilities.find(f => f.name === row.facility);
        if (existingFacility) {
          facilityId = existingFacility.id;
        } else {
          // Create new facility
          facilityId = `f_imported_${Date.now()}_${newFacilitiesCount}`;
          updatedFacilities.push({
            id: facilityId,
            name: row.facility,
            patients: []
          });
          newFacilitiesCount++;
        }
      } else {
        // Default facility if none specified? Or skip?
        // For now, assign to first facility or a "Unknown" one
        facilityId = updatedFacilities[0]?.id || 'f_unknown';
      }

      // 2. Create Patient
      const genderStr = row.gender;
      const gender: 'male' | 'female' = (genderStr === 'male' || genderStr === 'female' || genderStr === '男性' || genderStr === '女性')
        ? (genderStr === 'male' || genderStr === '男性' ? 'male' : 'female')
        : 'female';

      const newPatient: Patient = {
        id: row.id || `p_imported_${Date.now()}_${index}`, // Use mapped ID if available
        name: row.name,
        kana: row.kana || '',
        birthDate: row.birthDate || '1900-01-01',
        age: calculateAge(row.birthDate), // Calculate age
        gender: gender,
        avatarColor: '#888888',
        facility_id: facilityId,
        room_number: row.room_number,
        records: []
      };

      newPatients.push(newPatient);
      newPatientsCount++;

      // Add to facility's patient list (if we were maintaining that structure strictly, but here we filter by ID)
    });

    if (newPatientsCount > 0) {
      setFacilities(updatedFacilities);
      setPatients(prev => [...prev, ...newPatients]);
      showToast(`${newPatientsCount}名の患者と${newFacilitiesCount}件の施設をインポートしました`, 'success');
    } else {
      showToast('インポートするデータがありませんでした', 'info');
    }
  };

  const handleRecordUpdate = (updatedData: ClinicalData) => {
    if (!selectedPatientId || !selectedRecordId) return;

    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id !== selectedPatientId) return p;
      return {
        ...p,
        records: p.records.map(r => {
          if (r.id !== selectedRecordId) return r;
          return { ...r, clinicalData: updatedData };
        })
      };
    }));
  };

  const selectedRound = rounds.find(r => r.id === selectedRoundId);
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const selectedRecord = selectedPatient?.records.find(r => r.id === selectedRecordId);

  // Filter patients based on facility of the selected round
  const facilityPatients = selectedRound
    ? patients.filter(p => p.facility_id === selectedRound.facility_id)
    : [];

  return (
    <div className="flex h-screen bg-gray-100 text-slate-700 font-sans overflow-hidden">

      {/* Sidebar (Always visible on desktop) */}
      <div className={`flex-shrink-0 h-full border-r border-gray-200 bg-white z-20 transition-all duration-300 ${!selectedPatientId && !selectedRoundId ? 'w-full md:w-80' : 'hidden md:flex md:w-80'}`}>
        <PatientSidebar
          patients={patients}
          facilities={facilities}
          selectedId={selectedPatientId}
          onSelect={handlePatientSelect}
        />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-full relative bg-gray-50 ${!selectedPatientId && !selectedRoundId ? 'hidden md:flex' : 'flex'}`}>

        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            {/* Back button for mobile */}
            <button
              onClick={() => {
                setSelectedPatientId(null);
                setSelectedRoundId(null);
              }}
              className={`md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full ${!selectedPatientId && !selectedRoundId ? 'hidden' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-br from-teal-400 to-teal-500 text-white p-1.5 rounded-lg shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </span>
              <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">よりそいPro <span className="hidden sm:inline text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200 font-normal ml-2">Home Visit Edition</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              CSVインポート
            </button>

            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-400 font-medium">ログイン中</div>
              <div className="text-sm font-bold text-gray-700">担当者A</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          {selectedRound ? (
            <RoundDetail
              round={selectedRound}
              facilityPatients={facilityPatients}
              onConfirmMatch={handleConfirmMatch}
              onUpdateVisit={handleUpdateVisit}
              onBack={handleBackToRoundList}
            />
          ) : selectedPatient ? (
            selectedRecord ? (
              <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fadeIn pb-24">
                <button onClick={handleBackToRecordList} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-teal-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  記録一覧に戻る
                </button>
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <span className="font-mono">{selectedRecord.date.replace(/-/g, '/')}</span>
                    {selectedRecord.status === 'approved' && <span className="text-green-600 text-xs font-bold px-1.5 py-0.5 bg-green-50 border border-green-100 rounded">承認済</span>}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 leading-none">{selectedPatient.name} 様 <span className="text-sm font-normal text-gray-500 ml-2">診療記録詳細</span></h2>
                </div>
                <SoapView
                  data={selectedRecord.clinicalData}
                  transcript={selectedRecord.transcript}
                  onChange={handleRecordUpdate}
                />
              </div>
            ) : (
              <RecordList patient={selectedPatient} onSelectRecord={handleRecordSelect} />
            )
          ) : (
            <RoundList rounds={rounds} onSelectRound={handleRoundSelect} />
          )}
        </main>

        <Toast message={toast.message} type={toast.type} show={toast.show} />

        <CsvImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportData}
        />

      </div >
    </div >
  );
}

export default App;