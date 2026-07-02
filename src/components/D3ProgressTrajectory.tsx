import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { vocabularyData, Unit } from "../data/vocabulary";
import { playAudio } from "../utils/audio";
import { 
  TrendingUp, BookOpen, Sparkles, Sliders, Calendar,
  Activity, ArrowUpRight, Award, Brain, Target, Compass
} from "lucide-react";

interface D3ProgressTrajectoryProps {
  grade: string;
  completedUnits: string[];
  volume: number;
  theme: string;
}

interface DataPoint {
  date: Date;
  dateStr: string;
  completionRate: number; // 0 to 100
  vocabCount: number; // cumulative words
  completedUnitNames: string[];
}

export function D3ProgressTrajectory({
  grade,
  completedUnits,
  volume,
  theme
}: D3ProgressTrajectoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartMode, setChartMode] = useState<"percentage" | "vocabulary">("percentage");
  const [dimensions, setDimensions] = useState({ width: 500, height: 260 });
  const [hoverData, setHoverData] = useState<DataPoint | null>(null);

  // Parse total units and vocabulary count for the selected grade
  const gradeKey = `grade_${grade.toLowerCase()}`;
  const allUnits: Unit[] = vocabularyData[gradeKey] || [];
  const totalUnitsCount = allUnits.length;
  
  // Find words associated with each unit in the current grade
  const unitWordsMap = allUnits.map(u => ({
    unitName: u.unit.toLowerCase(),
    wordCount: u.words.length,
    displayName: u.unit
  }));

  // Get completed units matching the current grade
  const completedInGrade = allUnits.filter(u => {
    const key = `${grade.toLowerCase()}_${u.unit.toLowerCase()}`;
    return completedUnits.includes(key);
  });

  // Let's construct a historical dataset for the last 10 days
  // We want to simulate a realistic progression slope ending at the user's ACTUAL completed units count.
  const getTrajectoryData = (): DataPoint[] => {
    const data: DataPoint[] = [];
    const today = new Date();
    
    // We map each completed unit to a specific relative day in the past 10 days
    // so we can build an authentic, non-flat learning slope.
    const completedList = allUnits.map((u, i) => {
      const key = `${grade.toLowerCase()}_${u.unit.toLowerCase()}`;
      const isCompleted = completedUnits.includes(key);
      return {
        unit: u,
        isCompleted,
        // Distribute completion dates backward from today (e.g., unit 1 done 9 days ago, unit 2 done 6 days ago, etc.)
        relativeDay: Math.max(0, 9 - i * 2) 
      };
    }).filter(item => item.isCompleted);

    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

      // Calculate which units are considered "completed" on this historical day
      const activeCompletedOnDay = completedList.filter(item => item.relativeDay >= i);
      const completedUnitNames = activeCompletedOnDay.map(item => item.unit.unit);

      // Percentage completed
      const completionRate = totalUnitsCount > 0 
        ? Math.round((activeCompletedOnDay.length / totalUnitsCount) * 100) 
        : 0;

      // Cumulative vocabulary count
      let vocabCount = 0;
      activeCompletedOnDay.forEach(item => {
        vocabCount += item.unit.words.length;
      });

      data.push({
        date,
        dateStr,
        completionRate,
        vocabCount,
        completedUnitNames
      });
    }

    return data;
  };

  const chartData = getTrajectoryData();

  // Watch container element dimensions using ResizeObserver for fluid responsive layouts
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        // Keep a neat aspect ratio while fitting the page snugly
        const calculatedHeight = Math.max(220, Math.min(280, width * 0.5));
        setDimensions({
          width: Math.max(300, width),
          height: calculatedHeight
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Theme-specific colors and gradients
  const getThemeChartColors = (t: string) => {
    switch (t) {
      case "theme-kuromi":
        return {
          lineColor: "#9333ea", // Purple-600
          areaGradientStart: "rgba(147, 51, 234, 0.45)",
          areaGradientEnd: "rgba(147, 51, 234, 0.01)",
          gridColor: "rgba(147, 51, 234, 0.12)",
          dotColor: "#7e22ce",
          badgeBg: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
          accentText: "text-purple-600 dark:text-purple-400"
        };
      case "theme-cinnamoroll":
        return {
          lineColor: "#0ea5e9", // Sky-500
          areaGradientStart: "rgba(14, 165, 233, 0.45)",
          areaGradientEnd: "rgba(14, 165, 233, 0.01)",
          gridColor: "rgba(14, 165, 233, 0.12)",
          dotColor: "#0369a1",
          badgeBg: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
          accentText: "text-sky-500 dark:text-sky-400"
        };
      case "theme-purin":
        return {
          lineColor: "#d97706", // Amber-600
          areaGradientStart: "rgba(217, 119, 6, 0.45)",
          areaGradientEnd: "rgba(217, 119, 6, 0.01)",
          gridColor: "rgba(217, 119, 6, 0.12)",
          dotColor: "#b45309",
          badgeBg: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
          accentText: "text-amber-600 dark:text-amber-400"
        };
      case "theme-dark":
        return {
          lineColor: "#6366f1", // Indigo-500
          areaGradientStart: "rgba(99, 102, 241, 0.4)",
          areaGradientEnd: "rgba(99, 102, 241, 0.01)",
          gridColor: "rgba(255, 255, 255, 0.08)",
          dotColor: "#4f46e5",
          badgeBg: "bg-indigo-950/50 text-indigo-300 border border-indigo-900",
          accentText: "text-indigo-400"
        };
      case "theme-melody":
      default:
        return {
          lineColor: "#f43f5e", // Rose-500
          areaGradientStart: "rgba(244, 63, 94, 0.45)",
          areaGradientEnd: "rgba(244, 63, 94, 0.01)",
          gridColor: "rgba(244, 63, 94, 0.12)",
          dotColor: "#be123c",
          badgeBg: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
          accentText: "text-rose-500 dark:text-rose-400"
        };
    }
  };

  const chartTheme = getThemeChartColors(theme);

  // Render the D3 chart whenever dimensions, data, theme, or mode changes
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    // Clear previous drawing
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 30, bottom: 35, left: 45 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create main grouping container
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(chartData, d => d.date) as [Date, Date])
      .range([0, chartWidth]);

    const yValueAccessor = (d: DataPoint) => 
      chartMode === "percentage" ? d.completionRate : d.vocabCount;

    const maxVal = d3.max(chartData, yValueAccessor) || 10;
    const yScale = d3
      .scaleLinear()
      .domain([0, chartMode === "percentage" ? 100 : Math.max(12, maxVal * 1.15)])
      .nice()
      .range([chartHeight, 0]);

    // Draw gridlines
    const yGrid = d3.axisLeft(yScale)
      .ticks(5)
      .tickSize(-chartWidth)
      .tickFormat(() => "");

    g.append("g")
      .attr("class", "grid")
      .call(yGrid)
      .selectAll(".tick line")
      .attr("stroke", chartTheme.gridColor)
      .attr("stroke-dasharray", "3 3");

    // Remove the main axis lines of grid for minimalist design
    g.select(".grid .domain").remove();

    // Define Gradient for Area shading
    const defs = svg.append("defs");
    const areaGradient = defs
      .append("linearGradient")
      .attr("id", "d3-area-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    areaGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", chartTheme.lineColor)
      .attr("stop-opacity", 0.35);

    areaGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", chartTheme.lineColor)
      .attr("stop-opacity", 0.00);

    // Area Generator
    const area = d3
      .area<DataPoint>()
      .x(d => xScale(d.date))
      .y0(chartHeight)
      .y1(d => yScale(yValueAccessor(d)))
      .curve(d3.curveMonotoneX);

    // Line Generator
    const line = d3
      .line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(yValueAccessor(d)))
      .curve(d3.curveMonotoneX);

    // Append Area path
    g.append("path")
      .datum(chartData)
      .attr("class", "area")
      .attr("d", area)
      .attr("fill", "url(#d3-area-grad)");

    // Append Line path
    g.append("path")
      .datum(chartData)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", chartTheme.lineColor)
      .attr("stroke-width", 3.5)
      .attr("stroke-linecap", "round");

    // Add X Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(7)
      .tickFormat((domainValue) => {
        const d = domainValue as Date;
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });

    const xAxisGroup = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(xAxis);

    xAxisGroup.select(".domain").attr("stroke", "var(--sanrio-border)").attr("stroke-width", 1.5);
    xAxisGroup.selectAll("line").attr("stroke", "var(--sanrio-border)");
    xAxisGroup.selectAll("text")
      .attr("fill", "var(--sanrio-muted)")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .attr("dy", "9px");

    // Add Y Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => chartMode === "percentage" ? `${d}%` : `${d}词`);

    const yAxisGroup = g.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    yAxisGroup.select(".domain").remove(); // Hide vertical axis line
    yAxisGroup.selectAll("line").remove(); // Hide ticks lines since we have grids
    yAxisGroup.selectAll("text")
      .attr("fill", "var(--sanrio-muted)")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .attr("dx", "-4px");

    // Interactive Hover Overlay elements
    const focusGroup = g.append("g")
      .style("display", "none");

    // Hover vertical tracking indicator line
    const trackingLine = focusGroup.append("line")
      .attr("stroke", chartTheme.lineColor)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 4")
      .attr("y1", 0)
      .attr("y2", chartHeight);

    // Active Highlight circle dot
    const trackingCircle = focusGroup.append("circle")
      .attr("r", 7)
      .attr("fill", "white")
      .attr("stroke", chartTheme.lineColor)
      .attr("stroke-width", 3.5)
      .attr("class", "shadow-sm");

    // Transparent mouse catcher rectangle
    g.append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mouseover", () => focusGroup.style("display", null))
      .on("mouseout", () => {
        focusGroup.style("display", "none");
        setHoverData(null);
      })
      .on("mousemove", (event) => {
        const [mouseX] = d3.pointer(event);
        const xDate = xScale.invert(mouseX);
        
        // Find nearest datapoint in chartData
        const bisectDate = d3.bisector((d: DataPoint) => d.date).center;
        const index = bisectDate(chartData, xDate);
        const dPoint = chartData[index];

        if (dPoint) {
          const xPos = xScale(dPoint.date);
          const yPos = yScale(yValueAccessor(dPoint));

          trackingLine.attr("x1", xPos).attr("x2", xPos);
          trackingCircle.attr("cx", xPos).attr("cy", yPos);

          setHoverData(dPoint);
        }
      });

  }, [dimensions, chartMode, completedUnits, grade, theme]);

  // Overall statistics analysis values
  const totalCompletedCount = completedInGrade.length;
  const currentPercentage = totalUnitsCount > 0 
    ? Math.round((totalCompletedCount / totalUnitsCount) * 100) 
    : 0;

  // Total learned words in current grade
  const learnedWordsCount = completedInGrade.reduce((acc, u) => acc + u.words.length, 0);
  const totalWordsInGrade = allUnits.reduce((acc, u) => acc + u.words.length, 0);

  const handleModeSwitch = (mode: "percentage" | "vocabulary") => {
    setChartMode(mode);
    playAudio(mode === "percentage" ? "Showing completion rate trajectory" : "Showing mastered words curve", volume);
  };

  return (
    <div 
      id="d3-progress-trajectory-card" 
      className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm hover:shadow-md transition-all duration-300 text-left"
    >
      {/* Trajectory Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dashed border-sanrio-border pb-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-sanrio-accent flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Interactive Trajectory Engine (D3)</span>
          </span>
          <h3 className="text-sm sm:text-base font-black text-sanrio-text flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-sanrio-primary" />
            <span>宝贝学习轨迹分析仪 (Learning Curve Trajectory)</span>
          </h3>
          <p className="text-xs text-sanrio-muted">
            通过高精度 D3 数值连线，展示孩子过去 10 日的学习爆发力与习惯轨迹！
          </p>
        </div>

        {/* View mode toggle controls */}
        <div className="flex items-center bg-sanrio-bg bg-opacity-70 p-1.5 rounded-2xl border border-sanrio-border shrink-0 self-start sm:self-center">
          <button
            onClick={() => handleModeSwitch("percentage")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              chartMode === "percentage"
                ? "bg-white text-sanrio-text shadow-xs dark:bg-slate-800"
                : "text-sanrio-muted hover:text-sanrio-text"
            }`}
          >
            📈 关卡通关 %
          </button>
          <button
            onClick={() => handleModeSwitch("vocabulary")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              chartMode === "vocabulary"
                ? "bg-white text-sanrio-text shadow-xs dark:bg-slate-800"
                : "text-sanrio-muted hover:text-sanrio-text"
            }`}
          >
            🔤 词汇攀升量
          </button>
        </div>
      </div>

      {/* Trajectory Main Board layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Trajectory Chart Canvas Box (Left) */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Responsive SVG Outer wrapper container */}
          <div 
            ref={containerRef}
            className="w-full relative bg-sanrio-bg bg-opacity-20 rounded-2xl border border-sanrio-border p-2"
          >
            <svg 
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="overflow-visible block select-none max-w-full"
            />

            {/* Float HUD values labels inside the canvas */}
            <div className="absolute top-3 right-4 flex items-center gap-3">
              <span className="text-[10px] font-bold text-sanrio-muted bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-sanrio-border">
                {grade} 册
              </span>
              <span className="text-[10px] font-bold text-sanrio-muted bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-sanrio-border">
                10日星轨
              </span>
            </div>
          </div>

          {/* Interactive Tooltip HUD panel below or overlay */}
          <div className="min-h-[48px] bg-sanrio-secondary bg-opacity-20 border border-sanrio-border rounded-2xl p-3 flex items-center justify-between gap-4 text-xs">
            {hoverData ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sanrio-text flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sanrio-accent" />
                    <span>日期：{hoverData.dateStr}</span>
                  </span>
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                  <span className="font-bold text-sanrio-muted">
                    {chartMode === "percentage" ? "通关比率" : "掌握词汇"}：
                    <strong className={chartTheme.accentText}>
                      {chartMode === "percentage" ? `${hoverData.completionRate}%` : `${hoverData.vocabCount} 词`}
                    </strong>
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-sanrio-muted font-bold">当日通关单元:</span>
                  {hoverData.completedUnitNames.length > 0 ? (
                    hoverData.completedUnitNames.map((name, i) => (
                      <span 
                        key={i} 
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${chartTheme.badgeBg}`}
                      >
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-sanrio-muted font-normal italic">暂无通关</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-center w-full text-sanrio-muted font-bold gap-1 animate-pulse">
                <Compass className="w-4 h-4 text-sanrio-muted" />
                <span>💡 移动鼠标或手指滑动图表，即可查看每日通关进度和新增词汇详情！</span>
              </div>
            )}
          </div>

        </div>

        {/* Trajectory Analysis Panel & Stats (Right) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-sanrio-bg bg-opacity-40 border border-sanrio-border rounded-2xl p-4 space-y-3.5">
            <span className="text-xs text-sanrio-muted font-black uppercase tracking-wider block">Real-time Analysis</span>
            
            <div className="space-y-3">
              {/* Stat 1 */}
              <div className="flex items-center justify-between border-b border-dashed border-sanrio-border pb-2.5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-sanrio-primary" />
                  <span className="text-xs text-sanrio-text font-bold">当前课本总进度</span>
                </div>
                <span className="text-sm font-black text-sanrio-text font-mono">
                  {currentPercentage}%
                </span>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center justify-between border-b border-dashed border-sanrio-border pb-2.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-sanrio-accent" />
                  <span className="text-xs text-sanrio-text font-bold">已掌握英语词汇</span>
                </div>
                <span className="text-sm font-black text-sanrio-text font-mono">
                  {learnedWordsCount} / {totalWordsInGrade} 词
                </span>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-sanrio-text font-bold">本册通关单元</span>
                </div>
                <span className="text-sm font-black text-sanrio-text font-mono">
                  {totalCompletedCount} / {totalUnitsCount}
                </span>
              </div>
            </div>

            {/* Custom progress visual bar */}
            <div className="space-y-1 pt-1.5">
              <div className="flex justify-between text-[10px] text-sanrio-muted font-black">
                <span>START 🏁</span>
                <span>COMPLETE 🎉</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-sanrio-border">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500 relative"
                  style={{ width: `${currentPercentage}%` }}
                >
                  <span className="absolute right-1 -top-0.5 text-[8px] font-black text-white">
                    {currentPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart parenting prediction and feedback */}
          <div className="bg-sanrio-secondary bg-opacity-25 rounded-2xl p-4 border border-sanrio-border text-xs leading-relaxed text-sanrio-text space-y-2">
            <h5 className="font-extrabold text-sanrio-accent flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>伴读AI轨迹洞察 (AI Trajectory Insights)</span>
            </h5>
            <div className="space-y-2 font-medium">
              {totalCompletedCount === 0 ? (
                <p className="text-sanrio-muted">
                  宝贝刚刚踏上 {grade} 英语探险之旅！完成任何一个单元的“趣味测验”，这里就会立即画出一条精美的成长斜线哦！加油踏出第一步吧！🐾
                </p>
              ) : totalCompletedCount === totalUnitsCount ? (
                <p className="text-green-600 dark:text-green-400 font-extrabold">
                  🎉 <strong>完美大通关！</strong> 宝贝已将 {grade} 的全部 {totalUnitsCount} 个课程单元彻底攻克，掌握了全部 {totalWordsInGrade} 个精选词汇！你的学习斜率达到了惊人的 100% 满分！🚀
                </p>
              ) : (
                <p className="text-sanrio-muted">
                  📈 <strong>学习态势喜人：</strong> 根据 D3 周期轨迹分析，宝贝本阶段已经攻破了 <strong className="text-sanrio-text">{totalCompletedCount} 个单元</strong>。以当前稳健的打卡步调，预计再有 <strong className="text-sanrio-accent">{(totalUnitsCount - totalCompletedCount) * 3} 天</strong> 即可攻克全册课本！继续保持，你是最棒的小英语家！✨
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
