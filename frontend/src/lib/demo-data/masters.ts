import { uuid } from './helpers';
import type { WorkType, LicenseMaster } from '@/types/api';

export const workTypes: WorkType[] = [
  { id: uuid(100), workTypeName: '左官工事' },
  { id: uuid(101), workTypeName: '塗装工事' },
  { id: uuid(102), workTypeName: 'タイル工事' },
  { id: uuid(103), workTypeName: '防水工事' },
  { id: uuid(104), workTypeName: '内装仕上げ' },
  { id: uuid(105), workTypeName: '基礎工事' },
  { id: uuid(106), workTypeName: '型枠工事' },
  { id: uuid(107), workTypeName: '鉄筋工事' },
  { id: uuid(108), workTypeName: 'とび工事' },
  { id: uuid(109), workTypeName: '電気工事' },
  { id: uuid(110), workTypeName: '管工事' },
  { id: uuid(111), workTypeName: '空調設備' },
  { id: uuid(112), workTypeName: '土木工事' },
  { id: uuid(113), workTypeName: '解体工事' },
];

export const licenseMasters: LicenseMaster[] = [
  { id: uuid(300), licenseName: '一級建築施工管理技士', category: '施工管理' },
  { id: uuid(301), licenseName: '二級建築施工管理技士', category: '施工管理' },
  { id: uuid(302), licenseName: '一級土木施工管理技士', category: '施工管理' },
  { id: uuid(303), licenseName: '玉掛け技能講習', category: '技能講習' },
  { id: uuid(304), licenseName: '足場の組立て等作業主任者', category: '技能講習' },
  { id: uuid(305), licenseName: '第一種電気工事士', category: '電気' },
  { id: uuid(306), licenseName: '第二種電気工事士', category: '電気' },
  { id: uuid(307), licenseName: 'フォークリフト運転技能講習', category: '運転' },
  { id: uuid(308), licenseName: '車両系建設機械運転技能講習', category: '運転' },
  { id: uuid(309), licenseName: '酸素欠乏危険作業主任者', category: '安全' },
];
