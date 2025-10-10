import { ICON } from "../lib/consts.ts"
import { ArrowPreset } from "../models/Arrow.ts"
import { Festival } from "../models/Festival.ts"
import { FormationType } from "../models/Formation.ts"
import { NotePreset } from "../models/Note.ts"
import { ParticipantOption } from "../models/Participant.ts"
import { Prop } from "../models/Prop.ts"
import { Song } from "../models/Song.ts"
import { objectColorSettings } from "../themes/colours.ts"

// export const festivalList: Array<Festival> = [
//   {
//     id: "0",
//     name: "サンプル",
//     note: "",
//     formations: [{
//       id: "0",
//       name: "ステージ",
//       type: FormationType.stage,
//       songId: "1",
//       length: 5,
//       width: 10,
//       topMargin: 2,
//       bottomMargin: 4,
//       sideMargin: 6
//     }]
//   },
//   {
//     id: "1",
//     name: "どまつり",
//     startDate: new Date(2025, 8, 30),
//     endDate: new Date(2025, 8, 31),
//     note: "",
//     formations: [{
//       id: "1",
//       name: "パレード",
//       type: FormationType.parade,
//       songId: "1",
//       length: 80,
//       width: 10,
//     },
//     {
//       id: "2",
//       name: "ステージ",
//       type: FormationType.stage,
//       songId: "1",
//       length: 18,
//       width: 20,
//     },
//     {
//       id: "3",
//       name: "JRステージ",
//       type: FormationType.stage,
//       songId: "1",
//       length: 14,
//       width: 20,
//     }]
//   },
//   {
//     id: "2",
//     name: "こいやまつり",
//     startDate: new Date(2025, 9, 27),
//     endDate: new Date(2025, 9, 28),
//     note: "",
//     formations: [
//       {
//         id: "4",
//         name: "パレード",
//         type: FormationType.parade,
//         songId: "1",
//         length: 80,
//         width: 10,
//       },
//       {
//         id: "5",
//         name: "ステージ",
//         type: FormationType.stage,
//         songId: "1",
//         length: 18,
//         width: 20,
//       }
//     ]
//   }
// ]

export const songList: Record<string, Song> = {
  "1": {
    name: "陽光へ",
    categories: {
      "0": { id: "0", name: "一般", color: objectColorSettings["redLightest"], order: 0, showInLegend: true, showInParadeGuide: false },
      "1": { id: "1", name: "スタッフ", color: objectColorSettings["grey2"], order: 1, showInLegend: true, showInParadeGuide: false },
      "2": { id: "2", name: "奇", color: objectColorSettings["redLightest"], order: 10, showInLegend: false, showInParadeGuide: false },
      "3": { id: "3", name: "偶", color: objectColorSettings["blueLightest"], order: 11, showInLegend: true, showInParadeGuide: false },
      "4": { id: "4", name: "座", color: objectColorSettings["greenLightest"], order: 12, showInLegend: true, showInParadeGuide: false },
      "5": { id: "5", name: "中", color: objectColorSettings["blueLightest"], order: 13, showInLegend: true, showInParadeGuide: false },
      "6": { id: "6", name: "高", color: objectColorSettings["redLightest"], order: 14, showInLegend: true, showInParadeGuide: false },
      "7": { id: "7", name: "左隊", color: objectColorSettings["greenLightest"], order: 8, showInLegend: true, showInParadeGuide: false },
      "8": { id: "8", name: "右隊", color: objectColorSettings["blueLightest"], order: 9, showInLegend: true, showInParadeGuide: false },
      "9": { id: "9", name: "旗", color: objectColorSettings["purpleLightest"], order: 2, showInLegend: false, showInParadeGuide: false },
      "10": { id: "10", name: "山伏", color: objectColorSettings["amberLight"], order: 3, showInLegend: false, showInParadeGuide: false },
      "11": { id: "11", name: "前隊", color: objectColorSettings["orangeLightest"], order: 4, showInLegend: false, showInParadeGuide: true },
      "12": { id: "12", name: "後隊", color: objectColorSettings["blueLightest"], order: 5, showInLegend: false, showInParadeGuide: true },
      "13": { id: "13", name: "女隊", color: objectColorSettings["greenLightest"], order: 6, showInLegend: false, showInParadeGuide: false },
      "14": { id: "14", name: "男隊", color: objectColorSettings["blueLightest"], order: 7, showInLegend: false, showInParadeGuide: false },
    },
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
      name: "太陽踊り",
      order: 6
    },
    {
      id: "7",
      songId: "1",
      name: "迎光祭",
      order: 7
    },
    {
      id: "8",
      songId: "1",
      name: "ご来光",
      order: 8
    },
    {
      id: "9",
      songId: "1",
      name: "ラスト1",
      order: 9
    },
    {
      id: "10",
      songId: "1",
      name: "ラスト2",
      order: 10
    },
    {
      id: "11",
      songId: "1",
      name: "ラスト3",
      order: 11
    },
    {
      id: "12",
      songId: "1",
      name: "ラスト4",
      order: 12
    }]
  }
}

