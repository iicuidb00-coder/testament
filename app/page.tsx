"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// ── 타입 정의 ──────────────────────────────────────────
type ThemeKey = keyof typeof THEMES;

interface BibleBook {
  id: number;
  name: string;
  abbr: string;
  eng: string;
  engAbbr: string;
  chapters: number;
  testament: string;
}

interface VerseData {
  verse: number;
  text: string;
  pk?: number;
  book: number;
  chapter: number;
}

interface Bookmark {
  key: string;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  date: string;
}

interface EditingNote {
  show: boolean;
  bookId: number | null;
  bookName: string;
  chapter: number | null;
  verse: number | null;
  text: string;
}
// ────────────────────────────────────────────────────────

// 구약 39권, 신약 27권 전체 66권 구조 정보 (장 수, 공식 약어 포함)
const BIBLE_BOOKS = [
  // 구약성경 (OT) - 39권
  { id: 1, name: "창세기", abbr: "창", eng: "Genesis", engAbbr: "Gen", chapters: 50, testament: "OT" },
  { id: 2, name: "출애굽기", abbr: "출", eng: "Exodus", engAbbr: "Exo", chapters: 40, testament: "OT" },
  { id: 3, name: "레위기", abbr: "레", eng: "Leviticus", engAbbr: "Lev", chapters: 27, testament: "OT" },
  { id: 4, name: "민수기", abbr: "민", eng: "Numbers", engAbbr: "Num", chapters: 36, testament: "OT" },
  { id: 5, name: "신명기", abbr: "신", eng: "Deuteronomy", engAbbr: "Deu", chapters: 34, testament: "OT" },
  { id: 6, name: "여호수아", abbr: "여", eng: "Joshua", engAbbr: "Jos", chapters: 24, testament: "OT" },
  { id: 7, name: "사사기", abbr: "사", eng: "Judges", engAbbr: "Jdg", chapters: 21, testament: "OT" },
  { id: 8, name: "룻기", abbr: "룻", eng: "Ruth", engAbbr: "Rut", chapters: 4, testament: "OT" },
  { id: 9, name: "사무엘상", abbr: "삼상", eng: "1 Samuel", engAbbr: "1Sa", chapters: 31, testament: "OT" },
  { id: 10, name: "사무엘하", abbr: "삼하", eng: "2 Samuel", engAbbr: "2Sa", chapters: 24, testament: "OT" },
  { id: 11, name: "열왕기상", abbr: "왕상", eng: "1 Kings", engAbbr: "1Ki", chapters: 22, testament: "OT" },
  { id: 12, name: "열왕기하", abbr: "왕하", eng: "2 Kings", engAbbr: "2Ki", chapters: 25, testament: "OT" },
  { id: 13, name: "역대기상", abbr: "대상", eng: "1 Chronicles", engAbbr: "1Ch", chapters: 29, testament: "OT" },
  { id: 14, name: "역대기하", abbr: "대하", eng: "2 Chronicles", engAbbr: "2Ch", chapters: 36, testament: "OT" },
  { id: 15, name: "에스라", abbr: "스", eng: "Ezra", engAbbr: "Ezr", chapters: 10, testament: "OT" },
  { id: 16, name: "느헤미야", abbr: "느", eng: "Nehemiah", engAbbr: "Neh", chapters: 13, testament: "OT" },
  { id: 17, name: "에스더", abbr: "에", eng: "Esther", engAbbr: "Est", chapters: 10, testament: "OT" },
  { id: 18, name: "욥기", abbr: "욥", eng: "Job", engAbbr: "Job", chapters: 42, testament: "OT" },
  { id: 19, name: "시편", abbr: "시", eng: "Psalms", engAbbr: "Psa", chapters: 150, testament: "OT" },
  { id: 20, name: "잠언", abbr: "잠", eng: "Proverbs", engAbbr: "Pro", chapters: 31, testament: "OT" },
  { id: 21, name: "전도서", abbr: "전", eng: "Ecclesiastes", engAbbr: "Ecc", chapters: 12, testament: "OT" },
  { id: 22, name: "아가", abbr: "아", eng: "Song of Solomon", engAbbr: "Sng", chapters: 8, testament: "OT" },
  { id: 23, name: "이사야", abbr: "사", eng: "Isaiah", engAbbr: "Isa", chapters: 66, testament: "OT" },
  { id: 24, name: "예레미야", abbr: "렘", eng: "Jeremiah", engAbbr: "Jer", chapters: 52, testament: "OT" },
  { id: 25, name: "예레미야 애가", abbr: "애", eng: "Lamentations", engAbbr: "Lam", chapters: 5, testament: "OT" },
  { id: 26, name: "에스겔", abbr: "겔", eng: "Ezekiel", engAbbr: "Ezk", chapters: 48, testament: "OT" },
  { id: 27, name: "다니엘", abbr: "단", eng: "Daniel", engAbbr: "Dan", chapters: 12, testament: "OT" },
  { id: 28, name: "호세아", abbr: "호", eng: "Hosea", engAbbr: "Hos", chapters: 14, testament: "OT" },
  { id: 29, name: "요엘", abbr: "욜", eng: "Joel", engAbbr: "Jol", chapters: 3, testament: "OT" },
  { id: 30, name: "아모스", abbr: "암", eng: "Amos", engAbbr: "Amo", chapters: 9, testament: "OT" },
  { id: 31, name: "오바디야", abbr: "옵", eng: "Obadiah", engAbbr: "Oba", chapters: 1, testament: "OT" },
  { id: 32, name: "요나", abbr: "욘", eng: "Jonah", engAbbr: "Jon", chapters: 4, testament: "OT" },
  { id: 33, name: "미가", abbr: "미", eng: "Micah", engAbbr: "Mic", chapters: 7, testament: "OT" },
  { id: 34, name: "나훔", abbr: "나", eng: "Nahum", engAbbr: "Nam", chapters: 3, testament: "OT" },
  { id: 35, name: "하박국", abbr: "하", eng: "Habakkuk", engAbbr: "Hab", chapters: 3, testament: "OT" },
  { id: 36, name: "스바냐", abbr: "습", eng: "Zephaniah", engAbbr: "Zep", chapters: 3, testament: "OT" },
  { id: 37, name: "학개", abbr: "학", eng: "Haggai", engAbbr: "Hag", chapters: 2, testament: "OT" },
  { id: 38, name: "스가랴", abbr: "슥", eng: "Zechariah", engAbbr: "Zec", chapters: 14, testament: "OT" },
  { id: 39, name: "말라기", abbr: "말", eng: "Malachi", engAbbr: "Mal", chapters: 4, testament: "OT" },

  // 신약성경 (NT) - 27권
  { id: 40, name: "마태복음", abbr: "마", eng: "Matthew", engAbbr: "Mat", chapters: 28, testament: "NT" },
  { id: 41, name: "마가복음", abbr: "막", eng: "Mark", engAbbr: "Mrk", chapters: 16, testament: "NT" },
  { id: 42, name: "누가복음", abbr: "누", eng: "Luke", engAbbr: "Luk", chapters: 24, testament: "NT" },
  { id: 43, name: "요한복음", abbr: "요", eng: "John", engAbbr: "Jhn", chapters: 21, testament: "NT" },
  { id: 44, name: "사도행전", abbr: "행", eng: "Acts", engAbbr: "Act", chapters: 28, testament: "NT" },
  { id: 45, name: "로마서", abbr: "롬", eng: "Romans", engAbbr: "Rom", chapters: 16, testament: "NT" },
  { id: 46, name: "고린도전서", abbr: "고전", eng: "1 Corinthians", engAbbr: "1Co", chapters: 16, testament: "NT" },
  { id: 47, name: "고린도후서", abbr: "고후", eng: "2 Corinthians", engAbbr: "2Co", chapters: 13, testament: "NT" },
  { id: 48, name: "갈라디아서", abbr: "갈", eng: "Galatians", engAbbr: "Gal", chapters: 6, testament: "NT" },
  { id: 49, name: "에베소서", abbr: "엡", eng: "Ephesians", engAbbr: "Eph", chapters: 6, testament: "NT" },
  { id: 50, name: "빌립보서", abbr: "빌", eng: "Philippians", engAbbr: "Php", chapters: 4, testament: "NT" },
  { id: 51, name: "골로새서", abbr: "골", eng: "Colossians", engAbbr: "Col", chapters: 4, testament: "NT" },
  { id: 52, name: "데살로니가전서", abbr: "살전", eng: "1 Thessalonians", engAbbr: "1Th", chapters: 5, testament: "NT" },
  { id: 53, name: "데살로니가후서", abbr: "살후", eng: "2 Thessalonians", engAbbr: "2Th", chapters: 3, testament: "NT" },
  { id: 54, name: "디모데전서", abbr: "딤전", eng: "1 Timothy", engAbbr: "1Ti", chapters: 6, testament: "NT" },
  { id: 55, name: "디모데후서", abbr: "딤후", eng: "2 Timothy", engAbbr: "2Ti", chapters: 4, testament: "NT" },
  { id: 56, name: "디도서", abbr: "딛", eng: "Titus", engAbbr: "Tit", chapters: 3, testament: "NT" },
  { id: 57, name: "빌레몬서", abbr: "몬", eng: "Philemon", engAbbr: "Phm", chapters: 1, testament: "NT" },
  { id: 58, name: "히브리서", abbr: "히", eng: "Hebrews", engAbbr: "Heb", chapters: 13, testament: "NT" },
  { id: 59, name: "야고보서", abbr: "야", eng: "James", engAbbr: "Jas", chapters: 5, testament: "NT" },
  { id: 60, name: "베드로전서", abbr: "벧전", eng: "1 Peter", engAbbr: "1Pe", chapters: 5, testament: "NT" },
  { id: 61, name: "베드로후서", abbr: "벧후", eng: "2 Peter", engAbbr: "2Pe", chapters: 3, testament: "NT" },
  { id: 62, name: "요한일서", abbr: "요일", eng: "1 John", engAbbr: "1Jn", chapters: 5, testament: "NT" },
  { id: 63, name: "요한이서", abbr: "요이", eng: "2 John", engAbbr: "2Jn", chapters: 1, testament: "NT" },
  { id: 64, name: "요한삼서", abbr: "요삼", eng: "3 John", engAbbr: "3Jn", chapters: 1, testament: "NT" },
  { id: 65, name: "유다서", abbr: "유", eng: "Jude", engAbbr: "Jud", chapters: 1, testament: "NT" },
  { id: 66, name: "요한계시록", abbr: "계", eng: "Revelation", engAbbr: "Rev", chapters: 22, testament: "NT" }
];

