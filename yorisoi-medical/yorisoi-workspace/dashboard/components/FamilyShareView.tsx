import React from 'react';
import { FamilyShare } from '../types';

interface FamilyShareViewProps {
    data?: FamilyShare;
}

export const FamilyShareView: React.FC<FamilyShareViewProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="p-8 text-center text-gray-400 bg-white rounded-lg border border-dashed border-gray-300">
                ご家族向け共有事項はまだ作成されていません。
            </div>
        );
    }

    return (
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">ご家族への共有事項</h3>
            </div>

            <div className="bg-white p-6 rounded-lg border border-orange-100 shadow-sm">
                <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap font-medium">
                    {data.rephrased_content}
                </p>
            </div>

            <div className="mt-4 flex justify-end">
                <button className="flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    テキストをコピー
                </button>
            </div>
        </div>
    );
};
