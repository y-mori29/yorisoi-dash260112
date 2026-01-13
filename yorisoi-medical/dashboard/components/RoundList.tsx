import React from 'react';
import { Round } from '../types';

interface RoundListProps {
    rounds: Round[];
    onSelectRound: (roundId: string) => void;
}

export const RoundList: React.FC<RoundListProps> = ({ rounds, onSelectRound }) => {
    return (
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
                    <h2 className="text-2xl font-bold text-gray-800">訪問ラウンド一覧</h2>
                    <p className="text-gray-500 text-sm mt-1">確認・編集を行うラウンドを選択してください</p>
                </div>

                <div className="p-6 bg-gray-50">
                    <div className="grid gap-4">
                        {rounds.map((round) => (
                            <button
                                key={round.id}
                                onClick={() => onSelectRound(round.id)}
                                className="w-full text-left bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-gray-800 tracking-tight">{round.date.replace(/-/g, '/')}</span>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${round.time_slot === 'AM' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                            {round.time_slot === 'AM' ? '午前' : '午後'}
                                        </span>
                                    </div>
                                    <span className="text-gray-400 group-hover:text-teal-400 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        {round.facility_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        患者数: <span className="font-bold text-gray-800 text-lg ml-1">{round.visits.length}</span> 名
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
