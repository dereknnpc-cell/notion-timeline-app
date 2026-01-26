import React, { useState } from "react";
import { Info, CheckCircle2, Flag, Calendar, Target, FileText } from "lucide-react";

const App = () => {
  const weeks = [
    { m: "3月", w: 1 }, { m: "3月", w: 2 }, { m: "3月", w: 3 }, { m: "3月", w: 4 },
    { m: "4月", w: 1 }, { m: "4月", w: 2 }, { m: "4月", w: 3 }, { m: "4月", w: 4 },
    { m: "5月", w: 1 }, { m: "5月", w: 2 }, { m: "5月", w: 3 }, { m: "5月", w: 4 },
    { m: "6月", w: 1 }, { m: "6月", w: 2 }, { m: "6月", w: 3 }, { m: "6月", w: 4 }
  ];

  const tasks = [
    { name: "啟動與範圍鎖定", schedule: [0] },
    { name: "規格盤點與料號對齊", schedule: [0, 1] },
    { name: "報價口徑與文件模板", schedule: [2, 3] },
    { name: "打樣與等同性驗證", schedule: [4, 5] },
    { name: "試作與製程確認", schedule: [6, 7] },
    { name: "小批試單跑完整流程", schedule: [8, 9] },
    { name: "風險封口與合約定稿", schedule: [10, 11] },
    { name: "第一張正式訂單 PO", schedule: [12] },
    { name: "量產節奏穩定化", schedule: [13, 14, 15] }
  ];

  const gates = [
    { id: 0, name: "Gate 0 啟動核准", weekIdx: 0, time: "3月第1週末", condition: "範圍與KPI定義完成，責任歸屬清楚", output: "專案章程，材料優先清單，RACI" },
    { id: 1, name: "Gate 1 規格清單確認", weekIdx: 1, time: "3月第2週末", condition: "一料一規格版本可追溯", output: "規格書V0，料號對照表" },
    { id: 2, name: "Gate 2 報價口徑確認", weekIdx: 3, time: "3月第4週末", condition: "三方報價語言一致", output: "報價架構V1，文件模板V1" },
    { id: 3, name: "Gate 3 樣品承認", weekIdx: 5, time: "4月第2週末", condition: "樣品符合允收標準", output: "樣品承認紀錄，允收標準" },
    { id: 4, name: "Gate 4 製程可行", weekIdx: 7, time: "4月第4週末", condition: "試作良率與節拍達標", output: "試作報告，異常清單V1" },
    { id: 5, name: "Gate 5 流程跑通", weekIdx: 9, time: "5月第2週末", condition: "試單全流程無斷點", output: "流程全紀錄，對帳請款流程" },
    { id: 6, name: "Gate 6 量產準備", weekIdx: 11, time: "5月第4週末", condition: "主要風險已關閉或有替代方案", output: "改善關閉報告，合約草案" },
    { id: 7, name: "Gate 7 PO核准", weekIdx: 12, time: "6月第1週", condition: "可下單且交期責任清楚", output: "正式PO，供應計畫，KPI看板" }
  ];

  const [selectedGate, setSelectedGate] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">

        <div className="bg-slate-900 text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Calendar className="text-blue-400" />
                整合啟動與首張訂單專案時間軸
              </h1>
              <p className="text-slate-400 mt-2 text-sm">
                3月啟動整合 ➔ 3個月內完成首張訂單 (Target: 6月W1)
              </p>
            </div>
            <div className="text-xs text-slate-300">Notion Embed Ready (No AI)</div>
          </div>
        </div>

        <div className="overflow-x-auto p-4 md:p-6">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="p-3 text-left bg-slate-50 w-48 sticky left-0 z-10 shadow-sm">工作項目</th>
                {weeks.map((w, i) => (
                  <th key={i} className="p-2 text-xs font-semibold text-slate-500 border-l border-slate-100 min-w-[50px]">
                    <div className="text-[10px] text-slate-400">{w.m}</div>
                    W{w.w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, tidx) => (
                <tr key={tidx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-medium text-sm sticky left-0 bg-white z-10 border-r border-slate-100">
                    {task.name}
                  </td>
                  {weeks.map((_, widx) => (
                    <td key={widx} className="p-2 border-l border-slate-100 text-center relative">
                      {task.schedule.includes(widx) && (
                        <div className="flex justify-center items-center">
                          <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm flex items-center justify-center animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-white opacity-40"></div>
                          </div>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              <tr className="bg-slate-50/80">
                <td className="p-3 font-bold text-sm sticky left-0 bg-slate-50 z-10 border-r border-slate-100 text-blue-700">
                  關卡里程碑 (Gate)
                </td>
                {weeks.map((_, widx) => {
                  const gate = gates.find(g => g.weekIdx === widx);
                  return (
                    <td key={widx} className="p-2 border-l border-slate-100 text-center overflow-visible">
                      {gate && (
                        <button
                          onClick={() => setSelectedGate(gate)}
                          className="group relative flex flex-col items-center justify-center"
                          aria-label={gate.name}
                        >
                          <div className={`w-6 h-6 rotate-45 flex items-center justify-center shadow-md transform hover:scale-110 transition-transform cursor-pointer ${selectedGate?.id === gate.id ? "bg-indigo-600 ring-2 ring-indigo-300" : "bg-amber-500"}`}>
                            <span className="text-[10px] text-white -rotate-45 font-bold">G{gate.id}</span>
                          </div>
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-max bg-white p-1 rounded border border-amber-200 text-[10px] shadow-sm hidden group-hover:block z-50">
                            {gate.name}
                          </div>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-600">● 進行中項目</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rotate-45"></div>
            <span className="text-slate-600">◆ 關卡里程碑 Gate</span>
          </div>
          <div className="ml-auto italic text-slate-400 text-xs">
            * 點擊 Gate 圖示查看放行條件與輸出物
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-700 border-b pb-2">
              <Info className="w-5 h-5 text-blue-500" />
              專案核心精神
            </div>
            <p className="text-sm leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 italic">
              「用里程碑與關卡把不確定性切小塊，每一塊都能被董事會快速判斷要不要放行，避免專案靠意志力硬撐到後面一起爆。」
            </p>
          </div>

          <div className={`transition-all duration-300 rounded-lg p-4 border-2 ${selectedGate ? "bg-amber-50 border-amber-200 shadow-sm" : "bg-slate-50 border-slate-200 opacity-60"}`}>
            {selectedGate ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-amber-800 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    {selectedGate.name}
                  </h3>
                  <span className="text-xs font-mono bg-amber-200 px-2 py-0.5 rounded text-amber-900">{selectedGate.time}</span>
                </div>

                <div className="grid gap-3 mt-2">
                  <div className="flex gap-2 text-sm">
                    <Target className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-700 text-xs">放行條件</span>
                      <span className="text-slate-700">{selectedGate.condition}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 text-sm border-t border-amber-200 pt-2">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-700 text-xs">主要輸出物</span>
                      <span className="text-slate-700">{selectedGate.output}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 italic text-sm text-center">
                點擊上方 Gate 菱形查看詳情
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-100 p-4 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>關鍵目標：6月第1週正式下單 (PO Issued)</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Controlled Project Document
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}; export default App;