export const teamMembers: Array<ParticipantOption> = [
  {id: "1", name: "ころな"},
  {id: "2", name: "クリーム", kana: "くりーむ"},
  {id: "3", name: "らくだガール"},
  {id: "4", name: "しぶかわに"},
  {id: "5", name: "エリザベス", kana: "えりざべす"},
  {id: "6", name: "まいん"},
  {id: "7", name: "普通ぅ", kana: "ふつう"},
  {id: "8", name: "ちはや"},
  {id: "9", name: "ふぁんた"},
  {id: "10", name: "がーすー"},
  {id: "11", name: "バタチキ", kana: "ばたちき"},
  {id: "12", name: "ぽて林寺", kana: "ぽてりんじ"},
  {id: "13", name: "ピーナッツ", kana: "ぴーなっつ"},
  {id: "14", name: "みゆきち"},
  {id: "15", name: "ちゃん"},
  {id: "16", name: "まりあ"},
  {id: "17", name: "しまたろう"},
  {id: "18", name: "パピ吉", kana: "ぱぴよし"},
  {id: "19", name: "ピノ", kana: "ぴの"},
  {id: "20", name: "おやびん。"},
  {id: "21", name: "犬", kana: "いぬ"},
  {id: "22", name: "ラフレシア", kana: "らふらしあ"},
  {id: "23", name: "かずま"},
  {id: "24", name: "ジャコ", kana: "じゃこ"},
  {id: "25", name: "はる"},
  {id: "26", name: "アーモンド", kana: "あーもんど"},
  {id: "27", name: "ゆず太くん", kana: "ゆずたくん"},
  {id: "28", name: "ばるちょ"},
  {id: "29", name: "ペペット", kana: "ぺぺっと"},
  {id: "30", name: "南", kana: "なん"},
  {id: "31", name: "ふちお"},
  {id: "32", name: "ココッシュ", kana: "ここっしゅ"},
  {id: "33", name: "きこりん"},
  {id: "34", name: "みっふぃ"},
  {id: "36", name: "kubota", kana: "くぼた"},
  {id: "37", name: "小籔", kana: "こやぶ"},
  {id: "38", name: "やのぴす"},
  {id: "39", name: "ほっぴー（白）", kana: "ほっぴーしろ"},
  {id: "40", name: "えごま", kana: "えごま"},
  {id: "41", name: "ピエロ", kana: "ぴえろ"},
  {id: "42", name: "えくぼ先生", kana: "えくぼせんせい"},
  {id: "43", name: "ぽぽたん", kana: ""},
  {id: "44", name: "かいりき"},
  {id: "45", name: "あつみあむもるつ"},
  {id: "46", name: "けんじろう"},
  {id: "47", name: "ちょま"},
  {id: "49", name: "さわやか"},
  {id: "50", name: "comeri", kana: "こめり"},
  {id: "51", name: "直太朗", kana: "なおたろう"},
  {id: "52", name: "ミライ坂⊿", kana: "みらいさか"},
  {id: "53", name: "すぎ"},
  {id: "54", name: "メイプル超合金", kana: "めいぷるちょうごうきん"},
  {id: "55", name: "とらはむ", kana: ""},
  {id: "56", name: "ぽんたろ"},
  {id: "57", name: "オーラ", kana: "おーら"},
  {id: "58", name: "円空", kana: "えんくう"},
  {id: "59", name: "いちご大福の首領", kana: "いちごだいふくのしゅりょう"},
  {id: "60", name: "タイガ", kana: "たいが"},
  {id: "61", name: "ケイティー", kana: "けいてぃー"},
  {id: "62", name: "どん"},
  {id: "63", name: "小雪", kana: "こゆき"},
]

export const propsList: Array<Prop> = [
  { name: "大旗", id: "1", length: 4, color: objectColorSettings.grey4 },
  { name: "キャリー", id: "2", length: 2, color: objectColorSettings.black },
  { name: "野点", id: "3", length: 1, color: objectColorSettings.black },
  { name: "山幕", id: "4", length: 4.5, color: objectColorSettings.grey4 },
  { name: "デカ大旗", id: "5", length: 8, color: objectColorSettings.indigoMain },
  { name: "ご来光幕", id: "6", length: 3.5, color: objectColorSettings.indigoMain },
]

export const notePresets: Array<NotePreset> = [
  {
    label: "タイミング",
    length: 1.25,
    height: 0.75,
    borderRadius: 10,
    fontGridRatio: 0.5,
    color: objectColorSettings.grey4,
    hasLabel: false,
    defaultContent: "1",
    alwaysBold: true,
  },
  {
    label: "メモ (小)",
    length: 3,
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
    length: 4,
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

// TODO: exports can't handle tension so removing curves for the time being
export const arrowPresets: Array<ArrowPreset> = [
  {
    iconFileName: ICON.horizontalRuleBlack,
    tension: 0,
    pointerAtBeginning: false,
    pointerAtEnding: false,
    points: [0, 4, 4, 0],
  },
  // {
  //   iconFileName: ICON.lineCurveBlack,
  //   tension: 0.3,
  //   pointerAtBeginning: false,
  //   pointerAtEnding: false,
  //   points: [0, 4, 1, 1, 4, 0],
  // },
  {
    iconFileName: ICON.turnRightBlack,
    tension: 0,
    pointerAtBeginning: false,
    pointerAtEnding: true,
    points: [0, 4, 0, 0, 4, 0],
  },
  {
    iconFileName: ICON.arrowRightAltBlack,
    tension: 0,
    pointerAtBeginning: false,
    pointerAtEnding: true,
    points: [0, 4, 4, 0],
  },
  {
    iconFileName: ICON.arrowRangeBlack,
    tension: 0,
    pointerAtBeginning: true,
    pointerAtEnding: true,
    points: [0, 4, 4, 0],
  },
  // {
  //   iconFileName: ICON.switchAccessShortcut,
  //   tension: 0.3,
  //   pointerAtBeginning: false,
  //   pointerAtEnding: true,
  //   points: [0, 4, 1, 1, 4, 0],
  // },
]