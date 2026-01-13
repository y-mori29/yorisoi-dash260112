'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Screen, Facility, Patient } from './types';
import { MOCK_FACILITIES, MOCK_PATIENTS } from './constants';
import { useRecorder } from './hooks/useRecorder';
import { 
  Briefcase, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Search, 
  Building2, 
  ChevronRight,
  Mic,
  Pause,
  Square,
  Plus,
  ChevronLeft,
  Trash2,
  CheckCircle2,
  MoreHorizontal,
  Loader2
} from './components/Icons';
import { Header } from './components/Header';

// --- Shared Components ---

const DataLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-8">
        <div className="w-24 h-24 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
        <div className="w-64 space-y-2 text-center">
          <p className="text-text-main font-bold">データを読み込み中...</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  type: 'success' | 'neutral';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60] animate-[slideUp_0.3s_ease-out]">
      <div className={`px-6 py-3 rounded-full shadow-lg flex items-center space-x-3 backdrop-blur-md ${
        type === 'success' 
          ? 'bg-gray-800/90 text-white' 
          : 'bg-gray-800/90 text-white'
      }`}>
        {type === 'success' ? (
          <CheckCircle2 size={20} className="text-green-400" />
        ) : (
          <Trash2 size={20} className="text-gray-400" />
        )}
        <span className="font-bold text-sm">{message}</span>
      </div>
    </div>
  );
};

// --- Screen Components ---

