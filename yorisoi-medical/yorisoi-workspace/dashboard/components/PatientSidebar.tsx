import React, { useState, useMemo, useEffect } from 'react';
import { Patient, Facility } from '../types';

interface Props {
  patients: Patient[];
  facilities: Facility[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

type SortKey = 'date' | 'id' | 'name';

export const PatientSidebar: React.FC<Props> = ({ patients, facilities, selectedId, onSelect }) => {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilities[0]?.id || '');

  // Update selected facility if facilities change (e.g. initial load)
  useEffect(() => {
    if (!selectedFacilityId && facilities.length > 0) {
      setSelectedFacilityId(facilities[0].id);
    }
  }, [facilities, selectedFacilityId]);

  const filteredAndSortedPatients = useMemo(() => {
    // 1. Filter by Facility
    let result = patients.filter(p => p.facility_id === selectedFacilityId);

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.kana.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }

    // 3. Sort
    return [...result].sort((a, b) => {
      if (sortKey === 'date') {
        const dateA = a.records[0]?.date || '';
        const dateB = b.records[0]?.date || '';
        return dateB.localeCompare(dateA); // Descending
      }
      if (sortKey === 'id') {
        return a.id.localeCompare(b.id);
      }
      if (sortKey === 'name') {
        return a.kana.localeCompare(b.kana);
      }
      return 0;
    });
  }, [patients, selectedFacilityId, sortKey, searchQuery]);

  return (
    <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          施設選択
        </h2>

        {/* Facility Selector */}
        <select
          value={selectedFacilityId}
          onChange={(e) => setSelectedFacilityId(e.target.value)}
          className="w-full text-sm font-bold p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
        >
          {facilities.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        <div className="border-t border-gray-200 my-1"></div>

        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          患者リスト
        </h2>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="名前、フリガナ、IDで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm pl-8 pr-2 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="w-full text-xs p-2 pr-8 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none text-gray-600"
          >
            <option value="date">並べ替え: 最終受診日順</option>
            <option value="id">並べ替え: ID順</option>
            <option value="name">並べ替え: 名前順</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {filteredAndSortedPatients.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400">該当する患者がいません</div>
        ) : (
          filteredAndSortedPatients.map((patient) => {
            const latestRecord = patient.records[0];
            const hasPending = patient.records.some(r => r.status === 'pending');

            return (
              <li
                key={patient.id}
                onClick={() => onSelect(patient.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-teal-50 relative ${selectedId === patient.id ? 'bg-teal-50 border-l-4 border-l-teal-600 shadow-inner' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm mt-1"
                    style={{ backgroundColor: patient.avatarColor }}
                  >
                    {patient.kana.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        {/* フリガナ表示 */}
                        <div className="text-[10px] text-gray-500 leading-tight mb-0.5">{patient.kana}</div>
                        <div className="font-bold text-gray-800 truncate text-base leading-tight">
                          {patient.name}
                        </div>
                      </div>
                      {latestRecord && (
                        <div className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap mt-1">
                          {latestRecord.date.replace(/-/g, '/').slice(5)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span className="font-mono bg-gray-100 px-1 rounded text-[10px] text-gray-600">ID:{patient.id.toUpperCase()}</span>
                      <span>{patient.age}歳</span>
                      {patient.room_number && (
                        <span className="text-gray-400">| {patient.room_number}号室</span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      生年月日: {patient.birthDate.replace(/-/g, '/')}
                    </div>
                  </div>
                </div>
                {hasPending && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-orange-400 rounded-full ring-2 ring-white"></div>
                )}
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
};