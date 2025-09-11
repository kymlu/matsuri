import { Festival } from "../models/Festival.ts";
import { FormationType } from "../models/Formation.ts";
import { Note } from "../models/Note.ts";
import { ParticipantOption } from "../models/Participant.ts";
import { ParticipantCategory } from "../models/ParticipantCategory.ts";
import { Prop } from "../models/Prop.ts";
import { Song } from "../models/Song.ts";
import { objectColorSettings } from "../themes/colours.ts";

export const festivalList: Array<Festival> = [
  {
    id: "1",
    name: "犬山",
    startDate: new Date(2025, 5, 30),
    endDate: new Date(2025, 5, 31),
    note: "",
    formations: [{
      id: "1",
      name: "パレード",
      type: FormationType.parade,
      songId: "1",
      length: 80,
      width: 10,
    },
    {
      id: "2",
      name: "ステージ",
      type: FormationType.stage,
      songId: "1",
      length: 18,
      width: 20,
    }]
  },
  {
    id: "2",
    name: "光が丘",
    startDate: new Date(2025, 7, 20),
    endDate: new Date(2025, 7, 21),
    note: "",
    formations: [{
      id: "3",
      name: "パレード",
      type: FormationType.parade,
      songId: "1",
      length: 80,
      width: 10,
    },
    {
      id: "4",
      name: "ステージ",
      type: FormationType.stage,
      songId: "1",
      length: 18,
      width: 20,
    }]
  },
  {
    id: "3",
    name: "どまつり",
    startDate: new Date(2025, 8, 30),
    endDate: new Date(2025, 8, 31),
    note: "",
    formations: [{
      id: "5",
      name: "パレード",
      type: FormationType.parade,
      songId: "1",
      length: 80,
      width: 10,
    },
    {
      id: "6",
      name: "ステージ",
      type: FormationType.stage,
      songId: "1",
      length: 18,
      width: 20,
    },
    {
      id: "7",
      name: "JRステージ",
      type: FormationType.stage,
      songId: "1",
      length: 14,
      width: 20,
    }]
  },
  {
    id: "4",
    name: "こいやまつり",
    startDate: new Date(2025, 9, 27),
    endDate: new Date(2025, 9, 28),
    note: "",
    formations: []
  }
]

export const songList: Array<Song> = [
  {
    id: "1",
    name: "陽光へ",
    sections: [{
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
    }]
  }
]

export const teamMembers: Array<ParticipantOption> = [
  {id: "1", name: "ころな"},
  {id: "2", name: "クリーム"},
  {id: "3", name: "らくだガール"},
  {id: "4", name: "しぶかわに"},
  {id: "5", name: "エリザベス"},
  {id: "6", name: "まいん"},
  {id: "7", name: "普通ぅ"},
  {id: "8", name: "ちはや"},
  {id: "9", name: "ふぁんた"},
  {id: "10", name: "がーすー"},
  {id: "11", name: "バタチキ"},
  {id: "12", name: "ぽて林寺"},
  {id: "13", name: "ピーナッツ"},
  {id: "14", name: "みゆきち"},
  {id: "15", name: "ちゃん"},
  {id: "16", name: "まりあ"},
  {id: "17", name: "しまたろう"},
  {id: "18", name: "パピ吉"},
  {id: "19", name: "ピノ"},
  {id: "20", name: "おやびん。"},
  {id: "21", name: "犬"},
  {id: "22", name: "ラフレシア"},
  {id: "23", name: "かずま"},
  {id: "24", name: "ジャコ"},
  {id: "25", name: "はる"},
  {id: "26", name: "アーモンド"},
  {id: "27", name: "ゆず太くん"},
  {id: "28", name: "ばるちょ"},
  {id: "29", name: "ペペット"},
  {id: "30", name: "南"},
  {id: "31", name: "ふちお"},
  {id: "32", name: "ココッシュ"},
  {id: "33", name: "きこりん"},
  {id: "34", name: "みっふぃ"},
  {id: "35", name: "まだ未定です"},
  {id: "36", name: "kubota"},
  {id: "37", name: "小籔"},
  {id: "38", name: "やのぴす"},
  {id: "39", name: "ほっぴー（白）"},
  {id: "40", name: "えごま"},
  {id: "41", name: "ピエロ"},
  {id: "42", name: "えくぼ先生"},
  {id: "43", name: "ぽぽたん"},
  {id: "44", name: "かいりき"},
  {id: "45", name: "あつみあむもるつ"},
  {id: "46", name: "けんじろう"},
  {id: "47", name: "ちょま"},
  {id: "48", name: "なし"},
  {id: "49", name: "さわやか"},
  {id: "50", name: "comeri"},
  {id: "51", name: "直太朗"},
  {id: "52", name: "ミライ坂⊿"},
  {id: "53", name: "すぎ"},
  {id: "54", name: "メイプル超合金"},
  {id: "55", name: "とらはむ"},
  {id: "56", name: "ぽんたろ"},
  {id: "57", name: "オーラ"},
  {id: "58", name: "円空"},
  {id: "59", name: "いちご大福の首領"},
  {id: "60", name: "タイガ"},
  {id: "61", name: "ケイティー"},
  {id: "-1", name: "踊り子", isPlaceholder: true},
  {id: "-2", name: "スタッフ", isPlaceholder: true},
]

