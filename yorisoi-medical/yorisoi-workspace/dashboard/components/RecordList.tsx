import React from 'react';
import { Patient } from '../types';

interface Props {
    patient: Patient;
    onSelectRecord: (id: string) => void;
}

export const RecordList: React.FC<Props> = ({ patient, onSelectRecord }) => (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 animate-fadeIn">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
                <div className="flex items-center gap-4">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md"
                        style={{ backgroundColor: patient.avatarColor }}
                    >
                        {patient.kana.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 font-medium mb-1">{patient.kana}</div>
                        <h2 className="text-2xl font-bold text-gray-800 leading-none">{patient.name} <span className="text-lg font-normal text-gray-500 ml-2">({patient.age}歳)</span></h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">ID: {patient.id.toUpperCase()}</span>
                            <span><i className="fa fa-birthday-cake"></i> {patient.birthDate.replace(/-/g, '/')} 生まれ</span>
                            <span className="text-teal-500 font-medium">{patient.gender === 'male' ? '男性' : '女性'}</span>
                            {patient.room_number && (
                                <span className="text-gray-500">{patient.room_number}号室</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex justify-between items-center">
                    <span>診療記録一覧</span>
                    <span className="text-xs font-normal normal-case text-gray-400">{patient.records.length}件の記録</span>
                </h3>
                <div className="grid gap-4">
                    {patient.records.map((record) => (
                        <button
                            key={record.id}
                            onClick={() => onSelectRecord(record.id)}
                            className="w-full text-left bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-gray-800">{record.date.replace(/-/g, '/')}</span>
                                    {record.status === 'approved' ? (
                                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            承認済
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-full border border-orange-100 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            要確認
                                        </span>
                                    )}
                                </div>
                                <span className="text-gray-400 group-hover:text-teal-400 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">{record.clinicalData.soap.s}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
