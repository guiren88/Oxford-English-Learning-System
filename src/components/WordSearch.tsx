import React, { useState, useEffect, useRef } from "react";
import { Unit, Word, vocabularyData } from "../data/vocabulary";
import { 
  Check, HelpCircle, RefreshCw, Sparkles, Volume2, 
  ChevronLeft, ArrowRight, Play, Award, HelpCircle as QuestionIcon,
  Smile, Trophy, Layers, Sliders, Volume1, MapPin
} from "lucide-react";
import { playAudio } from "../utils/audio";
import confetti from "canvas-confetti";

interface WordSearchProps {
  grade: string;
  volume: number;
  theme: string;
  onBackToDashboard: () => void;
}

interface PlacedWord {
  word: string;
  translation: string;
  coords: { r: number; c: number }[];
  found: boolean;
  color: string;
}

export function WordSearch({
  grade,
  volume,
  theme,
  onBackToDashboard
}: WordSearchProps) {
  const [selectedGrade, setSelectedGrade] = useState(grade);
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0);
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");
  const [score, setScore] = useState(0);

  // Grid sizing
  const GRID_SIZE = 10;

  // Selected cells path state
  const [startCell, setStartCell] = useState<{ r: number; c: number } | null>(null);
  const [currentCell, setCurrentCell] = useState<{ r: number; c: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Click-to-select fallback state (mobile-friendly start/end click)
  const [clickedCell, setClickedCell] = useState<{ r: number; c: number } | null>(null);

  // Generated grid states
  const [grid, setGrid] = useState<string[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [generationKey, setGenerationKey] = useState(0);

  // Get units for current selected grade
  const gradeUnits = vocabularyData[`grade_${selectedGrade.toLowerCase()}`] || [];
  const currentUnit = gradeUnits[selectedUnitIdx] || gradeUnits[0];

  // Colors for found words highlights
  const wordHighlightColors = [
    "bg-pink-100 border-pink-300 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800",
    "bg-sky-100 border-sky-300 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-850",
    "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    "bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    "bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800"
  ];

  // Generate grid when unit, grade, difficulty, or manual refresh triggers
  useEffect(() => {
    if (!currentUnit || !currentUnit.words || currentUnit.words.length === 0) return;

    const wordsToPlace = currentUnit.words;
    const tempGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(""));
    const tempPlaced: PlacedWord[] = [];
    
    // Convert to clean uppercase strings
    const sortedWords = [...wordsToPlace]
      .map(w => ({
        original: w.word,
        translation: w.translation,
        clean: w.word.toUpperCase().replace(/[^A-Z]/g, "")
      }))
      .filter(w => w.clean.length > 1 && w.clean.length <= GRID_SIZE)
      .sort((a, b) => b.clean.length - a.clean.length);

    // Set directions based on difficulty
    const directions = difficulty === "easy" 
      ? [
          { dr: 0, dc: 1 },  // Left to right
          { dr: 1, dc: 0 }   // Top to bottom
        ]
      : [
          { dr: 0, dc: 1 },  // Left to right
          { dr: 1, dc: 0 },  // Top to bottom
          { dr: 1, dc: 1 },  // Diagonal down-right
          { dr: -1, dc: 1 }, // Diagonal up-right
          { dr: 0, dc: -1 }, // Right to left
          { dr: -1, dc: 0 }  // Bottom to top
        ];

    // Attempt to place words
    sortedWords.forEach((wordData) => {
      const wordStr = wordData.clean;
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 150) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * GRID_SIZE);
        const startCol = Math.floor(Math.random() * GRID_SIZE);

        const endRow = startRow + dir.dr * (wordStr.length - 1);
        const endCol = startCol + dir.dc * (wordStr.length - 1);

        // Check boundary limits
        if (endRow >= 0 && endRow < GRID_SIZE && endCol >= 0 && endCol < GRID_SIZE) {
          let canPlace = true;
          const coords = [];

          for (let charIdx = 0; charIdx < wordStr.length; charIdx++) {
            const r = startRow + dir.dr * charIdx;
            const c = startCol + dir.dc * charIdx;
            const existingChar = tempGrid[r][c];

            if (existingChar !== "" && existingChar !== wordStr[charIdx]) {
              canPlace = false;
              break;
            }
            coords.push({ r, c });
          }

          if (canPlace) {
            // Write word to temp grid
            coords.forEach(({ r, c }, charIdx) => {
              tempGrid[r][c] = wordStr[charIdx];
            });

            tempPlaced.push({
              word: wordData.original,
              translation: wordData.translation,
              coords,
              found: false,
              color: wordHighlightColors[tempPlaced.length % wordHighlightColors.length]
            });
            placed = true;
          }
        }
      }
    });

    // Fill in remaining empty grid blocks with random capital letters
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (tempGrid[r][c] === "") {
          tempGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(tempGrid);
    setPlacedWords(tempPlaced);
    setStartCell(null);
    setCurrentCell(null);
    setIsDragging(false);
    setClickedCell(null);
    
    // Play greeting prompt audio
    playAudio(`Let's find words in Unit ${currentUnit.unit}!`, volume);
  }, [selectedGrade, selectedUnitIdx, difficulty, generationKey]);

  // Helper to get active theme colors and character designs
  const getThemeConfig = (t: string) => {
    switch (t) {
      case "theme-kuromi":
        return {
          headerBg: "from-purple-500 to-indigo-600 text-white",
          accentColor: "bg-purple-600 hover:bg-purple-700",
          accentText: "text-purple-600 dark:text-purple-400",
          mascotEmoji: "😈",
          mascotName: "酷洛米 (Kuromi)",
          greeting: "哼哼，藏在迷宫里的英语单词，你能全部找出来吗？看你的啦！💜"
        };
      case "theme-cinnamoroll":
        return {
          headerBg: "from-sky-400 to-blue-500 text-white",
          accentColor: "bg-sky-500 hover:bg-sky-600",
          accentText: "text-sky-500 dark:text-sky-400",
          mascotEmoji: "☁️",
          mascotName: "大耳狗 (Cinnamoroll)",
          greeting: "大耳狗把单词藏在软绵绵的字母云里喽，加油把它们拼出来吧！☁️✨"
        };
      case "theme-purin":
        return {
          headerBg: "from-amber-400 to-yellow-500 text-white",
          accentColor: "bg-amber-500 hover:bg-amber-600",
          accentText: "text-amber-600 dark:text-amber-400",
          mascotEmoji: "🍮",
          mascotName: "布丁狗 (Pompompurin)",
          greeting: "呼拉呼拉~ 焦糖布丁味的字母盘，里面藏了好吃的单词大布丁哦！🍮🐾"
        };
      case "theme-dark":
        return {
          headerBg: "from-slate-800 to-slate-950 text-white border-b border-slate-700",
          accentColor: "bg-indigo-600 hover:bg-indigo-700",
          accentText: "text-indigo-400",
          mascotEmoji: "🌌",
          mascotName: "星空精灵 (Star Spirit)",
          greeting: "古老的夜空星阵，连结亮丽的星轨即可拼写出英语奥秘！🌌✨"
        };
      case "theme-melody":
      default:
        return {
          headerBg: "from-pink-400 to-rose-400 text-white",
          accentColor: "bg-rose-500 hover:bg-rose-600",
          accentText: "text-rose-500 dark:text-rose-400",
          mascotEmoji: "🐰",
          mascotName: "美乐蒂 (My Melody)",
          greeting: "美乐蒂把红星草莓和可爱的单词放在城堡迷宫里，一起寻宝吧！🍓🌸"
        };
    }
  };

  const tConfig = getThemeConfig(theme);

  // Draw continuous straight path coordinates from start cell to end cell
  const getPathCells = (start: { r: number; c: number } | null, end: { r: number; c: number } | null) => {
    if (!start || !end) return [];
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    const isHorizontal = dr === 0;
    const isVertical = dc === 0;
    const isDiagonal = absDr === absDc;

    if (!isHorizontal && !isVertical && !isDiagonal) {
      return [start]; // Return starting point if not aligned in a straight line
    }

    const steps = Math.max(absDr, absDc);
    const stepR = dr === 0 ? 0 : dr / absDr;
    const stepC = dc === 0 ? 0 : dc / absDc;

    const path = [];
    for (let i = 0; i <= steps; i++) {
      path.push({
        r: start.r + stepR * i,
        c: start.c + stepC * i
      });
    }
    return path;
  };

  // Check if a list of cell coordinates matches any placed word (either forward or backward)
  const checkSelection = (path: { r: number; c: number }[]) => {
    if (path.length < 2) return null;

    for (const pw of placedWords) {
      if (pw.found) continue;

      const coords = pw.coords;
      if (path.length !== coords.length) continue;

      // Check forward match
      let forwardMatch = true;
      for (let i = 0; i < path.length; i++) {
        if (path[i].r !== coords[i].r || path[i].c !== coords[i].c) {
          forwardMatch = false;
          break;
        }
      }

      if (forwardMatch) return pw;

      // Check reverse match
      let reverseMatch = true;
      for (let i = 0; i < path.length; i++) {
        const revIdx = path.length - 1 - i;
        if (path[i].r !== coords[revIdx].r || path[i].c !== coords[revIdx].c) {
          reverseMatch = false;
          break;
        }
      }

      if (reverseMatch) return pw;
    }

    return null;
  };

  // Retrieve current active path (for drag highlighting or click previewing)
  const getActivePath = () => {
    if (isDragging) {
      return getPathCells(startCell, currentCell);
    }
    if (clickedCell && currentCell) {
      return getPathCells(clickedCell, currentCell);
    }
    if (clickedCell) {
      return [clickedCell];
    }
    return [];
  };

  const activePath = getActivePath();

  // Highlight check helper: checks if a cell is in the active highlighted path
  const isCellInPath = (r: number, c: number) => {
    return activePath.some(cell => cell.r === r && cell.c === c);
  };

  // Highlight check helper: returns word highlight classes if the cell is part of an already found word
  const getCellFoundStyle = (r: number, c: number) => {
    const foundWord = placedWords.find(pw => 
      pw.found && pw.coords.some(coord => coord.r === r && coord.c === c)
    );
    return foundWord ? foundWord.color : "";
  };

  // Mouse event triggers for drag and drop selection
  const handleCellMouseDown = (r: number, c: number) => {
    setClickedCell(null); // Cancel click fallback if user starts dragging
    setStartCell({ r, c });
    setCurrentCell({ r, c });
    setIsDragging(true);
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (isDragging) {
      setCurrentCell({ r, c });
    } else if (clickedCell) {
      setCurrentCell({ r, c });
    }
  };

  const handleCellMouseUp = () => {
    if (isDragging) {
      const path = getPathCells(startCell, currentCell);
      evaluatePath(path);
      setIsDragging(false);
      setStartCell(null);
      setCurrentCell(null);
    }
  };

  // Clean-up mouse up at window level
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setStartCell(null);
        setCurrentCell(null);
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDragging, startCell, currentCell]);

  // Click-to-select fallback triggers
  const handleCellClick = (r: number, c: number) => {
    if (!clickedCell) {
      setClickedCell({ r, c });
      setCurrentCell({ r, c });
      playAudio("Selected letter", volume);
    } else {
      // If clicked the same cell twice, cancel
      if (clickedCell.r === r && clickedCell.c === c) {
        setClickedCell(null);
        setCurrentCell(null);
        return;
      }

      const path = getPathCells(clickedCell, { r, c });
      const matched = evaluatePath(path);
      
      setClickedCell(null);
      setCurrentCell(null);
    }
  };

  // Shared path evaluator
  const evaluatePath = (path: { r: number; c: number }[]) => {
    const matchedWord = checkSelection(path);

    if (matchedWord) {
      // Mark word as found
      setPlacedWords(prev => prev.map(pw => 
        pw.word === matchedWord.word ? { ...pw, found: true } : pw
      ));
      setScore(prev => prev + 10);
      
      // Celebrate single correct find
      confetti({
        particleCount: 60,
        spread: 45,
        origin: { y: 0.8 }
      });
      
      // Pronounce found word
      playAudio(`Good job! You found ${matchedWord.word}! ${matchedWord.translation}!`, volume);
      return true;
    } else {
      // No match found
      if (path.length >= 2) {
        playAudio("Try again!", volume);
      }
      return false;
    }
  };

  // Level progress checking
  const foundCount = placedWords.filter(pw => pw.found).length;
  const totalCount = placedWords.length;
  const isCompleted = totalCount > 0 && foundCount === totalCount;

  // Trigger high completion reward
  useEffect(() => {
    if (isCompleted) {
      // Big explosion of stars
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      playAudio(`Excellent! You completed Unit ${currentUnit.unit} word search puzzle! ${tConfig.mascotName} gives you a big kiss!`, volume);
    }
  }, [isCompleted]);

  const handleNextUnit = () => {
    if (selectedUnitIdx < gradeUnits.length - 1) {
      setSelectedUnitIdx(prev => prev + 1);
    } else {
      // Loop back or reset
      setSelectedUnitIdx(0);
    }
    setScore(0);
  };

  const handleRegenerate = () => {
    setGenerationKey(prev => prev + 1);
    setScore(0);
  };

  return (
    <div id="wordsearch-view" className="max-w-5xl mx-auto px-4 py-2 space-y-6">
      
      {/* Game Header Banner */}
      <div className={`rounded-3xl p-6 bg-gradient-to-r ${tConfig.headerBg} shadow-md border-2 border-sanrio-border flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-white bg-opacity-25 flex items-center justify-center text-4xl select-none shadow-sm">
            🧩
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-black tracking-widest bg-white bg-opacity-20 px-2.5 py-0.5 rounded-full inline-block">
              Sanrio Spelling Playground
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              单词大搜索 • Word Search
            </h2>
            <p className="text-xs opacity-90 font-medium">
              在好玩的字母拼拼乐中，连结字母，巩固单词拼写记忆！
            </p>
          </div>
        </div>

        {/* Back and Reload controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-35 text-white rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 border border-white border-opacity-30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>换个花样 (Regen)</span>
          </button>
          <button
            onClick={onBackToDashboard}
            className="px-5 py-2 bg-white text-slate-800 hover:bg-slate-50 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span>返回大厅 (Dashboard)</span>
          </button>
        </div>
      </div>

      {/* Mascot encouragement box */}
      <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-4 flex items-center gap-4.5 text-left">
        <div className="text-3xl select-none bg-sanrio-bg p-2 rounded-2xl border border-dashed border-sanrio-border">
          {tConfig.mascotEmoji}
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-black text-sanrio-accent">{tConfig.mascotName} 悄悄话：</h4>
          <p className="text-xs text-sanrio-text font-semibold leading-relaxed">
            {tConfig.greeting}
          </p>
        </div>
      </div>

      {/* Configuration Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Grade Selection */}
        <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-4 flex flex-col justify-between text-left">
          <div className="flex items-center gap-2 border-b border-dashed border-sanrio-border pb-2.5 mb-2.5">
            <Layers className="w-4.5 h-4.5 text-sanrio-primary" />
            <span className="text-xs font-black text-sanrio-text">第一步：选择课本年级</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B"].map((g) => (
              <button
                key={g}
                onClick={() => {
                  setSelectedGrade(g);
                  setSelectedUnitIdx(0);
                  setScore(0);
                }}
                className={`py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                  selectedGrade.toLowerCase() === g.toLowerCase()
                    ? "bg-sanrio-primary text-white shadow-xs"
                    : "bg-sanrio-bg bg-opacity-65 text-sanrio-muted border border-sanrio-border hover:bg-opacity-100"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Selectors list inside grade */}
        <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-4 flex flex-col justify-between text-left">
          <div className="flex items-center gap-2 border-b border-dashed border-sanrio-border pb-2.5 mb-2.5">
            <MapPin className="w-4.5 h-4.5 text-sanrio-primary" />
            <span className="text-xs font-black text-sanrio-text">第二步：选择关卡单元</span>
          </div>
          <div className="flex items-center gap-1">
            <select
              value={selectedUnitIdx}
              onChange={(e) => {
                setSelectedUnitIdx(parseInt(e.target.value, 10));
                setScore(0);
              }}
              className="w-full bg-sanrio-bg border-2 border-sanrio-border rounded-2xl p-2.5 text-xs font-black text-sanrio-text focus:outline-none focus:border-sanrio-primary cursor-pointer"
            >
              {gradeUnits.map((u, index) => (
                <option key={index} value={index}>
                  {u.unit} - {u.title} ({u.words.length}词)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Difficulty controls */}
        <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-4 flex flex-col justify-between text-left">
          <div className="flex items-center gap-2 border-b border-dashed border-sanrio-border pb-2.5 mb-2.5">
            <Sliders className="w-4.5 h-4.5 text-sanrio-primary" />
            <span className="text-xs font-black text-sanrio-text">第三步：调整难度级别</span>
          </div>
          <div className="flex items-center justify-around gap-2.5">
            <button
              onClick={() => setDifficulty("easy")}
              className={`flex-1 py-2 px-3 rounded-2xl font-black text-xs transition-all cursor-pointer border-2 ${
                difficulty === "easy"
                  ? "bg-green-500 text-white border-green-600 shadow-xs"
                  : "bg-sanrio-bg bg-opacity-65 text-sanrio-muted border-sanrio-border hover:bg-opacity-100"
              }`}
            >
              🐣 简易 (仅横竖)
            </button>
            <button
              onClick={() => setDifficulty("hard")}
              className={`flex-1 py-2 px-3 rounded-2xl font-black text-xs transition-all cursor-pointer border-2 ${
                difficulty === "hard"
                  ? "bg-purple-600 text-white border-purple-700 shadow-xs"
                  : "bg-sanrio-bg bg-opacity-65 text-sanrio-muted border-sanrio-border hover:bg-opacity-100"
              }`}
            >
              🦁 烧脑 (加斜向/反向)
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Interface (Split Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Dynamic Grid Area (Spans 7 columns on large desktop) */}
        <div className="lg:col-span-7 bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-4 sm:p-6 space-y-4 text-center">
          
          <div className="flex items-center justify-between border-b border-dashed border-sanrio-border pb-3.5">
            <div className="text-left">
              <span className="text-xs text-sanrio-muted font-black uppercase tracking-wider block">Spelling Grid Stage</span>
              <h3 className="text-base font-black text-sanrio-text">字母大拼盘 (10x10)</h3>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-black">
              <div className="bg-sanrio-secondary bg-opacity-30 px-3.5 py-1.5 rounded-2xl border border-sanrio-border">
                🌟 得分: <span className="text-sanrio-accent font-bold text-sm font-mono">{score}</span> 分
              </div>
              <div className="bg-emerald-500 bg-opacity-15 text-emerald-600 px-3.5 py-1.5 rounded-2xl border border-emerald-200">
                🔍 进度: <span className="font-bold text-sm font-mono">{foundCount}/{totalCount}</span>
              </div>
            </div>
          </div>

          {/* Interactive Puffy Letter Grid block */}
          <div 
            id="wordsearch-grid-stage"
            className="aspect-square w-full max-w-[480px] mx-auto select-none bg-sanrio-bg bg-opacity-40 border-2 border-sanrio-border p-3 rounded-3xl grid grid-cols-10 grid-rows-10 gap-1.5 shadow-inner touch-none relative"
            onMouseLeave={handleCellMouseUp}
          >
            {grid.map((row, rIdx) => 
              row.map((letter, cIdx) => {
                const isSelected = isCellInPath(rIdx, cIdx);
                const foundStyle = getCellFoundStyle(rIdx, cIdx);
                const isClickStart = clickedCell && clickedCell.r === rIdx && clickedCell.c === cIdx;

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    onMouseDown={() => handleCellMouseDown(rIdx, cIdx)}
                    onMouseEnter={() => handleCellMouseEnter(rIdx, cIdx)}
                    onMouseUp={handleCellMouseUp}
                    onClick={() => handleCellClick(rIdx, cIdx)}
                    className={`aspect-square w-full rounded-xl sm:rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black font-mono transition-all border duration-100 cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-sanrio-primary text-white border-sanrio-accent scale-102 ring-2 ring-white/40 ring-offset-1 ring-offset-sanrio-primary shadow-xs z-10"
                        : isClickStart
                        ? "bg-sanrio-accent text-white border-sanrio-accent animate-pulse scale-105 z-10"
                        : foundStyle !== ""
                        ? `${foundStyle} border-transparent shadow-xs font-black opacity-95`
                        : "bg-white dark:bg-slate-900 text-sanrio-text border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 hover:scale-[1.03] hover:shadow-xs"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>

          <p className="text-[10px] sm:text-xs text-sanrio-muted font-bold text-center leading-relaxed">
            💡 <strong>连词小贴士</strong>：长按鼠标或手指在方格中<strong>拖拽</strong>单词！
            也可以<strong>点击第一个字母</strong>再<strong>点击最后一个字母</strong>一键框选哦！
          </p>

        </div>

        {/* Right Side: Target Word Checklist Checklist (Spans 5 columns on large desktop) */}
        <div className="lg:col-span-5 bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-5 space-y-4 text-left">
          
          <div className="border-b border-dashed border-sanrio-border pb-3.5">
            <span className="text-xs text-sanrio-muted font-black uppercase tracking-wider block">Search Targets</span>
            <h3 className="text-base font-black text-sanrio-text flex items-center gap-1.5">
              <span>🎯 寻宝词汇清单</span>
              <span className="text-[10px] bg-sanrio-accent text-white px-2 py-0.5 rounded-full">
                {currentUnit.unit}
              </span>
            </h3>
          </div>

          {/* List of Vocabulary words */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {placedWords.map((pw, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                  pw.found
                    ? "bg-green-50/50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900 dark:text-green-300"
                    : "bg-sanrio-bg bg-opacity-40 border-sanrio-border text-sanrio-text hover:bg-white dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Speaker Pronounce icon */}
                  <button
                    onClick={() => playAudio(pw.word, volume)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                      pw.found
                        ? "bg-green-500 text-white border-green-600 hover:bg-green-600"
                        : "bg-white dark:bg-slate-800 text-sanrio-primary border-sanrio-border hover:scale-105"
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-0.5">
                    <span className={`text-base font-black font-mono tracking-wide block ${pw.found ? "line-through opacity-65" : ""}`}>
                      {pw.word}
                    </span>
                    <span className="text-xs text-sanrio-muted font-bold block">
                      {pw.translation}
                    </span>
                  </div>
                </div>

                {/* Status Indicator checkmark / icon */}
                <div>
                  {pw.found ? (
                    <div className="bg-green-500 text-white rounded-full p-1.5 animate-bounce">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="text-[10px] font-extrabold text-sanrio-muted uppercase bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5 px-2.5 py-1 rounded-full border border-dashed border-sanrio-border flex items-center gap-1">
                      <QuestionIcon className="w-3.5 h-3.5" />
                      <span>待搜寻</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Educational Copilot instructions card */}
          <div className="bg-sanrio-secondary bg-opacity-20 border border-sanrio-border rounded-2xl p-4 space-y-2 text-xs leading-relaxed">
            <h5 className="font-extrabold text-sanrio-accent flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>拼写加能站 (Spelling Power Co-pilot)</span>
            </h5>
            <p className="text-sanrio-muted">
              <strong>拼写是阅读的基础！</strong> 找单词时，孩子会无意识地在大脑中反复拼读字母组合 (例如：b-o-o-k)。
            </p>
            <p className="text-sanrio-muted">
              点击单词左侧的喇叭可以收听地道美音哦。快来用彩虹色填满所有的单词块吧！🌈
            </p>
          </div>

        </div>

      </div>

      {/* Completion Dialog Congratulation Hero Screen */}
      {isCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-sanrio-border max-w-md w-full p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
            {/* Corner Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-sanrio-primary bg-opacity-10 rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-sanrio-accent bg-opacity-10 rounded-tr-full pointer-events-none" />

            <div className="text-5xl select-none animate-bounce pt-2">
              🎉
            </div>

            <div className="space-y-1.5">
              <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full text-white ${tConfig.accentColor} inline-block`}>
                {tConfig.mascotName} 颁奖典礼
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-sanrio-text">
                哇！拼写探险大胜利！
              </h3>
              <p className="text-xs text-sanrio-muted leading-relaxed font-bold px-4">
                你成功把 {currentUnit.unit} ({currentUnit.title}) 的所有英语单词宝宝都解救出来了！
              </p>
            </div>

            {/* Score summary block */}
            <div className="bg-sanrio-bg bg-opacity-65 border-2 border-sanrio-border rounded-2xl p-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <span className="text-[10px] text-sanrio-muted font-extrabold uppercase block">解救单词 (Words)</span>
                <span className="text-lg font-black text-sanrio-primary font-mono">{foundCount} / {totalCount}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-sanrio-muted font-extrabold uppercase block">奖励得分 (Score)</span>
                <span className="text-lg font-black text-sanrio-accent font-mono">+{score}</span>
              </div>
            </div>

            {/* Personalized Mascot encouragement quotes */}
            <div className="bg-rose-50 dark:bg-slate-800 rounded-2xl p-4.5 border border-dashed border-rose-200 dark:border-slate-700 text-left flex gap-3 items-start">
              <span className="text-3xl select-none">{tConfig.mascotEmoji}</span>
              <div className="space-y-1">
                <span className="text-[10px] text-sanrio-accent font-black block">{tConfig.mascotName} 精英伴读官</span>
                <p className="text-xs font-bold text-sanrio-text leading-relaxed">
                  “棒极了！你在 {difficulty === "easy" ? "🐣 简易模式" : "🦁 难关挑战"} 下顺利通关。你现在就像大耳狗大大的耳朵一样聪明哦！继续保持这种拼写手感，我们下个单元见！”
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={handleRegenerate}
                className="w-full sm:w-1/2 py-3 px-4 rounded-2xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                再玩一次 (Regen Grid)
              </button>
              <button
                onClick={handleNextUnit}
                className={`w-full sm:w-1/2 py-3 px-4 rounded-2xl text-xs font-black text-white transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm ${tConfig.accentColor}`}
              >
                <span>进入下一单元</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
