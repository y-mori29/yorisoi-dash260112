import { Facility, Patient } from './types';

export const MOCK_FACILITIES: Facility[] = [
  { id: '1', name: 'ケアホームはなこ', type: '介護付き有料老人ホーム' },
  { id: '2', name: 'グループホームほしぞら', type: 'グループホーム' },
  { id: '3', name: '特別養護老人ホームさくら', type: '特別養護老人ホーム' },
  { id: '4', name: 'デイサービスあさひ', type: '通所介護' },
  { id: '5', name: '訪問看護ステーションみらい', type: '訪問看護' },
];

export const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', facilityId: '3', name: '山田 太郎', dob: '1945年4月1日', roomNumber: '101', status: 'completed' },
  { id: 'p2', facilityId: '3', name: '鈴木 一郎', dob: '1952年8月15日', roomNumber: '102', status: 'incomplete' },
  { id: 'p3', facilityId: '3', name: '佐藤 花子', dob: '1960年3月10日', roomNumber: '105', status: 'completed' },
  { id: 'p4', facilityId: '3', name: '高橋 健太', dob: '1948年11月25日', roomNumber: '201', status: 'incomplete' },
  { id: 'p5', facilityId: '1', name: '田中 美咲', dob: '1939年1月2日', roomNumber: 'A-1', status: 'incomplete' },
];