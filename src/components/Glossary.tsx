import React, { useState } from "react";
import { Unit, Word, vocabularyData } from "../data/vocabulary";
import { Search, Star, Volume2, Trash2, BookOpen, AlertCircle, Sparkles, Smile, GraduationCap, ChevronDown, Check, X, Bookmark } from "lucide-react";
import { playAudio } from "../utils/audio";
import { Bookmark as BookmarkType, Mistake as MistakeType } from "../types";

interface GlossaryProps {
  grade: string;
  volume: number;
  bookmarkedWords: BookmarkType[];
  toggleBookmark: (wordObj: { word: string; translation: string; phonetic: string; grade: string; unitName: string }) => void;
  mistakes: MistakeType[];
  removeMistake: (word: string) => void;
  addMistake: (mistake: { word: string; translation: string; phonetic: string; grade: string; unitName: string }) => void;
  onSelectUnit?: (unit: Unit, view: "flashcards" | "quiz") => void;
  theme: string;
}

export function Glossary({
  grade,
  volume,
  bookmarkedWords,
  toggleBookmark,
  mistakes,
  removeMistake,
  addMistake,
  onSelectUnit,
  theme
}: GlossaryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("all"); // "all", "1a", "1b", etc.
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [showMistakesOnly, setShowMistakesOnly] = useState(false);
  
  // ➕ Lock or unlock Grades 3,4,5
  const [unlockHighGrades, setUnlockHighGrades] = useState(false);

  // Mistake on-the-spot spelling challenge state
  const [spellInputs, setSpellInputs] = useState<{ [key: string]: string }>({});
  const [spellFeedback, setSpellFeedback] = useState<{ [key: string]: "correct" | "incorrect" | null }>({});

  // Compile words database with range protection
  const allGrades = Object.keys(vocabularyData); // ["grade_1a", "grade_1b", ...]
  
  const activeGradesForCompilation = allGrades.filter((g) => {
    const isHigh = ["grade_3a", "grade_3b", "grade_4a", "grade_4b", "grade_5a", "grade_5b"].includes(g.toLowerCase());
    if (isHigh) {
      return unlockHighGrades;
    }
    return true; // 1A - 2B always unlocked
  });

  interface IndexedWord {
    word: string;
    phonetic: string;
    translation: string;
    gradeKey: string;
    unitName: string;
    unitObj: Unit;
  }

  // Flatten vocab database to list
  const compiledWords: IndexedWord[] = [];
  activeGradesForCompilation.forEach((gradeKey) => {
    const units = vocabularyData[gradeKey] || [];
    const plainGrade = gradeKey.replace("grade_", ""); // "1a", etc.
    units.forEach((u) => {
      u.words.forEach((w) => {
        compiledWords.push({
          word: w.word,
          phonetic: w.phonetic,
          translation: w.translation,
          gradeKey: plainGrade,
          unitName: u.unit,
          unitObj: u
        });
      });
    });
  });

  // Filter application
  const filteredWords = compiledWords.filter((item) => {
    // Search query check
    const matchesSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchQuery.toLowerCase());

    // Grade dropdown check
    const matchesGrade = selectedGradeFilter === "all" || item.gradeKey.toLowerCase() === selectedGradeFilter.toLowerCase();

    // Bookmark restriction check
    const isBookmarked = bookmarkedWords.some(
      (b) => b.word.toLowerCase() === item.word.toLowerCase() && b.grade.toLowerCase() === item.gradeKey.toLowerCase()
    );
    const matchesBookmark = !showBookmarksOnly || isBookmarked;

    // Mistakes booklet check
    const isMistaken = mistakes.some(
      (m) => m.word.toLowerCase() === item.word.toLowerCase() && m.grade.toLowerCase() === item.gradeKey.toLowerCase()
    );
    const matchesMistake = !showMistakesOnly || isMistaken;

    return matchesSearch && matchesGrade && matchesBookmark && matchesMistake;
  });

  const getCleanGradeName = (g: string) => {
    return g.toUpperCase();
  };

  const handleSpellRetrySubmit = (wordName: string, correctAnswer: string) => {
    const inputVal = (spellInputs[wordName] || "").trim().toLowerCase();
    const correctVal = correctAnswer.trim().toLowerCase();

    if (inputVal === correctVal) {
      setSpellFeedback((prev) => ({ ...prev, [wordName]: "correct" }));
      playAudio("You spelled it correctly! Good job!", volume);
      // Remove from mistakes booklet count
      setTimeout(() => {
        removeMistake(wordName);
        // Clean temporary status
        setSpellFeedback((prev) => ({ ...prev, [wordName]: null }));
        setSpellInputs((prev) => ({ ...prev, [wordName]: "" }));
      }, 1500);
    } else {
      setSpellFeedback((prev) => ({ ...prev, [wordName]: "incorrect" }));
      playAudio("Let's try again tomorrow!", volume);
      setTimeout(() => {
        setSpellFeedback((prev) => ({ ...prev, [wordName]: null }));
      }, 2000);
    }
  };

  return (
    <div id="glossary-center" className="max-w-4xl mx-auto px-4 py-2 space-y-6">
      {/* Page Title header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sanrio-border pb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-sanrio-text flex items-center gap-2">
            <span>📚 Oxford English 全套词典储藏室</span>
          </h2>
          <p className="text-xs text-sanrio-muted">
            收录全一至五年级共 10 册核心词表、收藏单词本和专属智能错题重测室
          </p>
        </div>
        <div className="flex bg-sanrio-secondary bg-opacity-40 p-1 rounded-xl border border-sanrio-border max-w-xs self-start sm:self-center">
          <button
            onClick={() => { setShowMistakesOnly(false); setShowBookmarksOnly(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${!showMistakesOnly && !showBookmarksOnly ? "bg-sanrio-primary text-white" : "text-sanrio-text"}`}
          >
            词典总库
          </button>
          <button
            onClick={() => { setShowBookmarksOnly(true); setShowMistakesOnly(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${showBookmarksOnly ? "bg-orange-400 text-white" : "text-sanrio-text"}`}
          >
            ★ 收藏夹
          </button>
          <button
            onClick={() => { setShowMistakesOnly(true); setShowBookmarksOnly(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${showMistakesOnly ? "border border-amber-300 bg-amber-50 text-amber-700 font-extrabold" : "text-sanrio-text"}`}
          >
            ✏️ 错题本
          </button>
        </div>
      </div>

      {/* 🔍 Search Deck and Dynamic Grade Selector Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-sanrio-card p-5 rounded-3xl border-2 border-sanrio-border shadow-xs">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-sanrio-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="搜索单词 / 中文翻译..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-sanrio-bg border border-sanrio-border text-xs focus:ring-2 focus:ring-sanrio-primary text-sanrio-text placeholder-sanrio-muted focus:outline-none"
          />
        </div>

        {/* Grade Filter */}
        <div className="md:col-span-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-sanrio-primary" />
          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            className="w-full py-2.5 px-3 rounded-2xl bg-sanrio-bg border border-sanrio-border text-xs text-sanrio-text focus:outline-none focus:ring-2 focus:ring-sanrio-primary"
          >
            <option value="all">全册教材 (按范围范围筛选)</option>
            <option value="1a">一年级上 (1A)</option>
            <option value="1b">一年级下 (1B)</option>
            <option value="2a">二年级上 (2A)</option>
            <option value="2b">二年级下 (2B)</option>
            
            {unlockHighGrades && (
              <>
                <option value="3a">三年级上 (3a)</option>
                <option value="3b">三年级下 (3b)</option>
                <option value="4a">四年级上 (4a)</option>
                <option value="4b">四年级下 (4b)</option>
                <option value="5a">五年级上 (5a)</option>
                <option value="5b">五年级下 (5b)</option>
              </>
            )}
          </select>
        </div>

        {/* Dynamic unlocking high grades check box */}
        <div className="md:col-span-4 flex items-center justify-end">
          {!unlockHighGrades ? (
            <button
              onClick={() => {
                setUnlockHighGrades(true);
                playAudio("Unlocked Grade Three, Four, and Five curriculum databases successfully!", volume);
              }}
              className="py-2.5 px-4 rounded-2xl border border-dashed border-sanrio-accent text-sanrio-accent bg-rose-50 bg-opacity-20 hover:bg-opacity-50 text-xs font-bold transition-all w-full md:w-auto text-center cursor-pointer flex items-center justify-center gap-1"
            >
              <span>➕ 载入高年级 (3-5年级) 英汉词包</span>
            </button>
          ) : (
            <button
              onClick={() => setUnlockHighGrades(false)}
              className="py-2.5 px-4 rounded-2xl border border-dashed border-sanrio-muted text-sanrio-muted bg-sanrio-bg hover:bg-opacity-50 text-xs font-semibold w-full md:w-auto text-center cursor-pointer"
            >
              <span>➖ 隐藏高年级词库</span>
            </button>
          )}
        </div>
      </div>

      {/* ✏️ MISTAKES BOOKLET WORKSTATION (If Mistakes Only is checked) */}
      {showMistakesOnly && (
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex gap-3 text-xs text-amber-700 leading-relaxed max-w-xl">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-extrabold flex items-center gap-1.5">
                <span>错题重测演练室 (共 {filteredWords.length} 题待结案)</span>
                {filteredWords.length === 0 && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">已全部清空！🏆</span>}
              </div>
              <p>宝贝，在右边拼写输入框，拼出正确拼写，按“检查”验证。拼对后错题自动滑落消去！</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWords.map((item, idx) => {
              const currentInput = spellInputs[item.word] || "";
              const stateFeedback = spellFeedback[item.word];

              return (
                <div
                  key={idx}
                  className="bg-sanrio-card border-2 border-amber-200 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {getCleanGradeName(item.gradeKey)} · {item.unitName}
                      </span>
                      <h4 className="text-xl font-black text-sanrio-text tracking-wide select-all flex items-center gap-2">
                        <span>{item.word}</span>
                        <button
                          onClick={() => playAudio(item.word, volume)}
                          className="w-7 h-7 rounded-full bg-sanrio-secondary bg-opacity-40 text-sanrio-text flex items-center justify-center hover:bg-sanrio-primary hover:text-white transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </h4>
                      <div className="text-xs font-mono text-sanrio-muted">{item.phonetic}</div>
                      <div className="text-sm font-sub font-semibold text-sanrio-text pt-0.5">
                        解释：{item.translation}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBookmark({
                        word: item.word,
                        translation: item.translation,
                        phonetic: item.phonetic,
                        grade: item.gradeKey,
                        unitName: item.unitName
                      })}
                      className="p-1 rounded-full text-sanrio-muted hover:text-orange-400"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          bookmarkedWords.some((b) => b.word.toLowerCase() === item.word.toLowerCase() && b.grade.toLowerCase() === item.gradeKey.toLowerCase())
                            ? "fill-orange-400 text-orange-400"
                            : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* On the spot spelling retry input bar */}
                  <div className="space-y-2 pt-2 border-t border-dashed border-sanrio-border">
                    <div className="text-xs text-sanrio-muted font-bold">⌨️ 自主单词重写评测：</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="在此拼写该词..."
                        value={currentInput}
                        onChange={(e) => setSpellInputs({ ...spellInputs, [item.word]: e.target.value })}
                        disabled={stateFeedback === "correct"}
                        className="flex-1 bg-sanrio-bg border border-sanrio-border rounded-xl px-3 py-1.5 text-xs text-sanrio-text focus:outline-none focus:ring-1 focus:ring-sanrio-primary"
                      />
                      <button
                        onClick={() => handleSpellRetrySubmit(item.word, item.word)}
                        disabled={stateFeedback === "correct" || !currentInput}
                        className="py-1.5 px-3 rounded-xl bg-sanrio-primary text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                      >
                        检查
                      </button>
                    </div>

                    {/* Feedback result stamps */}
                    {stateFeedback === "correct" && (
                      <div className="text-[10px] text-green-600 font-extrabold flex items-center gap-1 bg-green-50 p-1 rounded-md">
                        <Check className="w-3.5 h-3.5" />
                        <span>完全正确！自动从错题库清扫结案中...</span>
                      </div>
                    )}
                    {stateFeedback === "incorrect" && (
                      <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 bg-red-50 p-1 rounded-md">
                        <X className="w-3.5 h-3.5" />
                        <span>拼写有误，再仔细想想字母顺序吧 ✍️</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-10 bg-sanrio-card rounded-3xl border border-dashed border-sanrio-border space-y-3">
              <div className="text-4xl">🌸</div>
              <h4 className="text-base font-bold text-sanrio-text">干得漂亮！错题本空空如也！</h4>
              <p className="text-xs text-sanrio-muted">恭喜女儿通关所有的易错试题，多做随堂评测来积累吧！</p>
            </div>
          )}
        </div>
      )}

      {/* 📖 DICTIONARY MAIN INDEX GRID (If mistakes is NOT checked) */}
      {!showMistakesOnly && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-sanrio-muted font-bold">
            <span>找到 {filteredWords.length} 个核心英文单词：</span>
            <span>小贴士：点击单词卡，直达翻页多媒体学习</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredWords.map((item, idx) => {
              const isBookmarked = bookmarkedWords.some(
                (b) => b.word.toLowerCase() === item.word.toLowerCase() && b.grade.toLowerCase() === item.gradeKey.toLowerCase()
              );

              return (
                <div
                  key={idx}
                  className="bg-sanrio-card border rounded-3xl p-4.5 hover:border-sanrio-primary transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between h-40 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold bg-sanrio-secondary bg-opacity-40 text-sanrio-accent px-2 py-0.5 rounded-full select-none">
                        {getCleanGradeName(item.gradeKey)} · {item.unitName}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark({
                            word: item.word,
                            translation: item.translation,
                            phonetic: item.phonetic,
                            grade: item.gradeKey,
                            unitName: item.unitName
                          });
                        }}
                        className="p-1 rounded-full text-sanrio-muted hover:text-orange-400 cursor-pointer"
                      >
                        <Star className={`w-4.5 h-4.5 ${isBookmarked ? "fill-orange-400 text-orange-400" : ""}`} />
                      </button>
                    </div>

                    <h4 className="text-lg font-black text-sanrio-text tracking-wide select-all group-hover:text-sanrio-primary transition-colors flex items-center gap-1.5">
                      <span>{item.word}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(item.word, volume);
                        }}
                        className="w-6 h-6 rounded-full bg-sanrio-secondary bg-opacity-30 text-sanrio-text flex items-center justify-center hover:bg-sanrio-primary hover:text-white transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </h4>
                    <div className="text-[10px] font-mono text-sanrio-muted truncate">{item.phonetic}</div>
                    <div className="text-xs font-semibold text-sanrio-text pt-1.5 truncate">
                      {item.translation}
                    </div>
                  </div>

                  {/* Mini actions inside dict */}
                  {onSelectUnit && (
                    <div className="pt-2 border-t border-dashed border-sanrio-border flex justify-between items-center text-[10px] no-print">
                      <span className="text-sanrio-muted font-memo">
                        {item.unitObj.title}
                      </span>
                      <button
                        onClick={() => onSelectUnit(item.unitObj, "flashcards")}
                        className="text-sanrio-primary font-bold hover:underline"
                      >
                        卡片拼读 &rarr;
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-16 bg-sanrio-card rounded-3xl border border-dashed border-sanrio-border space-y-2">
              <div className="text-4xl">🔍</div>
              <h4 className="text-base font-bold text-sanrio-text">没有找到符合搜索条件的单词</h4>
              <p className="text-xs text-sanrio-muted">你可以换个关键词，或者是选择载入3-5年级单词重试噢！</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
