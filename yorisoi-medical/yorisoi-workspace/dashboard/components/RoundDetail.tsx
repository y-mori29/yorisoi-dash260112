import React, { useState } from 'react';
import { Round, Visit, Patient, ClinicalData } from '../types';
import { SoapView } from './SoapView';
import { HomeVisitView } from './HomeVisitView';
import { FamilyShareView } from './FamilyShareView';

interface RoundDetailProps {
    round: Round;
    facilityPatients: Patient[];
    onConfirmMatch: (visitId: string, patientId: string) => void;
    onUpdateVisit: (roundId: string, visitId: string, updates: Partial<Visit>) => void;
    onBack: () => void;
}

export const RoundDetail: React.FC<RoundDetailProps> = ({ round, facilityPatients, onConfirmMatch, onUpdateVisit, onBack }) => {
    const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);
    const [selectedPatientIds, setSelectedPatientIds] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'medical' | 'family'>('medical');

    const handlePatientSelectChange = (visitId: string, patientId: string) => {
        setSelectedPatientIds(prev => ({ ...prev, [visitId]: patientId }));
    };

    const toggleExpand = (visitId: string) => {
        setExpandedVisitId(prev => prev === visitId ? null : visitId);
    };

    return (
        <div className="max-w-6xl mx-auto w-full p-4 md:p-8 animate-fadeIn pb-24">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-teal-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    ラウンド一覧に戻る
                </button>
                <div className="text-right">
                    <div className="text-sm text-gray-500">{round.date.replace(/-/g, '/')} ({round.time_slot === 'AM' ? '午前' : '午後'})</div>
                    <h2 className="text-2xl font-bold text-gray-800">{round.facility_name}</h2>
                </div>
            </div>

            <div className="space-y-4">
                {round.visits.map((visit) => {
                    const isMatched = visit.status === 'matched' || visit.status === 'approved';
                    const matchedPatient = isMatched ? facilityPatients.find(p => p.id === visit.confirmed_patient_id) : null;
                    const selectedPatientId = selectedPatientIds[visit.id];
                    const isExpanded = expandedVisitId === visit.id;

                    return (
                        <div key={visit.id} className={`bg-white rounded-xl shadow-sm border transition-all overflow-hidden ${isMatched ? 'border-teal-200' : 'border-gray-200'}`}>
                            {/* Row Content */}
                            <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center">

                                {/* Left: Order & Play */}
                                <div className="flex items-center gap-4 md:w-1/6 shrink-0">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400 text-sm border border-gray-100 shadow-sm">
                                        {visit.order}
                                    </div>
                                    <button className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all transform hover:scale-105 shadow-sm border border-teal-100" title="冒頭を再生">
                                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </button>
                                </div>

                                {/* Center: Summary */}
                                <div className="md:w-2/5 flex-1">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">AI要約</div>
                                    <p className="text-gray-700 text-sm font-medium leading-relaxed">
                                        {visit.transcript_summary}
                                    </p>
                                </div>

                                {/* Right: Matching */}
                                <div className="md:w-1/3 flex flex-col gap-2 border-l border-gray-100 md:pl-6">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">患者割り当て</div>

                                    {isMatched ? (
                                        <div className="flex items-center justify-between bg-teal-50 p-3 rounded-lg border border-teal-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal-600 font-bold text-sm shadow-sm">
                                                    {matchedPatient?.kana.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 text-sm">{matchedPatient?.name}</div>
                                                    <div className="text-xs text-gray-500">{matchedPatient?.room_number}号室</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleExpand(visit.id)}
                                                className="text-xs font-bold text-teal-600 hover:text-teal-700 underline"
                                            >
                                                {isExpanded ? '詳細を閉じる' : '詳細を確認'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <div className="text-sm text-gray-600">
                                                推定: <span className="font-bold text-gray-800">{visit.estimated_patient_name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    className="flex-1 text-sm border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                                    value={selectedPatientId || ''}
                                                    onChange={(e) => handlePatientSelectChange(visit.id, e.target.value)}
                                                >
                                                    <option value="">候補を選択...</option>
                                                    {facilityPatients.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} ({p.room_number}号室)
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    disabled={!selectedPatientId}
                                                    onClick={() => onConfirmMatch(visit.id, selectedPatientId)}
                                                    className="px-3 py-2 bg-teal-500 text-white text-sm font-bold rounded shadow-sm hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    確定
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && visit.clinicalData && (
                                <div className="border-t border-gray-200 bg-gray-50 p-6 animate-fadeIn">
                                    <div className="flex gap-4 mb-6 border-b border-gray-200">
                                        <button
                                            onClick={() => setActiveTab('medical')}
                                            className={`pb-2 px-4 font-bold text-sm transition-colors relative ${activeTab === 'medical' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            医療記録 (SOAP/訪問)
                                            {activeTab === 'medical' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500" />}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('family')}
                                            className={`pb-2 px-4 font-bold text-sm transition-colors relative ${activeTab === 'family' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            ご家族向け
                                            {activeTab === 'family' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500" />}
                                        </button>
                                    </div>

                                    {activeTab === 'medical' ? (
                                        <div className="grid lg:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="font-bold text-gray-700 mb-3 flex items-center justify-between">
                                                    <span>SOAP形式</span>
                                                    <button
                                                        onClick={() => {
                                                            // Mock AI Regeneration
                                                            const newSummary = "【AI再生成】バイタル安定。食欲あり。特変なし。家族への共有事項を更新しました。";
                                                            const newSoap = {
                                                                s: "「ご飯も美味しいし、よく眠れています」",
                                                                o: "BP 120/78, P 72, KT 36.5。浮腫なし。",
                                                                a: "状態安定。服薬コンプライアンス良好。",
                                                                p: "現状維持。次回2週間後。"
                                                            };
                                                            const newFamilyShare = {
                                                                rephrased_content: "お母様はとてもお元気そうで、ご飯も美味しく召し上がっているとのことです。血圧などの数値も安定しており、安心してお過ごしいただいています。お薬もしっかり飲めています。"
                                                            };

                                                            onUpdateVisit(round.id, visit.id, {
                                                                transcript_summary: newSummary,
                                                                clinicalData: {
                                                                    ...visit.clinicalData!,
                                                                    soap: newSoap,
                                                                    family_share: newFamilyShare
                                                                }
                                                            });
                                                        }}
                                                        className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded border border-teal-200 hover:bg-teal-100 transition-colors flex items-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                        AI再生成
                                                    </button>
                                                </h4>
                                                <SoapView
                                                    data={visit.clinicalData}
                                                    transcript={visit.transcript || ''}
                                                    onChange={(newData) => onUpdateVisit(round.id, visit.id, { clinicalData: newData })}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-700 mb-3">訪問診療固有フォーマット</h4>
                                                <HomeVisitView data={visit.clinicalData.home_visit} />
                                            </div>
                                        </div>
                                    ) : (
                                        <FamilyShareView data={visit.clinicalData.family_share} />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