// 1. Login Screen
const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLoginClick = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-surface/50 backdrop-blur-sm p-8 rounded-2xl shadow-none">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-blue-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Briefcase size={40} className="text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-text-main">ログイン</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-main">ユーザーID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className="text-gray-500" />
              </div>
              <input 
                type="text" 
                placeholder="IDを入力" 
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main placeholder-gray-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-main">パスワード</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-500" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="パスワードを入力" 
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-3 bg-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main placeholder-gray-500 transition-all disabled:opacity-50"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input 
              id="remember-me" 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-text-main cursor-pointer select-none">
              ログイン情報を保存する
            </label>
          </div>

          <button 
            onClick={handleLoginClick}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? 'ログイン中・・・' : 'ログイン'}
          </button>

          <div className="text-center pt-2">
            <a href="#" className={`text-sm text-primary underline decoration-1 underline-offset-4 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
              パスワードをお忘れの場合
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Facility List Screen
const FacilityListScreen: React.FC<{ onSelectFacility: (f: Facility) => void }> = ({ onSelectFacility }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching facilities
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DataLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="施設一覧" showAdd />
      
      <div className="p-4">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="施設名で検索" 
            className="w-full pl-10 pr-4 py-3 bg-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        <div className="space-y-3">
          {MOCK_FACILITIES.map((facility) => (
            <div 
              key={facility.id}
              onClick={() => onSelectFacility(facility)}
              className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 flex items-center active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100/50 rounded-xl flex items-center justify-center mr-4 shrink-0">
                <Building2 size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text-main truncate">{facility.name}</h3>
                <p className="text-xs text-text-sub truncate">{facility.type}</p>
              </div>
              <ChevronRight size={20} className="text-gray-400 ml-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Patient List Screen
const PatientListScreen: React.FC<{ 
  facility: Facility; 
  onBack: () => void;
  onSelectPatient: (p: Patient) => void; 
}> = ({ facility, onBack, onSelectPatient }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'incomplete'>('all');

  useEffect(() => {
    // Simulate fetching patients
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredPatients = MOCK_PATIENTS.filter(p => {
    // Filter by facility (mock logic)
    const isFacilityMatch = p.facilityId === facility.id || p.facilityId === '3';
    if (!isFacilityMatch) return false;

    // Filter by status
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  if (isLoading) {
    return <DataLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background relative pb-20">
      <Header title="患者一覧" showBack onBack={onBack} />

      <div className="p-5">
        <h2 className="text-xl font-bold text-text-main mb-4">{facility.name}</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="患者を検索" 
            className="w-full pl-10 pr-4 py-3 bg-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl mb-6">
          {(['all', 'completed', 'incomplete'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-surface text-primary shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'all' && '全て'}
              {tab === 'completed' && '完了'}
              {tab === 'incomplete' && '未完了'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-0 divide-y divide-gray-100 bg-surface rounded-xl overflow-hidden shadow-sm border border-gray-100">
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className="p-4 flex items-center active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4 shrink-0 text-text-main">
                <User size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-text-main text-lg">{patient.name}</h3>
                </div>
                <p className="text-xs text-text-sub">生年月日: {patient.dob}</p>
              </div>

              <div className="flex flex-col items-end space-y-2 ml-3">
                {patient.status === 'completed' ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    <CheckCircle2 size={12} className="mr-1" />
                    完了
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    <MoreHorizontal size={12} className="mr-1" />
                    未完了
                  </span>
                )}
                
              </div>
              <ChevronRight size={20} className="text-gray-300 ml-2" />
            </div>
          ))}
          {filteredPatients.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              該当する患者はいません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Recording Confirmation Modal (Overlay)
const RecordingConfirmation: React.FC<{ 
  patient: Patient; 
  onCancel: () => void; 
  onStart: () => void; 
}> = ({ patient, onCancel, onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center animate-[fadeIn_0.2s_ease-out]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-background rounded-t-2xl sm:rounded-2xl p-6 pb-10 shadow-2xl animate-[slideUp_0.3s_ease-out]">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-8 sm:hidden" />
        
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-primary">
            <Mic size={36} fill="currentColor" className="opacity-90" />
          </div>
          
          <h2 className="text-xl font-bold text-text-main mb-6">録音を開始しますか？</h2>
          
          <div className="w-full bg-gray-200/50 rounded-xl p-4 mb-8 text-left">
            <p className="text-xs text-text-sub mb-1">対象者</p>
            <p className="text-lg font-bold text-text-main">{patient.name}</p>
            <p className="text-sm text-text-sub mt-1">ID: {patient.id.toUpperCase().replace('P', '12345')} / Room {patient.roomNumber}</p>
          </div>
          
          <div className="w-full space-y-3">
            <button 
              onClick={onStart}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              録音開始
            </button>
            <button 
              onClick={onCancel}
              className="w-full bg-transparent hover:bg-gray-100 text-primary font-bold py-3.5 rounded-xl transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. Recording Screen (過去の実績コードベース)
const RecordingScreen: React.FC<{ 
  patient: Patient; 
  facility: Facility;
  onStop: () => void;
  onDiscard: () => void;
}> = ({ patient, facility, onStop, onDiscard }) => {
  // フックから必要なものを取り出す
  const { 
    isRecording, 
    isProcessing, // これが true の間はローディングを出す
    statusText,   // "AIが要約を作成中..." などの文字
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useRecorder();
  
  const [seconds, setSeconds] = useState(0);

  // マウント時の処理（録音開始）とアンマウント時の処理（キャンセル）
  useEffect(() => {
    startRecording();
    return () => {
      cancelRecording(); // 画面を離れたら強制停止
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // タイマー
  useEffect(() => {
    let interval: number | undefined;
    if (isRecording) {
      interval = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  // 停止ボタンが押されたとき
  const handleStopAndSave = async () => {
    // ここでは単純に stopRecording を呼ぶだけ。
    // stopRecording の中で finalize -> polling までやってくれるので await する。
    await stopRecording({
        patientId: patient.id,
        patientName: patient.name,
        facilityId: facility.id,
        facilityName: facility.name
    });
    // 全て終わったら親に通知して画面を戻す
    onStop();
  };

  const handleDiscard = async () => {
    cancelRecording(); // 保存せずに切る
    onDiscard();
  };

  // ビジュアライザー用
  const bars = Array.from({ length: 40 });

  return (
    <div className="fixed inset-0 bg-[#0F172A] text-white flex flex-col z-50">
      <header className="h-14 flex items-center px-4 relative justify-center">
        {/* 処理中は戻るボタンを無効化 */}
        <button 
          onClick={handleDiscard} 
          disabled={isProcessing}
          className={`absolute left-4 p-2 transition-colors ${isProcessing ? 'text-gray-600' : 'text-gray-400 hover:text-white'}`}
        >
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-base">録音</span>
      </header>

      <div className="flex-1 flex flex-col items-center pt-10 px-6">
        <p className="text-gray-400 text-sm mb-2">患者名</p>
        <h2 className="text-3xl font-bold mb-6">{patient.name} 様</h2>
        
        {/* ステータス表示エリア */}
        <div className="flex items-center space-x-2 mb-10 h-6">
          {isProcessing ? (
             // ポーリング中などのローディング表示
             <div className="flex items-center space-x-2 text-blue-400">
               <Loader2 size={16} className="animate-spin" />
               <span className="text-base font-bold animate-pulse">{statusText}</span>
             </div>
          ) : (
             // 通常の録音中表示
             <>
               <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
               <span className={`text-base font-medium ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                 {statusText || (isRecording ? '録音中' : '準備中...')}
               </span>
             </>
          )}
        </div>

        <div className="text-6xl font-mono font-bold tracking-wider mb-20 tabular-nums">
          {formatTime(seconds)}
        </div>

        {/* Visualizer */}
        <div className="h-16 flex items-center justify-center space-x-[4px] w-full max-w-sm mb-auto">
          {bars.map((_, i) => (
             <div 
               key={i}
               className={`w-1 rounded-full transition-all duration-150 ease-in-out ${i % 2 === 0 ? 'bg-blue-500' : 'bg-blue-400'}`}
               style={{ 
                 height: isRecording ? `${Math.max(8, Math.random() * 64)}px` : '4px',
                 opacity: isRecording ? 0.4 + Math.random() * 0.6 : 0.2
               }}
             />
          ))}
        </div>

        {/* Controls */}
        <div className="w-full pb-12 flex flex-col items-center space-y-10">
          <button 
            onClick={handleStopAndSave}
            // 録音中でない、または既に処理中ならボタンを押せないようにする
            disabled={isProcessing || !isRecording}
            className={`w-full max-w-sm font-bold py-4 rounded-xl flex items-center justify-center space-x-3 transition-colors active:scale-[0.98] ${
              isProcessing || !isRecording
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-blue-500/30'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>{statusText}</span>
              </>
            ) : (
              <>
                <Square size={18} fill="currentColor" />
                <span>停止して保存</span>
              </>
            )}
          </button>
          
          <button 
             onClick={handleDiscard}
             className={`text-sm flex items-center space-x-2 py-2 ${isProcessing ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
             disabled={isProcessing}
          >
            <Trash2 size={16} />
            <span>録音を破棄</span>
          </button>
        </div>
      </div>
    </div>
  );
};// --- Main App Component ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'neutral' } | null>(null);

  const showToast = (message: string, type: 'success' | 'neutral') => {
    setToast({ message, type });
  };

  // Flow handlers
  const handleLogin = () => {
    setCurrentScreen(Screen.FACILITY_LIST);
  };

  const handleSelectFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setCurrentScreen(Screen.PATIENT_LIST);
  };

  const handleBackToFacilities = () => {
    setSelectedFacility(null);
    setCurrentScreen(Screen.FACILITY_LIST);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentScreen(Screen.RECORDING_CONFIRM);
  };

  const handleCancelRecording = () => {
    setCurrentScreen(Screen.PATIENT_LIST); 
    setTimeout(() => setSelectedPatient(null), 300);
  };

  const handleStartRecording = () => {
    setCurrentScreen(Screen.RECORDING);
  };

  const handleStopRecording = () => {
    // Return to patient list
    setCurrentScreen(Screen.PATIENT_LIST);
    setSelectedPatient(null);
    showToast('録音が正常に保存されました', 'success');
  };

  const handleDiscardRecording = () => {
    setCurrentScreen(Screen.PATIENT_LIST);
    setSelectedPatient(null);
    showToast('録音は破棄されました', 'neutral');
  };

  return (
    <div className="font-sans text-text-main">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {currentScreen === Screen.LOGIN && (
        <LoginScreen onLogin={handleLogin} />
      )}

      {currentScreen === Screen.FACILITY_LIST && (
        <FacilityListScreen onSelectFacility={handleSelectFacility} />
      )}

      {currentScreen === Screen.PATIENT_LIST && selectedFacility && (
        <PatientListScreen 
          facility={selectedFacility} 
          onBack={handleBackToFacilities}
          onSelectPatient={handleSelectPatient}
        />
      )}

      {currentScreen === Screen.RECORDING_CONFIRM && selectedPatient && selectedFacility && (
        <>
          <PatientListScreen 
            facility={selectedFacility} 
            onBack={handleBackToFacilities}
            onSelectPatient={() => {}} 
          />
          <RecordingConfirmation 
            patient={selectedPatient} 
            onCancel={handleCancelRecording}
            onStart={handleStartRecording}
          />
        </>
      )}

      {currentScreen === Screen.RECORDING && selectedPatient && selectedFacility &&(
        <RecordingScreen 
          patient={selectedPatient} 
          facility={selectedFacility}
          onStop={handleStopRecording}
          onDiscard={handleDiscardRecording}
        />
      )}
    </div>
  );
}