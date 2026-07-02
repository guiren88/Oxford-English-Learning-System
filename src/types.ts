import { Unit, Word } from "./data/vocabulary";

export interface Bookmark {
  word: string;
  translation: string;
  phonetic: string;
  grade: string;
  unitName: string;
}

export interface Mistake {
  word: string;
  translation: string;
  phonetic: string;
  grade: string;
  unitName: string;
  errorCount: number;
}

export type SanrioTheme = "theme-kuromi" | "theme-cinnamoroll" | "theme-melody" | "theme-purin" | "theme-dark";

export interface AppState {
  grade: string;
  activeView: "dashboard" | "flashcards" | "quiz" | "glossary" | "worksheet" | "wordsearch";
  selectedUnit: Unit | null;
  bookmarkedWords: Bookmark[];
  completedUnits: string[]; // Format: `${grade}_${unitName}`
  mistakes: Mistake[];
  studyHistory: string[]; // Date strings in format "YYYY-MM-DD"
  volume: number; // 0.0 to 3.0
  theme: SanrioTheme;
}
