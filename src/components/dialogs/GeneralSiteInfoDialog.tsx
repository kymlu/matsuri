import React from "react";
import CustomDialog from "./CustomDialog.tsx";
import { ICON, LAST_UPDATED } from "../../lib/consts.ts";

export function GeneralSiteInfoDialog() {
  return (
    <CustomDialog title="使い方" hasX>
      <h2 className="font-semibold">位置確認</h2>
      <p className="">
        画面にある参加者をタップすると、その参加者の位置が確認できます。
      </p>
      <br/>
      <h2 className="font-semibold">ナビゲーション</h2>
      <p className="">
        <img src={ICON.chevronBackwardBlack} className="inline size-6"/>と<img src={ICON.chevronForwardBlack} className="inline size-6"/>で画面を動かせます。
      </p>
      <p>
        <img src={ICON.listsBlack} className="inline size-6"/>を押すと、セクションを変更できます。
      </p>
      <br/>
      <h2 className="font-semibold">ズーム</h2>
      <p className="">
        <img src={ICON.zoomInBlack} className="inline size-6"/>と<img src={ICON.zoomOutBlack} className="inline size-6"/>でズームイン・ズームアウトできます。
      </p>
      <br/>
      <h2 className="font-semibold">表示設定</h2>
      <p className="">
        <img src={ICON.noteStackBlack} className="inline size-6"/>でメモが表示・非表示を切り替えられます。
      </p>
      <p className="">
        <img src={ICON.footprintBlack} className="inline size-6"/>で前のセクションの隊列が表示・非表示を切り替えられます。
      </p>
      <br/>
      <h2 className="font-semibold">ダウンロード</h2>
      <p className="">
        <img src={ICON.downloadBlack} className="inline size-6"/>で現在の隊列を画像としてダウンロードできます。
        ダイアログが表示され、PDF内に好きな参加者をハイライトできます。
      </p>
      <br/>
      {LAST_UPDATED}
    </CustomDialog>
  )
}