export const propsList: Array<Prop> = [
  { name: "大旗", id: "1", length: 4, color: objectColorSettings.grey4 },
  { name: "キャリー", id: "2", length: 2, color: objectColorSettings.black },
  { name: "野点", id: "3", length: 1, color: objectColorSettings.black },
  { name: "山幕", id: "4", length: 4.5, color: objectColorSettings.grey4 },
  { name: "デカ大旗", id: "5", length: 8, color: objectColorSettings.indigoMain },
  { name: "ご来光幕", id: "6", length: 3.5, color: objectColorSettings.indigoMain },
]

//奇、偶、座り、中、高、左隊、右隊、旗、山伏、前隊、後隊
export const categoryList: Array<ParticipantCategory> = [
  { id: "0", name: "一般", color: objectColorSettings["amberLight"], order: 0, showInLegend: true, showInParadeGuide: false },
  { id: "1", name: "スタッフ", color: objectColorSettings["grey3"], order: 1, showInLegend: true, showInParadeGuide: false },
  { id: "2", name: "奇", color: objectColorSettings["redLightest"], order: 8, showInLegend: false, showInParadeGuide: false },
  { id: "3", name: "偶", color: objectColorSettings["blueLightest"], order: 9, showInLegend: true, showInParadeGuide: false },
  { id: "4", name: "座り", color: objectColorSettings["redLightest"], order: 10, showInLegend: true, showInParadeGuide: false },
  { id: "5", name: "中", color: objectColorSettings["greenLightest"], order: 11, showInLegend: true, showInParadeGuide: false },
  { id: "6", name: "高", color: objectColorSettings["cyanLight"], order: 12, showInLegend: true, showInParadeGuide: false },
  { id: "7", name: "左隊", color: objectColorSettings["orangeLightest"], order: 6, showInLegend: true, showInParadeGuide: false },
  { id: "8", name: "右隊", color: objectColorSettings["blueLightest"], order: 7, showInLegend: true, showInParadeGuide: false },
  { id: "9", name: "旗", color: objectColorSettings["violetLight"], order: 2, showInLegend: false, showInParadeGuide: false },
  { id: "10", name: "山伏", color: objectColorSettings["amberLight"], order: 3, showInLegend: false, showInParadeGuide: false },
  { id: "11", name: "前隊", color: objectColorSettings["redLight"], order: 4, showInLegend: false, showInParadeGuide: true },
  { id: "12", name: "後隊", color: objectColorSettings["blueLight"], order: 5, showInLegend: false, showInParadeGuide: true },
]

export const notePresets: Array<Note> = [
  {
    label: "タイミング",
    length: 1.25,
    height: 0.75,
    borderRadius: 10,
    fontGridRatio: 0.5,
    color: objectColorSettings.grey4,
    hasLabel: false,
    defaultContent: "1",
    alwaysBold: true
  },
  {
    label: "メモ (小)",
    length: 5,
    height: 1,
    borderRadius: 10,
    fontGridRatio: 0.25,
    color: objectColorSettings.amberLight,
    hasLabel: false,
    defaultContent: "これはメモです。",
    alwaysBold: false
  },
  {
    label: "メモ (中)",
    length: 5,
    height: 2,
    borderRadius: 10,
    fontGridRatio: 0.25,
    color: objectColorSettings.amberLight,
    hasLabel: false,
    defaultContent: "これはメモです。",
    alwaysBold: false
  },
  {
    label: "メモ (大)",
    length: 5,
    height: 3,
    borderRadius: 10,
    fontGridRatio: 0.25,
    color: objectColorSettings.amberLight,
    hasLabel: true,
    defaultContent: "これはメモです。",
    alwaysBold: false
  }
]