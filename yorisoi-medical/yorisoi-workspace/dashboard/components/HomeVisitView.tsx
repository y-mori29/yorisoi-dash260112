import React from 'react';
import { HomeVisitData } from '../types';

interface HomeVisitViewProps {
    data: HomeVisitData;
}

export const HomeVisitView: React.FC<HomeVisitViewProps> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    訪問診療記録フォーマット
                </h3>

                <div className="grid gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">基本情報</label>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-800 text-sm font-medium">
                            {data.basic_info}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">主訴・訴え</label>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-800 text-sm">
                            {data.chief_complaint}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">本日の観察・処置</label>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-800 text-sm whitespace-pre-wrap">
                            {data.observation_treatment}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">薬剤・指示</label>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-800 text-sm whitespace-pre-wrap">
                            {data.medication_instruction}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">次回予定・申し送り</label>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-800 text-sm whitespace-pre-wrap">
                            {data.next_plan_handover}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