// 네트워크 지연이나 에러 대비용 기본 구절 데이터
const FALLBACK_VERSES: VerseData[] = [
  { verse: 1, book: 1, chapter: 1, text: "태초에 하나님이 천지를 창조하시니라" },
  { verse: 2, book: 1, chapter: 1, text: "땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 영은 수면 위에 운행하시니라" },
  { verse: 3, book: 1, chapter: 1, text: "하나님이 가라사대 빛이 있으라 하시매 빛이 있었고" },
  { verse: 4, book: 1, chapter: 1, text: "그 빛이 하나님의 보시기에 좋았더라 하나님이 빛과 어두움을 나누사" },
  { verse: 5, book: 1, chapter: 1, text: "빛을 낮이라 칭하시고 어두움을 밤이라 칭하시니라 저녁이 되며 아침이 되니 이는 첫째 날이니라" }
];

const THEMES = {
  light: {
    name: "라이트",
    bg: "bg-amber-50/20 text-slate-800",
    card: "bg-white border-slate-200/80 shadow-sm",
    primary: "text-emerald-700 border-emerald-200 bg-emerald-50/50",
    buttonActive: "bg-emerald-600 text-white hover:bg-emerald-700",
    buttonInactive: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    panelBg: "bg-slate-50 border-slate-200",
    verseText: "text-slate-800",
    verseNum: "text-emerald-600 font-bold",
    highlightBg: "bg-emerald-100/70 border-emerald-300",
    navbar: "bg-white border-slate-200",
    sidebar: "bg-slate-50 border-slate-200",
    accent: "text-emerald-600",
    accentBg: "bg-emerald-50"
  },
  sepia: {
    name: "세피아",
    bg: "bg-[#FDF6E3] text-[#586E75]",
    card: "bg-[#EEE8D5] border-[#D3C6A2]",
    primary: "text-[#B58900] border-[#E6D4A7] bg-[#FDF6E3]",
    buttonActive: "bg-[#B58900] text-white hover:bg-[#A07800]",
    buttonInactive: "bg-[#EEE8D5] text-[#586E75] hover:bg-[#E4DBBF]",
    panelBg: "bg-[#EEE8D5] border-[#D3C6A2]",
    verseText: "text-[#3F4F54] font-medium",
    verseNum: "text-[#B58900] font-bold",
    highlightBg: "bg-[#FFEAA7]/60 border-[#D3C6A2]",
    navbar: "bg-[#EEE8D5] border-[#D3C6A2]",
    sidebar: "bg-[#F7F1DF] border-[#D3C6A2]",
    accent: "text-[#B58900]",
    accentBg: "bg-[#FDF6E3]"
  },
  dark: {
    name: "다크",
    bg: "bg-slate-900 text-slate-200",
    card: "bg-slate-800 border-slate-700 shadow-xl",
    primary: "text-emerald-400 border-slate-700 bg-slate-800",
    buttonActive: "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
    buttonInactive: "bg-slate-800 text-slate-300 hover:bg-slate-700",
    panelBg: "bg-slate-800 border-slate-700",
    verseText: "text-slate-200",
    verseNum: "text-emerald-400 font-bold",
    highlightBg: "bg-emerald-950/80 border-emerald-700",
    navbar: "bg-slate-900 border-slate-800",
    sidebar: "bg-slate-950 border-slate-800",
    accent: "text-emerald-400",
    accentBg: "bg-slate-900"
  },
  oled: {
    name: "OLED 블랙",
    bg: "bg-black text-zinc-300",
    card: "bg-zinc-950 border-zinc-800",
    primary: "text-emerald-400 border-zinc-800 bg-zinc-950",
    buttonActive: "bg-emerald-500 text-black hover:bg-emerald-400",
    buttonInactive: "bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
    panelBg: "bg-zinc-950 border-zinc-900",
    verseText: "text-zinc-100",
    verseNum: "text-emerald-400 font-bold",
    highlightBg: "bg-emerald-950/60 border-emerald-900",
    navbar: "bg-black border-zinc-900",
    sidebar: "bg-black border-zinc-900",
    accent: "text-emerald-400",
    accentBg: "bg-zinc-950"
  }
};

