import { Festival } from "../models/Festival.ts";
import { Formation, FormationType } from "../models/Formation.ts";
import { Participant, ParticipantType } from "../models/Participant.ts";
import { Prop } from "../models/Prop.ts";
import { Song } from "../models/Song.ts";
import { SongSection } from "../models/SongSection.ts";

export const festivalList: Array<Festival> = [
  {
    id: "1",
    name: "犬山",
    startDate: new Date(2025, 5, 30),
    endDate: new Date(2025, 5, 31),
    note: ""
  },
  {
    id: "2",
    name: "光が丘",
    startDate: new Date(2025, 7, 20),
    endDate: new Date(2025, 7, 21),
    note: ""
  },
  {
    id: "3",
    name: "どまつり",
    startDate: new Date(2025, 8, 30),
    endDate: new Date(2025, 8, 31),
    note: ""
  },
  {
    id: "4",
    name: "こいやまつり",
    startDate: new Date(2025, 9, 27),
    endDate: new Date(2025, 9, 28),
    note: ""
  }
]

export const songList: Array<Song> = [
  {
    id: "1",
    name: "陽光へ"
  }
]

export const songSectionList: Array<SongSection> = [
  {
    id: "1",
    songId: "1",
    name: "OP",
    order: 1
  },
  {
    id: "2",
    songId: "1",
    name: "サビ",
    order: 2
  },
  {
    id: "3",
    songId: "1",
    name: "入山",
    order: 3
  },
  {
    id: "4",
    songId: "1",
    name: "滝行",
    order: 4
  },
  {
    id: "5",
    songId: "1",
    name: "祭り",
    order: 5
  },
  {
    id: "6",
    songId: "1",
    name: "迎光祭",
    order: 6
  },
  {
    id: "7",
    songId: "1",
    name: "ご来光",
    order: 7
  },
  {
    id: "8",
    songId: "1",
    name: "ラスト1",
    order: 8
  },
  {
    id: "9",
    songId: "1",
    name: "ラスト2",
    order: 9
  },
  {
    id: "10",
    songId: "1",
    name: "ラスト3",
    order: 10
  },
  {
    id: "11",
    songId: "1",
    name: "ラスト4",
    order: 11
  },
]

export const formationList: Array<Formation> = [
  {
    id: "1",
    name: "パレード",
    type: FormationType.parade,
    songId: "1",
    festivalId: "3",
    length: 80,
    width: 10,
  },
  {
    id: "2",
    name: "ステージ",
    type: FormationType.stage,
    songId: "1",
    festivalId: "3",
    length: 18,
    width: 20,
  },
  {
    id: "3",
    name: "JRステージ",
    type: FormationType.stage,
    songId: "1",
    festivalId: "3",
    length: 14,
    width: 20,
  },
  {
    id: "4",
    name: "パレード",
    type: FormationType.parade,
    songId: "1",
    festivalId: "2",
    length: 80,
    width: 10,
  },
  {
    id: "5",
    name: "ステージ",
    type: FormationType.stage,
    songId: "1",
    festivalId: "2",
    length: 18,
    width: 20,
  },
  {
    id: "6",
    name: "パレード",
    type: FormationType.parade,
    songId: "1",
    festivalId: "1",
    length: 80,
    width: 10,
  },
  {
    id: "7",
    name: "ステージ",
    type: FormationType.stage,
    songId: "1",
    festivalId: "1",
    length: 18,
    width: 20,
  },
]

export const participantsList: Array<Participant> = [
  {id: "1", name: "ケイティー", type: ParticipantType.dancer},
  {id: "2", name: "パピ吉", type: ParticipantType.dancer},
  {id: "3", name: "ぺぺっと", type: ParticipantType.staff},
  {id: "4", name: "くぼた", type: ParticipantType.dancer},
]

export const propsList: Array<Prop> = [
  {
    name: "大旗", id: "1", length: 5
  }
]

export const categoryList: Array<string> = [
  "奇", "偶"
]