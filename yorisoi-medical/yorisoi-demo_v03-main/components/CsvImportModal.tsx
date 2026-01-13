import React, { useState, useRef, useEffect } from 'react';
import { Patient, Facility } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: any[]) => void;
}

type AppField = 'name' | 'kana' | 'birthDate' | 'gender' | 'facility' | 'room_number' | 'id' | 'ignore';

const FIELD_LABELS: Record<AppField, string> = {
    name: '氏名 (必須)',
    kana: 'フリガナ',
    birthDate: '生年月日',
    gender: '性別',
    facility: '施設名',
    room_number: '居室番号',
    id: 'カルテ番号 (ID)',
    ignore: '無視する'
};

const REQUIRED_FIELDS: AppField[] = ['name'];

export const CsvImportModal: React.FC<Props> = ({ isOpen, onClose, onImport }) => {
    const [step, setStep] = useState<'upload' | 'mapping'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [previewRows, setPreviewRows] = useState<string[][]>([]);
    const [mapping, setMapping] = useState<Record<string, AppField>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setStep('upload');
            setFile(null);
            setHeaders([]);
            setPreviewRows([]);
            setMapping({});
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCsv(selectedFile);
        }
    };

    const parseCsv = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');

            if (lines.length < 2) {
                alert('CSVファイルにはヘッダー行と少なくとも1行のデータが必要です。');
                return;
            }

            // Simple CSV split (Note: doesn't handle quoted commas perfectly, but sufficient for demo)
            const parsedHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const parsedPreview = lines.slice(1, 6).map(line =>
                line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
            );

            setHeaders(parsedHeaders);
            setPreviewRows(parsedPreview);

            // Heuristic Matching
            const initialMapping: Record<string, AppField> = {};
            parsedHeaders.forEach((header, index) => {
                initialMapping[index] = guessField(header);
            });
            setMapping(initialMapping);

            setStep('mapping');
        };
        reader.readAsText(file); // Default to UTF-8. For Shift-JIS, we'd need a library or browser support.
    };

    const guessField = (header: string): AppField => {
        const h = header.toLowerCase();
        if (h.includes('氏名') || h.includes('名前') || h === 'name') return 'name';
        if (h.includes('カナ') || h.includes('ふりがな') || h === 'kana') return 'kana';
        if (h.includes('生年月日') || h.includes('誕生日') || h.includes('birth')) return 'birthDate';
        if (h.includes('性別') || h === 'gender' || h === 'sex') return 'gender';
        if (h.includes('施設') || h.includes('病院') || h === 'facility') return 'facility';
        if (h.includes('部屋') || h.includes('居室') || h === 'room') return 'room_number';
        if (h.includes('カルテ') || h.includes('id') || h === 'no') return 'id';
        return 'ignore';
    };

    const handleMappingChange = (headerIndex: string, field: AppField) => {
        setMapping(prev => ({ ...prev, [headerIndex]: field }));
    };

    const handleExecuteImport = () => {
        // Validate required fields
        const mappedFields = Object.values(mapping);
        const missingRequired = REQUIRED_FIELDS.filter(req => !mappedFields.includes(req));

        if (missingRequired.length > 0) {
            alert(`以下の必須項目がマッピングされていません: ${missingRequired.map(f => FIELD_LABELS[f]).join(', ')}`);
            return;
        }

        // Process all data (re-read file or store all lines? For demo, we'll re-parse or assume we have data)
        // Since we only stored preview, let's re-read the file to get all data
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            const dataRows = lines.slice(1); // Skip header

            const importedData = dataRows.map(line => {
                const cells = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                const obj: any = {};

                headers.forEach((_, index) => {
                    const field = mapping[index];
                    if (field && field !== 'ignore') {
                        obj[field] = cells[index];
                    }
                });
                return obj;
            });

            onImport(importedData);
            onClose();
        };
        reader.readAsText(file!);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        CSVインポート
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'upload' ? (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".csv"
                                onChange={handleFileChange}
                            />
                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            <p className="text-gray-600 font-medium">CSVファイルを選択またはドラッグ＆ドロップ</p>
                            <p className="text-xs text-gray-400 mt-2">対応フォーマット: .csv (UTF-8推奨)</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                                <p className="font-bold mb-1">項目のマッピング確認</p>
                                <p>CSVの列とアプリの項目を対応付けてください。「無視する」を選択するとその列は取り込まれません。</p>
                            </div>

                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-700 uppercase font-bold">
                                        <tr>
                                            <th className="px-4 py-3 min-w-[150px]">CSVヘッダー</th>
                                            <th className="px-4 py-3 min-w-[200px]">アプリの項目 (マッピング)</th>
                                            <th className="px-4 py-3 min-w-[200px]">プレビュー (1行目)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {headers.map((header, index) => (
                                            <tr key={index} className="bg-white hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{header}</td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={mapping[index] || 'ignore'}
                                                        onChange={(e) => handleMappingChange(index.toString(), e.target.value as AppField)}
                                                        className={`w-full p-2 border rounded focus:ring-2 focus:outline-none ${mapping[index] === 'ignore' ? 'text-gray-400 border-gray-200' : 'text-teal-700 border-teal-300 bg-teal-50 focus:ring-teal-400'}`}
                                                    >
                                                        {Object.entries(FIELD_LABELS).map(([key, label]) => (
                                                            <option key={key} value={key}>{label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs truncate max-w-[200px]">
                                                    {previewRows[0]?.[index] || '(空)'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-xs text-gray-500 text-right">
                                プレビューは最初の5行のみ表示しています。
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 font-medium transition-colors"
                    >
                        キャンセル
                    </button>
                    {step === 'mapping' && (
                        <button
                            onClick={handleExecuteImport}
                            className="px-6 py-2 text-white bg-teal-600 rounded hover:bg-teal-700 font-bold shadow-sm transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            インポート実行
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
