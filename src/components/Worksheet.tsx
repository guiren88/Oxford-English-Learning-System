import React, { useState } from "react";
import { Unit, vocabularyData } from "../data/vocabulary";
import { Printer, FileText, Scissors, PenTool, Layers, Check, ChevronDown, Award } from "lucide-react";

interface WorksheetProps {
  grade: string;
  volume: number;
}

type WorksheetTemplate = "tracing" | "matching" | "cutouts";

export function Worksheet({ grade, volume }: WorksheetProps) {
  const [selectedGrade, setSelectedGrade] = useState(grade);
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0);
  const [activeTemplate, setActiveTemplate] = useState<WorksheetTemplate>("tracing");
  const [printError, setPrintError] = useState<string | null>(null);

  const gradeUnits = vocabularyData[`grade_${selectedGrade.toLowerCase()}`] || [];
  const currentUnit = gradeUnits[selectedUnitIdx] || gradeUnits[0];

  const handlePrint = () => {
    try {
      setPrintError(null);
      window.print();
    } catch (err) {
      console.warn("Direct window.print() failed in iframe sandbox:", err);
      setPrintError("由于浏览器安全沙箱限制，在线预览环境中无法直接唤起打印机。请点击浏览器右上角的新标签页图标打开应用，或者直接在键盘上使用快捷键 Ctrl + P (Mac 电脑为 Cmd + P) 进行打印喔！🌸");
    }
  };

  const getTemplateTitle = () => {
    switch (activeTemplate) {
      case "tracing": return "英语正姿硬笔描红本 (Tracing Book)";
      case "matching": return "中英语义趣味连线题 (Matching Test)";
      case "cutouts": return "自制双面折叠卡片裁切单 (Flashcard Cutouts)";
    }
  };

  // Help randomize/scramble datasets for Matching Column B
  const getScrambledTranslations = (words: any[]) => {
    // Return translations scrambled with stable key mapping or shuffle
    return [...words]
      .map((w, index) => ({ id: index, val: w.translation, key: w.word }))
      .sort((a, b) => (a.id + b.id) % 3 - 1); // stable pseudo-randomization
  };

  return (
    <div id="worksheet-builder" className="max-w-4xl mx-auto px-4 py-2 space-y-6">
      
      {/* 🛠️ CONTROLS SECTION (Fully Hidden in printout using .no-print classes!) */}
      <div className="bg-sanrio-card p-5 rounded-3xl border-2 border-sanrio-border shadow-sm space-y-4 no-print">
        <div className="flex items-center gap-2 border-b border-sanrio-border pb-3">
          <FileText className="text-sanrio-primary w-5 h-5" />
          <h2 className="font-extrabold text-lg text-sanrio-text">A4 线下练习纸生成与打印中心</h2>
        </div>

        {printError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1 text-amber-900">
              <span>💡 打印提示 (Print Guide)</span>
            </div>
            <p className="leading-relaxed">{printError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Grade selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-sanrio-muted tracking-wider block uppercase">选课教材：</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedUnitIdx(0);
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-sanrio-bg border border-sanrio-border text-xs text-sanrio-text focus:outline-none"
            >
              <option value="1a">一年级上册 (1A)</option>
              <option value="1b">一年级下册 (1B)</option>
              <option value="2a">二年级上册 (2A)</option>
              <option value="2b">二年级下册 (2B)</option>
              <option value="3a">三年级上册 (3A)</option>
              <option value="3b">三年级下册 (3B)</option>
              <option value="4a">四年级上册 (4A)</option>
              <option value="4b">四年级下册 (4B)</option>
              <option value="5a">五年级上册 (5A)</option>
              <option value="5b">五年级下册 (5B)</option>
            </select>
          </div>

          {/* 2. Unit selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-sanrio-muted tracking-wider block uppercase">精选单元：</label>
            <select
              value={selectedUnitIdx}
              onChange={(e) => setSelectedUnitIdx(parseInt(e.target.value))}
              className="w-full py-2.5 px-3 rounded-2xl bg-sanrio-bg border border-sanrio-border text-xs text-sanrio-text focus:outline-none"
            >
              {gradeUnits.map((u, index) => (
                <option key={index} value={index}>
                  {u.unit} ( {u.title} )
                </option>
              ))}
            </select>
          </div>

          {/* 3. Printing Action trigger */}
          <div className="flex items-end shadow-xs">
            <button
              onClick={handlePrint}
              className="w-full py-2.5 rounded-2xl bg-sanrio-primary text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>立即连接 A4 打印机 🖨️</span>
            </button>
          </div>
        </div>

        {/* Template selections tabs */}
        <div className="pt-2 border-t border-sanrio-border">
          <div className="text-[10px] text-sanrio-muted font-bold mb-2 tracking-wider">选择练习纸版式模板：</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "tracing", label: "✍️ 铅笔描红写字本", desc: "精美田字格/虚线勾边描红书写", icon: PenTool },
              { id: "matching", label: "🤝 连线匹配测试纸", desc: "中英乱序对应连线评测纸张", icon: Layers },
              { id: "cutouts", label: "✂️ 可折叠卡片裁切单", desc: "折叠贴边裁剪、自制随身卡", icon: Scissors },
            ].map((tmpl) => {
              const IconComp = tmpl.icon;
              const isSelected = activeTemplate === tmpl.id;

              return (
                <button
                  key={tmpl.id}
                  onClick={() => setActiveTemplate(tmpl.id as WorksheetTemplate)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-sanrio-primary bg-sanrio-primary bg-opacity-5 ring-2 ring-sanrio-secondary"
                      : "border-sanrio-border bg-sanrio-bg hover:opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <IconComp className={`w-4 h-4 ${isSelected ? "text-sanrio-primary" : "text-sanrio-muted"}`} />
                    {isSelected && <div className="w-1.5 h-1.5 bg-sanrio-accent rounded-full animate-ping" />}
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <div className={`text-xs font-bold leading-tight ${isSelected ? "text-sanrio-primary" : "text-sanrio-text"}`}>
                      {tmpl.label}
                    </div>
                    <div className="text-[9px] text-sanrio-muted leading-relaxed line-clamp-1">
                      {tmpl.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📄 PRINTABLE STAGE AND CANVAS AREA (Rendered in high-contrast crisp black & white under A4 rules in print!) */}
      {currentUnit ? (
        <div 
          id="worksheet-printable"
          className="printable-area bg-white text-black p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-sm space-y-6 mx-auto max-w-[210mm] min-h-[297mm] flex flex-col justify-between"
          style={{ background: "#ffffff", color: "#000000" }}
        >
          <div className="space-y-6">
            {/* Header: Pupil details */}
            <div className="border-b-4 border-double border-gray-800 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <span className="text-xs font-black font-mono tracking-wider uppercase bg-black text-white px-2.5 py-0.5 rounded-sm">
                  SHANGHAI OXFORD ENGLISH PRACTICE SHEETS
                </span>
                <h1 className="text-xl font-black text-gray-900 leading-tight">
                  {getTemplateTitle()}
                </h1>
                <div className="text-xs font-mono text-gray-500 font-semibold">
                  教材编目：{selectedGrade.toUpperCase()} · {currentUnit.unit} &nbsp;|&nbsp; 单元课题：{currentUnit.title}
                </div>
              </div>

              {/* Teacher grading slot */}
              <div className="border-2 border-black p-2.5 text-center min-w-[120px] rounded-lg">
                <div className="text-[9px] font-bold text-gray-400">PUPIL SCORE / EVALUATION</div>
                <div className="text-xs font-bold text-gray-700 py-1.5 border-b border-dashed border-gray-300">姓名: __________</div>
                <div className="text-sm font-black text-rose-600 pt-1">级别: ⭐⭐⭐</div>
              </div>
            </div>

            {/* Dynamic rendering templates */}
            
            {/* Template A: Tracing Grid Card */}
            {activeTemplate === "tracing" && (
              <div id="tracing-grid" className="space-y-6">
                <div className="text-xs font-semibold text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed no-print">
                  💡 <strong>家长指导说明：</strong>本纸张适合二年级以下学生进行铅笔硬笔字迹描红练习。请指导孩子按照上方田字轻线轮廓，从左向右一笔一划描写每个字母。多读多写更聪明！
                </div>

                <div className="space-y-8 pt-4">
                  {currentUnit.words.map((w, wIdx) => (
                    <div key={wIdx} className="space-y-3 border-b border-dashed border-gray-200 pb-6 print-card p-4 rounded-xl">
                      {/* English descriptor */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="font-bold text-gray-950">
                          单词 {wIdx + 1}: <span className="text-md underline ml-2">{w.word}</span>
                        </div>
                        <div className="font-mono text-gray-500 font-semibold text-[10px]">
                          音标: {w.phonetic} &nbsp;|&nbsp; 词意: {w.translation}
                        </div>
                      </div>

                      {/* Tracing exercise squares grids */}
                      <div className="flex flex-wrap gap-2.5">
                        {/* 1. Large Light outline preview box */}
                        <div className="w-16 h-18 border-2 border-gray-900 rounded-lg flex flex-col items-center justify-center bg-gray-50 select-none">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">示范</span>
                          <span className="text-2xl font-black text-black leading-none pt-1">
                            {w.word.substring(0, 4)}
                          </span>
                        </div>

                        {/* 2. Hand-writing slots boxes (with grid line effects!) */}
                        {Array.from({ length: 6 }).map((_, slotIdx) => (
                          <div
                            key={slotIdx}
                            className="w-16 h-18 border-2 border-dashed border-gray-400 rounded-lg relative flex items-center justify-center bg-white"
                          >
                            {/* Visual grid reference lines for tracing precision */}
                            <div className="absolute inset-0 border-t border-gray-200 border-dashed top-1/2" />
                            <div className="absolute inset-0 border-l border-gray-200 border-dashed left-1/2" />
                            
                            {/* Trace light gray bounding box on the first 3 boxes, leaving other 3 completely blank for independent mastery! */}
                            {slotIdx < 3 ? (
                              <span className="text-2xl font-extrabold text-gray-300 select-none font-sans z-10 opacity-70">
                                {w.word}
                              </span>
                            ) : (
                              <span className="text-2xl font-black text-gray-100 select-none font-sans z-10" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Template B: Scrambled Word Line matching paper */}
            {activeTemplate === "matching" && (
              <div id="matching-stage" className="space-y-8 py-4">
                <div className="text-xs font-semibold text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 no-print">
                  💡 <strong>测试规则说明：</strong>请用普通黑/蓝色水笔或铅笔，将左侧的 **核心英文单词** 与右侧对应的 **正确中文翻译** 用直线交汇连起来。
                </div>

                <div className="grid grid-cols-2 gap-x-20 pt-8 relative max-w-lg mx-auto">
                  {/* Left Column A: English words */}
                  <div className="space-y-12">
                    <div className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Column A Word</div>
                    {currentUnit.words.map((w, index) => (
                      <div key={index} className="flex items-center justify-between bg-white border border-gray-300 p-4 rounded-xl shadow-xs">
                        <span className="text-md font-extrabold text-gray-900 select-none">{w.word}</span>
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-800 bg-white shadow-inner flex items-center justify-center shrink-0 ml-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-black opacity-30" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Column B: Scrambled Chinese translations */}
                  <div className="space-y-12">
                    <div className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Column B Meaning</div>
                    {getScrambledTranslations(currentUnit.words).map((transItem, index) => (
                      <div key={index} className="flex items-center justify-start bg-white border border-gray-300 p-4 rounded-xl shadow-xs">
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-800 bg-white shadow-inner flex items-center justify-center shrink-0 mr-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-black opacity-30" />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 select-none">
                          {transItem.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra fill in the missing sentences part */}
                <div className="pt-10 border-t border-dashed border-gray-300 space-y-6">
                  <div className="text-xs font-bold text-gray-950 uppercase tracking-widest">
                    ✏️ PART II: Sentence translation write-back
                  </div>
                  <div className="space-y-6">
                    {currentUnit.sentences.map((s, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="text-xs text-gray-700">
                          Q {idx + 1}: 请将句子 <strong className="underline font-sans">{s.chinese}</strong> 默写为正确的英文句子。
                        </div>
                        <div className="h-10 border-b border-dashed border-gray-400 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Template C: Two-sided DIY card cutting plate */}
            {activeTemplate === "cutouts" && (
              <div id="cutouts-stage" className="space-y-6">
                <div className="text-xs font-semibold text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 leading-normal no-print">
                  💡 <strong>亲子手工说明：</strong>虚线（---）为裁剪虚折边界，点划线（-.-.-）代表单词卡折线。沿外框裁剪下块状卡片后，将英文面和中文面沿中轴线对齐粘合成双面英语速记单词卡片！
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  {currentUnit.words.map((w, index) => (
                    <div key={index} className="border-2 border-dashed border-gray-400 rounded-2xl overflow-hidden print-card">
                      <div className="grid grid-cols-2 divide-x divide-dashed divide-gray-400 h-36 bg-white">
                        {/* Card front side */}
                        <div className="p-4 flex flex-col justify-between h-full bg-white text-center">
                          <span className="text-[8px] tracking-wide text-gray-400 font-bold uppercase select-none">ENGLISH SIDE</span>
                          <div className="space-y-1">
                            <h5 className="text-xl font-black text-gray-950">{w.word}</h5>
                            <p className="text-[10px] font-mono text-gray-500">{w.phonetic}</p>
                          </div>
                          <span className="text-[8px] text-gray-400 font-mono select-none">
                            {currentUnit.unit}
                          </span>
                        </div>

                        {/* Card back side */}
                        <div className="p-4 flex flex-col justify-between h-full bg-slate-50 text-center">
                          <span className="text-[8px] tracking-wide text-gray-400 font-bold uppercase select-none">CHINESE SIDE</span>
                          <div className="space-y-1.5">
                            <h5 className="text-sm font-black text-gray-900">{w.translation}</h5>
                            <div className="text-[9px] text-gray-500 max-w-32 truncate mx-auto">
                              {currentUnit.title}
                            </div>
                          </div>
                          <span className="text-[8px] text-gray-400 font-semibold select-none">上海牛津 1A-5B</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Eco friendly printing warning ink saving stamp footer */}
          <div className="border-t border-gray-200 pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 font-mono gap-2 text-center sm:text-left">
            <span>© SHANGHAI OXFORD PRIMARY SCHOOL MULTIMEDIA ACADEMY. COOPERATION CERTIFIED 🎓</span>
            <span className="font-bold text-gray-500 flex items-center gap-1">
              <span>☘️ ECO INK-SAFE VERSION (NO INTERACTIVE PLUGINS PRINTED)</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-sanrio-muted italic no-print">
          暂无匹配单元数据，请更换选单教材。📘
        </div>
      )}
    </div>
  );
}