export default function App() {
  // 상태 변수 정의
  const [currentBook, setCurrentBook] = useState<BibleBook>(BIBLE_BOOKS[0]);
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [verses, setVerses] = useState<VerseData[]>(FALLBACK_VERSES);
  const [parallelVerses, setParallelVerses] = useState<VerseData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 내비게이션 및 UI 모드 관리
  const [activeTab, setActiveTab] = useState<string>("read");
  const [selectedBookForTOC, setSelectedBookForTOC] = useState<BibleBook | null>(null);
  const [testamentFilter, setTestamentFilter] = useState<string>("ALL");

  // 뷰 세팅 관리 (개인 취향)
  const [theme, setTheme] = useState<ThemeKey>("light");
  const [fontSize, setFontSize] = useState<string>("lg");
  const [fontFamily, setFontFamily] = useState<string>("serif");
  const [parallelVersion, setParallelVersion] = useState<string>("NONE");

  // 구절 선택 및 복사 기능 관련
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [copyFormat, setCopyFormat] = useState<string>("kakaotalk");

  // 북마크 및 개인 노트 정보 (LocalStorage 관리)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<EditingNote>({ show: false, bookId: null, bookName: "", chapter: null, verse: null, text: "" });

  // 검색 상태
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<VerseData[]>([]);
  const [searchSuccessMessage, setSearchSuccessMessage] = useState<string>("");

  // 모바일 사이드바 토글
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // 토스트 피드백 메시지
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const activeTheme = THEMES[theme];
  // verseRef 제거됨 (버그 7 수정: getElementById로 스크롤 처리하므로 dead code였음)

  // 앱 최초 구동 시 로컬스토리지에서 북마크 및 노트 로드
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem('onbible_bookmarks');
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
      const savedNotes = localStorage.getItem('onbible_notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
      const savedTheme = localStorage.getItem('onbible_theme');
      if (savedTheme && savedTheme in THEMES) {
        setTheme(savedTheme as ThemeKey);
      }
      const savedFontSize = localStorage.getItem('onbible_fontsize');
      if (savedFontSize) {
        setFontSize(savedFontSize);
      }
      const savedFontFamily = localStorage.getItem('onbible_fontfamily');
      if (savedFontFamily) {
        setFontFamily(savedFontFamily);
      }
    } catch (e) {
      console.error("로컬 스토리지 데이터를 로드하는데 실패했습니다.", e);
    }
  }, []);

  // 북마크 저장 변경 시 로컬 스토리지에 업데이트
  const updateBookmarks = (newBookmarks: Bookmark[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('onbible_bookmarks', JSON.stringify(newBookmarks));
  };

  // 노트 변경 시 로컬 스토리지에 업데이트
  const updateNotes = (newNotes: Record<string, string>) => {
    setNotes(newNotes);
    localStorage.setItem('onbible_notes', JSON.stringify(newNotes));
  };

  // 알림 토스트 출력 헬퍼
  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 2500);
  };

  // 성경 데이터 요청 (bolls.life API 연동)
  useEffect(() => {
    let active = true;

    async function fetchChapterData() {
      setLoading(true);
      setError(null);
      setSelectedVerses([]); // 장이 바뀌면 선택 해제

      try {
        // 1단계: 개역한글(KRV) 텍스트 불러오기
        const resKR = await fetch(`https://bolls.life/get-text/KRV/${currentBook.id}/${currentChapter}/`);
        if (!resKR.ok) throw new Error("성경 데이터를 가져오는데 실패했습니다.");
        const dataKR = await resKR.json();

        if (active) {
          // bolls.life API는 텍스트를 [{verse: 1, text: "..."}, ...] 형태로 반환함
          setVerses(dataKR);
        }

        // 2단계: 영문 대조 버전 활성화 시 추가 데이터 불러오기
        if (parallelVersion !== "NONE") {
          const resEN = await fetch(`https://bolls.life/get-text/${parallelVersion}/${currentBook.id}/${currentChapter}/`);
          if (resEN.ok) {
            const dataEN = await resEN.json();
            if (active) {
              setParallelVerses(dataEN);
            }
          } else {
            if (active) setParallelVerses([]);
          }
        } else {
          if (active) setParallelVerses([]);
        }

      } catch (err) {
        console.error(err);
        if (active) {
          setError("실시간 성경을 읽어오지 못했습니다. 네트워크 상태를 확인해주세요. (기본 구절 대체)");
          setVerses(FALLBACK_VERSES);
          setParallelVerses([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchChapterData();

    return () => {
      active = false;
    };
  }, [currentBook, currentChapter, parallelVersion]);

  // 이전 장 / 다음 장 이동 기능 (버그 1 수정: useCallback으로 stale closure 방지)
  const handlePrevChapter = useCallback(() => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    } else {
      const currentIdx = BIBLE_BOOKS.findIndex(b => b.id === currentBook.id);
      if (currentIdx > 0) {
        const prevBook = BIBLE_BOOKS[currentIdx - 1];
        setCurrentBook(prevBook);
        setCurrentChapter(prevBook.chapters);
        showToast(`${prevBook.name} ${prevBook.chapters}장으로 이동`);
      } else {
        showToast("성경의 시작입니다.");
      }
    }
  }, [currentBook, currentChapter]);

  const handleNextChapter = useCallback(() => {
    if (currentChapter < currentBook.chapters) {
      setCurrentChapter(currentChapter + 1);
    } else {
      const currentIdx = BIBLE_BOOKS.findIndex(b => b.id === currentBook.id);
      if (currentIdx < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[currentIdx + 1];
        setCurrentBook(nextBook);
        setCurrentChapter(1);
        showToast(`${nextBook.name} 1장으로 이동`);
      } else {
        showToast("성경의 마지막입니다.");
      }
    }
  }, [currentBook, currentChapter]);

  // 키보드 방향키 조작 지원 (독서 편의성)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== "read") return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

      if (e.key === "ArrowLeft") {
        handlePrevChapter();
      } else if (e.key === "ArrowRight") {
        handleNextChapter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, handlePrevChapter, handleNextChapter]);

  // HTML 태그 제거용 정규식 도우미
  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  // 다중 선택된 구절을 복사하기 좋은 포맷으로 생성
  const buildCopyText = () => {
    if (selectedVerses.length === 0) return "";

    // 정렬된 순서대로 절 가공
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    const bookTitle = currentBook.name;
    const chap = currentChapter;
    
    let rangeStr = "";
    if (sortedVerses.length === 1) {
      rangeStr = `${sortedVerses[0]}절`;
    } else {
      rangeStr = `${sortedVerses[0]}-${sortedVerses[sortedVerses.length - 1]}절`;
    }

    let result = "";

    if (copyFormat === "kakaotalk") {
      result += `✨ 오늘의 성경 말씀 ✨\n`;
      result += `📖 [ ${bookTitle} ${chap}장 ${rangeStr} ]\n`;
      result += `──────────────────\n`;
      
      sortedVerses.forEach(vNum => {
        const item = verses.find(v => v.verse === vNum);
        const text = item ? stripHtml(item.text) : "";
        result += `${vNum}. ${text}\n`;

        // 대조 성경 활성화 시 영어 텍스트 추가
        if (parallelVersion !== "NONE") {
          const enItem = parallelVerses.find(v => v.verse === vNum);
          if (enItem) {
            result += `   (${parallelVersion}) ${stripHtml(enItem.text)}\n`;
          }
        }
      });
      result += `──────────────────\n`;
      result += `🙏 평안한 하루 되세요. (개역한글 성경)`;
    } else if (copyFormat === "standard") {
      result += `${bookTitle} ${chap}:${rangeStr} (개역한글)\n`;
      sortedVerses.forEach(vNum => {
        const item = verses.find(v => v.verse === vNum);
        const text = item ? stripHtml(item.text) : "";
        
        if (parallelVersion !== "NONE") {
          const enItem = parallelVerses.find(v => v.verse === vNum);
          const enText = enItem ? ` / [${parallelVersion}] ${stripHtml(enItem.text)}` : "";
          result += `[${vNum}] ${text}${enText}\n`;
        } else {
          result += `[${vNum}] ${text}\n`;
        }
      });
    } else {
      // Raw: 군더더기 없는 원본형식
      sortedVerses.forEach(vNum => {
        const item = verses.find(v => v.verse === vNum);
        const text = item ? stripHtml(item.text) : "";
        result += `${bookTitle} ${chap}:${vNum} ${text}\n`;
        if (parallelVersion !== "NONE") {
          const enItem = parallelVerses.find(v => v.verse === vNum);
          if (enItem) {
            result += `(${parallelVersion}) ${bookTitle} ${chap}:${vNum} ${stripHtml(enItem.text)}\n`;
          }
        }
      });
    }

    return result;
  };

  const handleCopyToClipboard = async () => {
    const textToCopy = buildCopyText();
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast(`${selectedVerses.length}개 구절 복사 완료! 붙여넣기 하세요.`);
    } catch (err) {
      // 폴백용 복사 방식
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast(`${selectedVerses.length}개 구절 복사 완료!`);
      } catch (e) {
        showToast("클립보드 복사에 실패했습니다. 직접 복사해주세요.");
      }
      document.body.removeChild(textArea);
    }
  };

  // 성경 구절 클릭 핸들러 (다중 선택 대응)
  const handleVerseClick = (verseNum: number) => {
    setSelectedVerses(prev => {
      if (prev.includes(verseNum)) {
        return prev.filter(v => v !== verseNum);
      } else {
        return [...prev, verseNum];
      }
    });
  };

  // 북마크 토글 기능
  const handleToggleBookmark = (verseNum: number) => {
    const key = `${currentBook.id}-${currentChapter}-${verseNum}`;
    const exists = bookmarks.some(b => b.key === key);

    if (exists) {
      const filtered = bookmarks.filter(b => b.key !== key);
      updateBookmarks(filtered);
      showToast("북마크가 해제되었습니다.");
    } else {
      const targetVerse = verses.find(v => v.verse === verseNum);
      const text = targetVerse ? stripHtml(targetVerse.text) : "";
      const newBookmark = {
        key,
        bookId: currentBook.id,
        bookName: currentBook.name,
        chapter: currentChapter,
        verse: verseNum,
        text,
        date: new Date().toLocaleDateString()
      };
      updateBookmarks([...bookmarks, newBookmark]);
      showToast("북마크에 추가되었습니다.");
    }
  };

  // 노트 편집 및 저장
  const handleOpenNoteEditor = (verseNum: number) => {
    const key = `${currentBook.id}-${currentChapter}-${verseNum}`;
    const currentNoteText = notes[key] || "";
    setEditingNote({
      show: true,
      bookId: currentBook.id,
      bookName: currentBook.name,
      chapter: currentChapter,
      verse: verseNum,
      text: currentNoteText
    });
  };

  const handleSaveNote = () => {
    const key = `${editingNote.bookId}-${editingNote.chapter}-${editingNote.verse}`;
    const updatedNotes = { ...notes };
    if (editingNote.text.trim() === "") {
      delete updatedNotes[key];
      showToast("메모가 삭제되었습니다.");
    } else {
      updatedNotes[key] = editingNote.text;
      showToast("메모가 저장되었습니다.");
    }
    updateNotes(updatedNotes);
    setEditingNote({ show: false, bookId: null, bookName: "", chapter: null, verse: null, text: "" });
  };

  // 성경 통합 검색 처리
  const handleSearch = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchResults([]);
    setSearchSuccessMessage("");

    try {
      // bolls.life 검색 API 활용
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      const res = await fetch(`https://bolls.life/search/KRV/?search=${encodedQuery}&limit=100`);
      if (!res.ok) throw new Error("검색 요청에 오류가 발생했습니다.");

      const data = await res.json();
      // bolls.life API는 배열을 직접 반환하거나 { results, total } 구조를 반환함 (버그 6 수정)
      if (Array.isArray(data)) {
        setSearchResults(data);
        setSearchSuccessMessage(`총 ${data.length}개의 구절이 검색되었습니다.`);
      } else if (data && data.results) {
        setSearchResults(data.results);
        setSearchSuccessMessage(`총 ${data.total}개의 구절이 검색되었습니다.`);
      } else {
        setSearchResults([]);
        setSearchSuccessMessage("검색 결과가 없습니다.");
      }
    } catch (err) {
      console.error(err);
      setSearchSuccessMessage("검색 중 에러가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSearchLoading(false);
    }
  };

  // 검색 결과 클릭 시 본문 이동 및 해당 구절 하이라이트
  const handleJumpToSearchVerse = (bookId: number, chapterNum: number, verseNum: number) => {
    const targetBook = BIBLE_BOOKS.find(b => b.id === bookId);
    if (targetBook) {
      setCurrentBook(targetBook);
      setCurrentChapter(chapterNum);
      setActiveTab("read");
      setIsSidebarOpen(false);
      
      // 이동 후 스크롤링 및 임시 하이라이트 부여
      setTimeout(() => {
        setSelectedVerses([verseNum]);
        const element = document.getElementById(`verse-${verseNum}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 600);
      
      showToast(`${targetBook.name} ${chapterNum}장 ${verseNum}절로 이동했습니다.`);
    }
  };

  // "창 1:1" 또는 "요한복음 3장" 같은 빠른 성경 이동 파서
  const [quickJumpText, setQuickJumpText] = useState<string>("");
  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickJumpText.trim();
    if (!query) return;

    // 공백, 한글숫자 분리용 정규식 (버그 5 수정: 1사무엘, 2Ki 등 숫자 시작 책명 허용)
    // 예: "창 1:1", "창세기 1장 1절", "요 3:16", "1사 3:16", "1Sa 3:16"
    const regex = /^(\d?[가-힣a-zA-Z가-힣]+)\s*(\d+)(?:[장:\s]+(\d+))?/;
    const match = query.match(regex);

    if (match) {
      const bookNameInput = match[1];
      const chapterInput = parseInt(match[2]);
      const verseInput = match[3] ? parseInt(match[3]) : null;

      // 책 검색 (이름 또는 약어 대조)
      const foundBook = BIBLE_BOOKS.find(b => 
        b.name.includes(bookNameInput) || 
        b.abbr === bookNameInput || 
        b.eng.toLowerCase() === bookNameInput.toLowerCase() ||
        b.engAbbr.toLowerCase() === bookNameInput.toLowerCase()
      );

      if (foundBook) {
        if (chapterInput > 0 && chapterInput <= foundBook.chapters) {
          setCurrentBook(foundBook);
          setCurrentChapter(chapterInput);
          setQuickJumpText("");
          setActiveTab("read");

          if (verseInput) {
            setTimeout(() => {
              setSelectedVerses([verseInput]);
              const el = document.getElementById(`verse-${verseInput}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
            showToast(`${foundBook.name} ${chapterInput}장 ${verseInput}절로 이동`);
          } else {
            showToast(`${foundBook.name} ${chapterInput}장으로 이동`);
          }
        } else {
          showToast(`그 책에는 ${chapterInput}장이 존재하지 않습니다 (최대 ${foundBook.chapters}장).`);
        }
      } else {
        showToast("해당 성경책 이름을 찾을 수 없습니다. (예: 창 1:1, 요 3:16)");
      }
    } else {
      showToast("입력 형식이 맞지 않습니다. 예: '창 1:1', '요한 3:16'");
    }
  };

  const filteredBooksForTOC = useMemo(() => {
    if (testamentFilter === "ALL") return BIBLE_BOOKS;
    return BIBLE_BOOKS.filter(b => b.testament === testamentFilter);
  }, [testamentFilter]);

  const fontSizeClass = {
    sm: "text-sm md:text-base leading-relaxed md:leading-loose",
    md: "text-base md:text-lg leading-relaxed md:leading-loose",
    lg: "text-lg md:text-xl leading-loose",
    xl: "text-xl md:text-2xl leading-loose",
    "2xl": "text-2xl md:text-3xl leading-loose"
  }[fontSize];

  const fontStyle = fontFamily === "serif" ? "font-serif" : "font-sans";

  return (
    <div className={`min-h-screen transition-colors duration-200 ${activeTheme.bg} ${fontStyle}`}>
      
      {/* 토스트 피드백 알림 */}
      {toast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-medium px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce border border-emerald-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toast.message}</span>
        </div>
      )}

      {/* 헤더 및 글로벌 대시보드 */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 ${activeTheme.navbar} bg-opacity-95 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* 로고 & 탭 선택 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("read")}>
              <span className="text-2xl">📖</span>
              <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                온성경 <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">개역한글</span>
              </h1>
            </div>

            {/* 모바일 햄버거 메뉴 (책 내비게이터 토글) */}
            <div className="flex items-center space-x-2 md:hidden">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg border ${activeTheme.card} focus:outline-none`}
                aria-label="성경 목록 열기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>

          {/* 간편 이동창 */}
          <form onSubmit={handleQuickJump} className="flex-1 max-w-md mx-auto md:mx-4 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="빠른 이동 (예: 창 1:1, 요 3:16, 롬 8)"
                value={quickJumpText}
                onChange={(e) => setQuickJumpText(e.target.value)}
                className={`w-full pl-4 pr-10 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${activeTheme.card}`}
              />
              <button type="submit" className="absolute right-3 top-2.5 text-emerald-600 hover:text-emerald-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>

          {/* 메인 탭 선택 및 설정 */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button 
              onClick={() => { setActiveTab("toc"); setSelectedBookForTOC(null); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${
                activeTab === "toc" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : `hover:bg-slate-100 ${activeTheme.buttonInactive}`
              }`}
            >
              📚 목차
            </button>
            <button 
              onClick={() => setActiveTab("read")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${
                activeTab === "read" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : `hover:bg-slate-100 ${activeTheme.buttonInactive}`
              }`}
            >
              📖 성경읽기
            </button>
            <button 
              onClick={() => setActiveTab("search")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${
                activeTab === "search" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : `hover:bg-slate-100 ${activeTheme.buttonInactive}`
              }`}
            >
              🔍 전체검색
            </button>
            <button 
              onClick={() => setActiveTab("bookmark")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${
                activeTab === "bookmark" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : `hover:bg-slate-100 ${activeTheme.buttonInactive}`
              }`}
            >
              ⭐ 북마크
            </button>
            <button 
              onClick={() => setActiveTab("note")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${
                activeTab === "note" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : `hover:bg-slate-100 ${activeTheme.buttonInactive}`
              }`}
            >
              📝 노트
            </button>
          </div>

        </div>
      </header>

      {/* 메인 레이아웃 콘테이너 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {}
          {/* 왼쪽 사이드바 (PC: 항상노출 / 모바일: 슬라이드오버 대시보드) */}
          <aside
            className={`lg:col-span-3 transition-all duration-300 ${
              isSidebarOpen ? "fixed inset-0 z-50 bg-black/50 lg:bg-transparent lg:static" : "hidden lg:block"
            }`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <div 
              className={`w-80 lg:w-full h-full lg:h-auto min-h-[70vh] lg:min-h-0 flex flex-col p-5 border rounded-2xl shadow-xl lg:shadow-none transition-transform duration-300 ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
              } ${activeTheme.sidebar}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모바일 닫기 버튼 */}
              <div className="flex items-center justify-between mb-4 lg:hidden border-b pb-2">
                <span className="font-bold text-sm">성경 선택기</span>
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="p-1 rounded-full hover:bg-slate-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 구약/신약 탭 간편 필터 */}
              <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl mb-4 text-xs font-semibold">
                <button 
                  onClick={() => setTestamentFilter("ALL")} 
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${testamentFilter === "ALL" ? "bg-white dark:bg-slate-700 shadow-sm font-bold" : ""}`}
                >
                  전체
                </button>
                <button 
                  onClick={() => setTestamentFilter("OT")} 
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${testamentFilter === "OT" ? "bg-white dark:bg-slate-700 shadow-sm font-bold" : ""}`}
                >
                  구약 ({BIBLE_BOOKS.filter(b => b.testament === "OT").length})
                </button>
                <button 
                  onClick={() => setTestamentFilter("NT")} 
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${testamentFilter === "NT" ? "bg-white dark:bg-slate-700 shadow-sm font-bold" : ""}`}
                >
                  신약 ({BIBLE_BOOKS.filter(b => b.testament === "NT").length})
                </button>
              </div>

              {/* 책 리스트 & 스크롤 영역 */}
              <div className="flex-1 max-h-[60vh] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                {BIBLE_BOOKS.filter(book => testamentFilter === "ALL" || book.testament === testamentFilter).map(book => {
                  const isCurrent = currentBook.id === book.id;
                  return (
                    <div key={book.id}>
                      <button
                        onClick={() => {
                          setCurrentBook(book);
                          setCurrentChapter(1);
                          setIsSidebarOpen(false);
                          if (activeTab !== "read") {
                            setActiveTab("read");
                          }
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                          isCurrent 
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10" 
                            : `border-transparent hover:border-slate-300 dark:hover:border-slate-700 ${activeTheme.buttonInactive}`
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${isCurrent ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}>
                            {book.abbr}
                          </span>
                          <span>{book.name}</span>
                        </div>
                        <span className="text-xs opacity-75 font-normal">{book.chapters}장</span>
                      </button>

                      {/* 선택된 책의 장 선택 단추들 */}
                      {isCurrent && (
                        <div className="grid grid-cols-5 gap-1 p-2 mt-1 rounded-xl bg-slate-100/60 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                          {Array.from({ length: book.chapters }, (_, i) => i + 1).map(ch => (
                            <button
                              key={ch}
                              onClick={() => {
                                setCurrentChapter(ch);
                                setIsSidebarOpen(false);
                                if (activeTab !== "read") {
                                  setActiveTab("read");
                                }
                              }}
                              className={`aspect-square text-xs font-bold rounded-lg flex items-center justify-center transition-all ${
                                currentChapter === ch 
                                  ? "bg-emerald-500 text-white shadow" 
                                  : "hover:bg-slate-200 dark:hover:bg-slate-800"
                              }`}
                            >
                              {ch}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 하단 독서 설정 간이 세팅 */}
              <div className="mt-4 border-t pt-4 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">독서 테마</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(Object.keys(THEMES) as ThemeKey[]).map(tName => (
                      <button
                        key={tName}
                        onClick={() => {
                          setTheme(tName as ThemeKey);
                          localStorage.setItem('onbible_theme', tName);
                        }}
                        className={`py-1 rounded-md border text-[10px] font-bold ${theme === tName ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-black" : "border-slate-200"}`}
                      >
                        {THEMES[tName].name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </aside>

          {/* 메인 본문 콘텐츠 창 (성경 읽기 및 기타 탭) */}
          <div className="lg:col-span-9 space-y-6">

            {/* 탭 1: 대시보드 / 성경 목차(TOC) 모드 */}
            {activeTab === "toc" && (
              <div className={`p-6 rounded-2xl border ${activeTheme.card}`}>
                <div className="border-b pb-4 mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-2">📚 성경 전체 목차</h2>
                  <p className="text-sm opacity-75 mt-1">창세기부터 요한계시록까지. 성경책을 선택한 뒤 이동하고자 하는 장을 선택하세요.</p>
                </div>

                {/* 구약 / 신약 대조 섹션 */}
                <div className="space-y-8">
                  {/* 구약성경 그룹 */}
                  <div>
                    <h3 className="text-lg font-black text-emerald-600 mb-4 flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
                      🛡️ 구약 성경 (Old Testament - 39권)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {BIBLE_BOOKS.filter(b => b.testament === "OT").map(book => (
                        <button
                          key={book.id}
                          onClick={() => setSelectedBookForTOC(book)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedBookForTOC?.id === book.id 
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-lg" 
                              : `hover:border-slate-300 dark:hover:border-slate-700 ${activeTheme.buttonInactive}`
                          }`}
                        >
                          <div className="font-bold text-sm">{book.name}</div>
                          <div className="text-xs opacity-75 mt-0.5">{book.eng} · {book.chapters}장</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 신약성경 그룹 */}
                  <div>
                    <h3 className="text-lg font-black text-indigo-600 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                      ✝️ 신약 성경 (New Testament - 27권)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {BIBLE_BOOKS.filter(b => b.testament === "NT").map(book => (
                        <button
                          key={book.id}
                          onClick={() => setSelectedBookForTOC(book)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedBookForTOC?.id === book.id 
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-lg" 
                              : `hover:border-slate-300 dark:hover:border-slate-700 ${activeTheme.buttonInactive}`
                          }`}
                        >
                          <div className="font-bold text-sm">{book.name}</div>
                          <div className="text-xs opacity-75 mt-0.5">{book.eng} · {book.chapters}장</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 특정 책 클릭 시 장 선택 창 팝업 */}
                {selectedBookForTOC && (
                  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl ${activeTheme.bg}`}>
                      <div className="flex items-center justify-between border-b pb-4 mb-4">
                        <div>
                          <h4 className="text-xl font-black">{selectedBookForTOC.name}</h4>
                          <p className="text-xs opacity-75">{selectedBookForTOC.eng} / 총 {selectedBookForTOC.chapters}장</p>
                        </div>
                        <button 
                          onClick={() => setSelectedBookForTOC(null)}
                          className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <p className="text-sm font-semibold mb-3">읽고자 하는 장을 선택하세요:</p>
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[40vh] overflow-y-auto p-1 border rounded-2xl bg-white/20">
                        {Array.from({ length: selectedBookForTOC.chapters }, (_, i) => i + 1).map(ch => (
                          <button
                            key={ch}
                            onClick={() => {
                              setCurrentBook(selectedBookForTOC);
                              setCurrentChapter(ch);
                              setSelectedBookForTOC(null);
                              setActiveTab("read");
                              showToast(`${selectedBookForTOC.name} ${ch}장으로 이동 완료!`);
                            }}
                            className="aspect-square font-bold text-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm flex items-center justify-center transition-all"
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {}
            {/* 탭 2: 기본 성경 읽기(독서) 모드 */}
            {activeTab === "read" && (
              <div className="space-y-4">
                
                {/* 상단 툴바 및 성경정보 헤더 */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${activeTheme.card}`}>
                  
                  {/* 현재 장 제어 및 브레드크럼 */}
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handlePrevChapter}
                      className={`p-2 rounded-xl border hover:bg-slate-100 ${activeTheme.buttonInactive}`}
                      title="이전 장 (단축키: 왼쪽 방향키)"
                    >
                      ◀ 이전
                    </button>
                    
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                        {currentBook.name} {currentChapter}장
                      </h2>
                      <p className="text-xs opacity-60 font-semibold">{currentBook.eng} Chapter {currentChapter}</p>
                    </div>

                    <button 
                      onClick={handleNextChapter}
                      className={`p-2 rounded-xl border hover:bg-slate-100 ${activeTheme.buttonInactive}`}
                      title="다음 장 (단축키: 오른쪽 방향키)"
                    >
                      다음 ▶
                    </button>
                  </div>

                  {/* 뷰 세부 조정 컨트롤러 */}
                  <div className="flex items-center flex-wrap gap-2 justify-end w-full sm:w-auto">
                    
                    {/* 영문 성경 대조 선택 드롭다운 */}
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-bold whitespace-nowrap">영문 대조:</span>
                      <select
                        value={parallelVersion}
                        onChange={(e) => setParallelVersion(e.target.value)}
                        className={`text-xs p-1.5 rounded-lg border ${activeTheme.card} focus:outline-none`}
                      >
                        <option value="NONE">없음</option>
                        <option value="NIV">NIV (현대 영문)</option>
                        <option value="KJV">KJV (킹 제임스)</option>
                      </select>
                    </div>

                    {/* 글꼴 종류 선택 */}
                    <button
                      onClick={() => {
                        const nextFamily = fontFamily === "serif" ? "sans" : "serif";
                        setFontFamily(nextFamily);
                        localStorage.setItem('onbible_fontfamily', nextFamily);
                      }}
                      className={`p-1.5 rounded-lg border text-xs font-bold ${activeTheme.card}`}
                      title="글꼴 변경 (명조/고딕)"
                    >
                      {fontFamily === "serif" ? "serif 명조" : "sans 고딕"}
                    </button>

                    {/* 글자 크기 조절 단추 */}
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button 
                        onClick={() => {
                          const sizes = ["sm", "md", "lg", "xl", "2xl"];
                          const currentIdx = sizes.indexOf(fontSize);
                          if (currentIdx > 0) {
                            setFontSize(sizes[currentIdx - 1]);
                            localStorage.setItem('onbible_fontsize', sizes[currentIdx - 1]);
                          }
                        }}
                        className={`px-2 py-1.5 text-xs font-bold border-r ${activeTheme.buttonInactive}`}
                      >
                        가-
                      </button>
                      <span className="px-2 text-xs font-black bg-slate-100/50 dark:bg-slate-800">{fontSize.toUpperCase()}</span>
                      <button 
                        onClick={() => {
                          const sizes = ["sm", "md", "lg", "xl", "2xl"];
                          const currentIdx = sizes.indexOf(fontSize);
                          if (currentIdx < sizes.length - 1) {
                            setFontSize(sizes[currentIdx + 1]);
                            localStorage.setItem('onbible_fontsize', sizes[currentIdx + 1]);
                          }
                        }}
                        className={`px-2 py-1.5 text-xs font-bold ${activeTheme.buttonInactive}`}
                      >
                        가+
                      </button>
                    </div>

                  </div>
                </div>

                {}
                {/* 성경 본문 박스 */}
                <div className={`p-6 md:p-10 rounded-3xl border transition-all ${activeTheme.card}`}>
                  
                  {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      {/* 로딩 스켈레톤 애니메이션 */}
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
                      <p className="text-sm font-semibold text-emerald-600">성경 말씀 불러오는 중...</p>
                    </div>
                  ) : error ? (
                    <div className="py-6 text-center text-rose-500 font-semibold text-sm">
                      ⚠️ {error}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* 구절 나열 리스트 */}
                      {verses.map((verseObj) => {
                        const isSelected = selectedVerses.includes(verseObj.verse);
                        const cleanKRText = stripHtml(verseObj.text);
                        const enVerseObj = parallelVersion !== "NONE" 
                          ? parallelVerses.find(ev => ev.verse === verseObj.verse) 
                          : null;
                        const cleanENText = enVerseObj ? stripHtml(enVerseObj.text) : "";
                        const noteKey = `${currentBook.id}-${currentChapter}-${verseObj.verse}`;
                        const hasNote = !!notes[noteKey];
                        const isBookmarked = bookmarks.some(b => b.key === noteKey);

                        return (
                          <div 
                            key={verseObj.verse}
                            id={`verse-${verseObj.verse}`}
                            onClick={() => handleVerseClick(verseObj.verse)}
                            className={`p-3 rounded-2xl transition-all cursor-pointer border ${
                              isSelected 
                                ? activeTheme.highlightBg 
                                : "border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              
                              {/* 절 번호와 아이콘 제어부 */}
                              <div className="flex flex-col items-center space-y-1 mt-1">
                                <span className={`text-xs ${activeTheme.verseNum} min-w-[20px] text-center`}>
                                  {verseObj.verse}
                                </span>
                                
                                {/* 기록된 메모가 있거나 북마크가 되어있는 경우 마커 표시 */}
                                <div className="flex space-x-0.5">
                                  {isBookmarked && (
                                    <span className="text-[10px]" title="북마크됨">⭐</span>
                                  )}
                                  {hasNote && (
                                    <span className="text-[10px]" title="작성된 메모 있음">📝</span>
                                  )}
                                </div>
                              </div>

                              {/* 성경 구절 본문 */}
                              <div className="flex-1 space-y-2">
                                {/* 한글 성경 */}
                                <p className={`${fontSizeClass} font-medium ${activeTheme.verseText}`}>
                                  {cleanKRText}
                                </p>
                                
                                {/* 대조용 영어 성경 (활성화시) */}
                                {parallelVersion !== "NONE" && cleanENText && (
                                  <p className="text-sm md:text-base text-slate-500 font-sans italic pt-1 leading-relaxed">
                                    <span className="text-xs font-bold bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 mr-1">
                                      {parallelVersion}
                                    </span> 
                                    {cleanENText}
                                  </p>
                                )}
                              </div>

                              {/* 개별 구절 빠른 조작용 액션 단추 */}
                              <div className="hidden sm:flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                                <button 
                                  onClick={() => handleToggleBookmark(verseObj.verse)}
                                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-xs"
                                  title="북마크 토글"
                                >
                                  {isBookmarked ? "⭐" : "☆"}
                                </button>
                                <button 
                                  onClick={() => handleOpenNoteEditor(verseObj.verse)}
                                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-xs"
                                  title="노트 작성"
                                >
                                  📝
                                </button>
                              </div>

                            </div>
                          </div>
                        );
                      })}

                    </div>
                  )}

                  {/* 하단 장 넘기기 간편 보조 배너 */}
                  <div className="flex items-center justify-between border-t mt-8 pt-6">
                    <button 
                      onClick={handlePrevChapter} 
                      className="text-xs font-bold text-emerald-600 flex items-center space-x-1"
                    >
                      <span>◀ 이전 장으로</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab("toc"); setSelectedBookForTOC(null); }}
                      className="text-xs font-semibold text-slate-500"
                    >
                      목차 목록보기
                    </button>
                    <button 
                      onClick={handleNextChapter} 
                      className="text-xs font-bold text-emerald-600 flex items-center space-x-1"
                    >
                      <span>다음 장으로 ▶</span>
                    </button>
                  </div>

                </div>

                {}
                {/* 다중 구절 선택 시 하단에 고정되는 복사 전용 제어판 */}
                {selectedVerses.length > 0 && (
                  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-slate-900/95 dark:bg-zinc-950/95 text-white p-4 rounded-3xl shadow-2xl border border-slate-700 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-up">
                    
                    {/* 상태 보고 */}
                    <div className="text-center md:text-left">
                      <div className="text-sm font-bold flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {currentBook.name} {currentChapter}장
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        총 <span className="font-bold text-emerald-400">{selectedVerses.length}개</span> 구절이 선택되었습니다.
                      </div>
                    </div>

                    {/* 복사 옵션 포맷 선택 */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <button
                        onClick={() => setCopyFormat("kakaotalk")}
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all ${copyFormat === 'kakaotalk' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      >
                        💬 카톡 전송용
                      </button>
                      <button
                        onClick={() => setCopyFormat("standard")}
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all ${copyFormat === 'standard' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      >
                        📖 학술/인용용
                      </button>
                      <button
                        onClick={() => setCopyFormat("raw")}
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all ${copyFormat === 'raw' ? 'bg-indigo-500 text-white font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      >
                        📋 본문만
                      </button>
                    </div>

                    {/* 동작 단추들 */}
                    <div className="flex items-center space-x-1 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0">
                      <button 
                        onClick={handleCopyToClipboard}
                        className="flex-1 md:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/20"
                      >
                        ✂️ 이쁘게 복사하기 (복붙)
                      </button>
                      
                      <button 
                        onClick={() => setSelectedVerses([])}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold"
                      >
                        취소
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}

            {}
            {/* 탭 3: 전체 성경 구절 검색 엔진 */}
            {activeTab === "search" && (
              <div className={`p-6 rounded-2xl border ${activeTheme.card} space-y-6`}>
                
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-black flex items-center gap-2">🔍 성경 전체 검색</h2>
                  <p className="text-sm opacity-75 mt-1">개역한글 버전 전체에서 원하시는 성경 말씀 키워드를 신속하게 검색합니다.</p>
                </div>

                {/* 검색 입력 상자 */}
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="검색할 말씀을 입력하세요 (예: 사랑, 믿음, 소망, 예수)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`flex-1 pl-4 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium ${activeTheme.card}`}
                  />
                  <button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-1"
                  >
                    <span>검색</span>
                  </button>
                </form>

                {/* 검색 결과 현황 출력 */}
                {searchLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
                    <p className="text-sm text-slate-500 font-semibold">성경 전역에서 검색어를 매칭하고 있습니다...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchSuccessMessage && (
                      <p className="text-sm font-bold text-emerald-600">{searchSuccessMessage}</p>
                    )}

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {searchResults.map((result, idx) => {
                        const bookObj = BIBLE_BOOKS.find(b => b.id === result.book);
                        const bookName = bookObj ? bookObj.name : `성경책 ID ${result.book}`;
                        
                        return (
                          <div 
                            key={result.pk || idx}
                            onClick={() => handleJumpToSearchVerse(result.book ?? 0, result.chapter ?? 0, result.verse)}
                            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white/40 dark:bg-slate-800/40 hover:bg-emerald-50/10 transition-all cursor-pointer shadow-sm group"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                {bookName} {result.chapter}장 {result.verse}절
                              </span>
                              <span className="text-[10px] text-slate-400 group-hover:text-emerald-500 font-bold">구절 이동 ▶</span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 mt-1">
                              {stripHtml(result.text)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {}
            {/* 탭 4: 즐겨찾기(북마크) 구절 모아보기 */}
            {activeTab === "bookmark" && (
              <div className={`p-6 rounded-2xl border ${activeTheme.card} space-y-6`}>
                
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-black flex items-center gap-2">⭐ 개인 성경 북마크</h2>
                  <p className="text-sm opacity-75 mt-1">자주 묵상하는 소중한 말씀 구절들을 모아서 관리하고 복사하실 수 있습니다.</p>
                </div>

                {bookmarks.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 space-y-2">
                    <span className="text-4xl">⭐</span>
                    <p className="text-sm font-semibold">아직 추가된 북마크 구절이 없습니다.</p>
                    <p className="text-xs opacity-75">성경읽기 창에서 구절 우측의 '☆' 단추를 눌러 말씀을 모아보세요.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookmarks.map((bookmark) => (
                      <div 
                        key={bookmark.key}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                              {bookmark.bookName} {bookmark.chapter}장 {bookmark.verse}절
                            </span>
                            <span className="text-[10px] text-slate-400">{bookmark.date}</span>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {bookmark.text}
                          </p>
                        </div>

                        {/* 조작용 툴바 */}
                        <div className="flex items-center justify-end space-x-2 border-t pt-3">
                          <button
                            onClick={async () => {
                              const formatText = `[ ${bookmark.bookName} ${bookmark.chapter}:${bookmark.verse} ]\n"${bookmark.text}" (개역한글)`;
                              await navigator.clipboard.writeText(formatText);
                              showToast("북마크 구절 복사 완료!");
                            }}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                          >
                            ✂️ 복사
                          </button>
                          <button
                            onClick={() => {
                              const book = BIBLE_BOOKS.find(b => b.id === bookmark.bookId);
                              if (book) {
                                setCurrentBook(book);
                                setCurrentChapter(bookmark.chapter);
                                setActiveTab("read");
                                setTimeout(() => {
                                  setSelectedVerses([bookmark.verse]);
                                  const el = document.getElementById(`verse-${bookmark.verse}`);
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 600);
                              }
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold"
                          >
                            📖 본문이동
                          </button>
                          <button
                            onClick={() => {
                              const filtered = bookmarks.filter(b => b.key !== bookmark.key);
                              updateBookmarks(filtered);
                              showToast("북마크가 해제되었습니다.");
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 rounded-lg text-xs font-bold"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {}
            {/* 탭 5: 나만의 설교 및 묵상 노트 모아보기 */}
            {activeTab === "note" && (
              <div className={`p-6 rounded-2xl border ${activeTheme.card} space-y-6`}>
                
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-black flex items-center gap-2">📝 나만의 성경 묵상 및 메모</h2>
                  <p className="text-sm opacity-75 mt-1">성경 공부 및 주일 설교 묵상 시 작성했던 개인 노트를 모아 확인하고 복사할 수 있습니다.</p>
                </div>

                {Object.keys(notes).length === 0 ? (
                  <div className="py-20 text-center text-slate-400 space-y-2">
                    <span className="text-4xl">📝</span>
                    <p className="text-sm font-semibold">작성된 메모가 없습니다.</p>
                    <p className="text-xs opacity-75">성경읽기 창에서 구절 우측의 노트(📝) 아이콘을 누르면 묵상을 기록하실 수 있습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.keys(notes).map((key) => {
                      const [bookId, chapterNum, verseNum] = key.split('-').map(Number);
                      const bookObj = BIBLE_BOOKS.find(b => b.id === bookId);
                      const bookName = bookObj ? bookObj.name : `성경 ID ${bookId}`;
                      
                      return (
                        <div 
                          key={key}
                          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 space-y-3 shadow-sm"
                        >
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                              {bookName} {chapterNum}장 {verseNum}절 관련 묵상
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setEditingNote({
                                    show: true,
                                    bookId,
                                    bookName,
                                    chapter: chapterNum,
                                    verse: verseNum,
                                    text: notes[key]
                                  });
                                }}
                                className="text-xs text-emerald-600 hover:underline font-bold"
                              >
                                수정
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                onClick={() => {
                                  const updated = { ...notes };
                                  delete updated[key];
                                  updateNotes(updated);
                                  showToast("노트가 삭제되었습니다.");
                                }}
                                className="text-xs text-rose-500 hover:underline font-bold"
                              >
                                삭제
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                              💌 묵상 내용:
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed font-sans font-medium">
                              {notes[key]}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={async () => {
                                const noteToCopy = `📝 [ ${bookName} ${chapterNum}:${verseNum} 묵상노트 ]\n${notes[key]}\n(개역한글 성경)`;
                                await navigator.clipboard.writeText(noteToCopy);
                                showToast("묵상노트 복사 완료!");
                              }}
                              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-500"
                            >
                              ✂️ 노트 내용 복사하기
                            </button>
                            <button
                              onClick={() => {
                                if (bookObj) {
                                  setCurrentBook(bookObj);
                                  setCurrentChapter(chapterNum);
                                  setActiveTab("read");
                                  setTimeout(() => {
                                    setSelectedVerses([verseNum]);
                                    const el = document.getElementById(`verse-${verseNum}`);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }, 600);
                                }
                              }}
                              className="text-xs font-extrabold text-slate-500 hover:text-slate-400"
                            >
                              성경 구절 본문보기 ▶
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </main>

      {}
      {/* 묵상 및 메모 작성 팝업 모달 */}
      {editingNote.show && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl ${activeTheme.bg}`}>
            
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-lg font-black text-emerald-600">📝 성경 묵상 기록</h3>
                <p className="text-xs opacity-75 mt-0.5">
                  {editingNote.bookName} {editingNote.chapter}장 {editingNote.verse}절 말씀
                </p>
              </div>
              <button 
                onClick={() => setEditingNote({ show: false, bookId: null, bookName: "", chapter: null, verse: null, text: "" })}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70">노트 내용 작성:</label>
                <textarea
                  rows={6}
                  placeholder="구절에 관련한 생각, 주일 설교 핵심 요약, 기도제목 등을 편하게 자유롭게 기록하세요..."
                  value={editingNote.text}
                  onChange={(e) => setEditingNote(prev => ({ ...prev, text: e.target.value }))}
                  className={`w-full p-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans ${activeTheme.card}`}
                />
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setEditingNote({ show: false, bookId: null, bookName: "", chapter: null, verse: null, text: "" })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                >
                  저장하기
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 푸터 영역 */}
      <footer className="border-t mt-20 py-8 bg-black/5 dark:bg-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2 text-xs opacity-60">
          <p>© 2026 온성경 (ON BIBLE) · 개역한글(KRV) 전문 지원 웹 애플리케이션</p>
          <p>모든 성경 데이터는 오픈 소스 bolls.life API 연동을 통해 안정적으로 실시간 조회됩니다.</p>
          <p className="font-semibold text-emerald-600">성경 구절을 터치하여 다중 선택한 다음, 다양한 카카오톡 및 묵상용 서식으로 간편하게 복붙하세요.</p>
        </div>
      </footer>

    </div>
  );
}