/**
 * ============================================================================
 * APEX LINGO | PRODUCTION ENGINE SCRIPT (v2.3)
 * Architecture: State-Driven Gamified EdTech PWA with Multi-Language Engine,
 * Dynamic Language-Specific SpeechSynthesis, Randomized Multi-Thematic Question
 * Pool (Daily Life, Food, Travel, Work, Health), Progressive Difficulty Curve,
 * Word Scramble, Audio Matching, Arabic Guidance & Robust Local Persistence
 * ============================================================================
 */

'use strict';

// ----------------------------------------------------------------------------
// 1. ADVANCED SOUND & AUDIO SYNTHESIZER ENGINE (Web Audio API & SpeechSynthesis)
// ----------------------------------------------------------------------------
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.voices = [];

    // Pre-cache native browser speech synthesis voices
    if ('speechSynthesis' in window) {
      this.cacheVoices();
      window.speechSynthesis.onvoiceschanged = () => this.cacheVoices();
    }
  }

  cacheVoices() {
    if ('speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  init() {
    if (!this.isInitialized) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.isInitialized = true;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1, delay = 0) {
    if (!AppState.state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + delay;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("AudioContext error:", e);
    }
  }

  // Tactile light bubble tap for word scramble chips
  playChipTap() {
    if (!AppState.state.soundEnabled) return;
    this.init();
    this.playTone(720, 'triangle', 0.06, 0.08);
  }

  playCoin() {
    if (!AppState.state.soundEnabled) return;
    this.init();
    this.playTone(987.77, 'sine', 0.12, 0.12, 0);       // B5
    this.playTone(1318.51, 'triangle', 0.22, 0.14, 0.08); // E6
  }

  playVictory() {
    if (!AppState.state.soundEnabled) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.2, 0.15, idx * 0.09);
    });
  }

  playError() {
    if (!AppState.state.soundEnabled) return;
    this.init();
    this.playTone(180, 'sawtooth', 0.25, 0.15, 0);
    this.playTone(140, 'sawtooth', 0.35, 0.15, 0.1);
  }

  playHeartLost() {
    if (!AppState.state.soundEnabled) return;
    this.init();
    this.playTone(320, 'sine', 0.15, 0.12, 0);
    this.playTone(220, 'sine', 0.25, 0.14, 0.1);
  }

  playClick() {
    if (!AppState.state.soundEnabled) return;
    this.playTone(600, 'sine', 0.04, 0.08);
  }

  playLevelUp() {
    if (!AppState.state.soundEnabled) return;
    this.init();
    const arpeggio = [440, 554.37, 659.25, 880, 1108.73];
    arpeggio.forEach((f, i) => {
      this.playTone(f, 'square', 0.18, 0.1, i * 0.07);
    });
  }

  /**
   * Dynamic Language-Specific Speech Synthesis Engine
   * Detects target language ('ja-JP', 'fr-FR', 'es-ES', 'en-US'),
   * cleans pronunciation text, and sets native voice accent.
   */
  speak(text, lang = null, rate = 1.0) {
    if (!AppState.state.speechEnabled) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Determine target language code
    const targetLang = lang || LANGUAGE_CONFIG[AppState.state.selectedLanguage]?.ttsCode || 'ja-JP';

    // Strip phonetic romanization, brackets, slashes, and excess punctuation for clean speech
    const cleanText = text
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[\/\\#@*~]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLang;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Refresh voices if not populated yet
    if (this.voices.length === 0) {
      this.cacheVoices();
    }

    if (this.voices.length > 0) {
      // 1. Look for exact locale match (e.g., 'fr-FR' or 'ja-JP')
      let matchedVoice = this.voices.find(v => v.lang === targetLang || v.lang.replace('_', '-') === targetLang);

      // 2. Fallback to language prefix match (e.g., 'fr' or 'ja')
      if (!matchedVoice) {
        const langPrefix = targetLang.split('-')[0].toLowerCase();
        matchedVoice = this.voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  }
}

const AudioEngine = new SoundSynthesizer();


// ----------------------------------------------------------------------------
// 2. CONFIGURATION & METADATA ARCHITECTURE
// ----------------------------------------------------------------------------
const LANGUAGE_CONFIG = {
  japanese: {
    name: 'Japanese',
    nativeName: '日本語',
    arabicName: 'اليابانية',
    code: 'JP',
    flag: '🇯🇵',
    ttsCode: 'ja-JP',
    tag: 'HUNTER SECTOR 01 • JAPANESE',
    sectorTitle: 'Neo-Tokyo Protocol',
    sectorSub: 'Daily Life, Transit, Dining & Multi-Format Exercises'
  },
  french: {
    name: 'French',
    nativeName: 'Français',
    arabicName: 'الفرنسية',
    code: 'FR',
    flag: '🇫🇷',
    ttsCode: 'fr-FR',
    tag: 'HUNTER SECTOR 02 • FRENCH',
    sectorTitle: 'Neo-Paris Protocol',
    sectorSub: 'Everyday Conversations, Cafés, Transit & Street Dialogues'
  },
  spanish: {
    name: 'Spanish',
    nativeName: 'Español',
    arabicName: 'الإسبانية',
    code: 'ES',
    flag: '🇪🇸',
    ttsCode: 'es-ES',
    tag: 'HUNTER SECTOR 03 • SPANISH',
    sectorTitle: 'Neo-Madrid Protocol',
    sectorSub: 'Conversational Speed, Shopping, Travel & Everyday Fluency'
  },
  english: {
    name: 'English',
    nativeName: 'English',
    arabicName: 'الإنجليزية',
    code: 'EN',
    flag: '🇬🇧',
    ttsCode: 'en-US',
    tag: 'HUNTER SECTOR 04 • ENGLISH',
    sectorTitle: 'Global Hub Protocol',
    sectorSub: 'International Communication, Business, Travel & Practical Fluency'
  }
};

const THEMATIC_STAGES = [
  {
    stageId: 1,
    tag: 'STAGE 1 • FOUNDATIONS',
    title: 'Daily Life & Essential Greetings',
    arabic: 'المرحلة 1: الحياة اليومية والتحيات الأساسية',
    levelIds: [1, 2, 3]
  },
  {
    stageId: 2,
    tag: 'STAGE 2 • TRANSIT & FOOD',
    title: 'City Transit, Dining & Cafés',
    arabic: 'المرحلة 2: المواصلات والمطاعم والمقاهي',
    levelIds: [4, 5, 6]
  },
  {
    stageId: 3,
    tag: 'STAGE 3 • MASTERY & DIALOGUE',
    title: 'Advanced Social & Practical Mastery',
    arabic: 'المرحلة 3: الحوارات المتقدمة وإتقان المواقف',
    levelIds: [7, 8, 9, 10]
  }
];

const LEVEL_METADATA = {
  japanese: [
    { id: 1, title: "Daily Greetings & Courtesies", icon: "🌸" },
    { id: 2, title: "Café & Ordering Drinks", icon: "☕" },
    { id: 3, title: "Meeting People & Introductions", icon: "🤝" },
    { id: 4, title: "Subway & City Directions", icon: "🚅" },
    { id: 5, title: "Tokyo Restaurants & Dishes", icon: "🍜" },
    { id: 6, title: "Shopping & Market Prices", icon: "🛍️" },
    { id: 7, title: "Health, Pharmacy & Emergency", icon: "🏥" },
    { id: 8, title: "Workplace & Digital Tech", icon: "💻" },
    { id: 9, title: "Anime Culture & Slang", icon: "👁️" },
    { id: 10, title: "Mastery: Neo-Tokyo Synthesis", icon: "🌌" }
  ],
  french: [
    { id: 1, title: "Bonjour & Street Greetings", icon: "🗼" },
    { id: 2, title: "Bistro & Café Orders", icon: "🥐" },
    { id: 3, title: "Socializing & Family", icon: "🍷" },
    { id: 4, title: "Métro & Getting Around", icon: "🚇" },
    { id: 5, title: "Boulangerie & Market Shopping", icon: "🥖" },
    { id: 6, title: "Hotel & Travel Logistics", icon: "🏨" },
    { id: 7, title: "Health, Doctor & Help", icon: "💊" },
    { id: 8, title: "Modern Work & Tech Life", icon: "💻" },
    { id: 9, title: "Parisian Culture & Idioms", icon: "🎨" },
    { id: 10, title: "Mastery: Neo-Paris Synthesis", icon: "🌌" }
  ],
  spanish: [
    { id: 1, title: "Hola & Daily Greetings", icon: "☀️" },
    { id: 2, title: "Tapas Bar & Refreshments", icon: "🍹" },
    { id: 3, title: "Friends & Introductions", icon: "🤝" },
    { id: 4, title: "Train Station & Directions", icon: "🚊" },
    { id: 5, title: "Supermarket & Street Market", icon: "🛒" },
    { id: 6, title: "Travel, Hotel & Sightseeing", icon: "🏖️" },
    { id: 7, title: "Pharmacy, Health & Urgent Care", icon: "🏥" },
    { id: 8, title: "Digital Office & Communication", icon: "📱" },
    { id: 9, title: "Hispanic Culture & Expressions", icon: "💃" },
    { id: 10, title: "Mastery: Neo-Madrid Synthesis", icon: "🌌" }
  ],
  english: [
    { id: 1, title: "Daily Hello & Polite Phrases", icon: "👋" },
    { id: 2, title: "Coffee Shop & Quick Bites", icon: "☕" },
    { id: 3, title: "Meeting New Friends", icon: "🤝" },
    { id: 4, title: "Airport, Transit & Navigation", icon: "✈️" },
    { id: 5, title: "Dining Out & Restaurant Bills", icon: "🍽️" },
    { id: 6, title: "Retail Stores & Bargains", icon: "💳" },
    { id: 7, title: "Doctor, Pharmacy & First Aid", icon: "🩺" },
    { id: 8, title: "Professional Tech & Remote Work", icon: "💼" },
    { id: 9, title: "Global Idioms & Colloquialisms", icon: "🌐" },
    { id: 10, title: "Mastery: Global Hub Synthesis", icon: "🌌" }
  ]
};


// ----------------------------------------------------------------------------
// 3. PERSISTENT STATE MANAGEMENT SYSTEM (WITH DATE STREAK & HEART RECOVERY)
// ----------------------------------------------------------------------------
class StateManager {
  constructor() {
    this.storageKey = 'apex_lingo_state_v2';
    this.state = this.loadState();
    this.listeners = [];

    // Check automated heart recovery & daily streak on startup
    this.checkHeartRegeneration();
  }

  getDefaultState() {
    return {
      coins: 100,
      userXP: 120,
      hearts: 5,
      maxHearts: 5,
      lastHeartDepletedTime: null,
      isApexPro: false,
      streak: 3,
      lastStudyDate: new Date().toISOString().split('T')[0],
      selectedLanguage: 'japanese',
      unlockedLevels: {
        japanese: 1,
        french: 1,
        spanish: 1,
        english: 1
      },
      completedLevels: {
        japanese: [],
        french: [],
        spanish: [],
        english: []
      },
      profile: {
        name: 'Hunter Solo',
        email: 'hunter.solo@apexlingo.io',
        avatar: '🤖',
        isGoogle: false,
        rankTitle: 'E-Rank Awakened'
      },
      learningGoal: 'casual',
      onboardingComplete: false,
      activeTheme: 'cyber-default',
      booster5050: 2,
      soundEnabled: true,
      speechEnabled: true,
      animationsEnabled: true,
      unlockedThemes: ['cyber-default'],
      activePuzzleIndex: 0
    };
  }

  loadState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const defaults = this.getDefaultState();
        return {
          ...defaults,
          ...parsed,
          profile: { ...defaults.profile, ...(parsed.profile || {}) },
          unlockedLevels: { ...defaults.unlockedLevels, ...(parsed.unlockedLevels || {}) },
          completedLevels: { ...defaults.completedLevels, ...(parsed.completedLevels || {}) }
        };
      }
    } catch (e) {
      console.warn("Failed to read localStorage. Using defaults.", e);
    }
    return this.getDefaultState();
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }

  update(mutatorFn) {
    mutatorFn(this.state);
    this.saveState();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.state);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  // Automated heart recovery (+1 heart every 30 minutes if depleted)
  checkHeartRegeneration() {
    if (this.state.isApexPro) return;
    if (this.state.hearts >= 5) return;

    const now = Date.now();
    const lastDepleted = this.state.lastHeartDepletedTime || now;
    const elapsedMs = now - lastDepleted;
    const intervalMs = 30 * 60 * 1000; // 30 minutes
    const recovered = Math.floor(elapsedMs / intervalMs);

    if (recovered > 0) {
      this.state.hearts = Math.min(5, this.state.hearts + recovered);
      this.state.lastHeartDepletedTime = this.state.hearts >= 5 ? null : now - (elapsedMs % intervalMs);
      this.saveState();
    }
  }

  // Date-based streak progression
  recordLessonCompletion() {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = this.state.lastStudyDate;

    if (!lastDate) {
      this.state.streak = 1;
      this.state.lastStudyDate = today;
    } else if (lastDate === today) {
      // Practiced again today, streak intact
    } else {
      const last = new Date(lastDate);
      const current = new Date(today);
      const diffDays = Math.round((current - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.state.streak += 1;
      } else if (diffDays > 1) {
        this.state.streak = 1;
      }
      this.state.lastStudyDate = today;
    }
    this.saveState();
  }

  resetAll() {
    this.state = this.getDefaultState();
    this.saveState();
    this.notify();
  }
}

const AppState = new StateManager();


// ----------------------------------------------------------------------------
// 4. RANDOMIZED MULTI-THEMATIC QUESTION POOL & DIFFICULTY CURVE ENGINE
// ----------------------------------------------------------------------------
class LevelQuestionEngine {
  /**
   * Generates a 20-question level session by sampling dynamically from
   * a diverse, multi-thematic question pool (Daily Life, Food, Transit,
   * Shopping, Health, Tech) with an intelligent progressive difficulty curve:
   * - Questions 1–6: Foundational Warm-up (Tier 1)
   * - Questions 7–13: Practical Application (Tier 2)
   * - Questions 14–20: Advanced Mastery (Tier 3)
   */
  static get20Questions(language, levelId) {
    const pool = this.getMultiThematicPool(language);

    // Split pool by difficulty tiers
    const tier1 = this.shuffleArray([...pool.filter(item => item.tier === 1)]);
    const tier2 = this.shuffleArray([...pool.filter(item => item.tier === 2)]);
    const tier3 = this.shuffleArray([...pool.filter(item => item.tier === 3)]);

    const selectedItems = [];

    // Phase 1: 6 questions from Tier 1 (Questions 1 to 6)
    for (let i = 0; i < 6; i++) {
      selectedItems.push({
        item: tier1[i % tier1.length],
        tier: 1,
        tierLabel: 'TIER 1 • WARM-UP',
        tierClass: 'difficulty-easy'
      });
    }

    // Phase 2: 7 questions from Tier 2 (Questions 7 to 13)
    for (let i = 0; i < 7; i++) {
      selectedItems.push({
        item: tier2[i % tier2.length],
        tier: 2,
        tierLabel: 'TIER 2 • APPLICATION',
        tierClass: 'difficulty-medium'
      });
    }

    // Phase 3: 7 questions from Tier 3 (Questions 14 to 20)
    for (let i = 0; i < 7; i++) {
      selectedItems.push({
        item: tier3[i % tier3.length],
        tier: 3,
        tierLabel: 'TIER 3 • ADVANCED',
        tierClass: 'difficulty-hard'
      });
    }

    // Construct 20 dynamic interactive questions
    const questions = [];

    selectedItems.forEach((entry, idx) => {
      const { item, tier, tierLabel, tierClass } = entry;
      const qNum = idx + 1;
      const formatType = idx % 3; // 0 = Multiple Choice, 1 = Word Scramble, 2 = Audio Match

      let qObj = null;

      if (formatType === 0) {
        // FORMAT 1: CLASSIC MULTIPLE CHOICE (Bilingual with Arabic Subtitles)
        qObj = {
          number: qNum,
          type: 'multiple-choice',
          typeLabel: 'TRANSLATION (ترجمة)',
          tierLabel: tierLabel,
          tierClass: tierClass,
          instruction: "Select the correct translation with clear Arabic guidance:",
          prompt: item.foreign,
          roman: item.roman,
          context: item.context,
          arabic: item.arabic,
          explanation: `"${item.foreign}" translates to "${item.english}".`,
          arabicExplanation: item.arabicExp || `الترجمة الصحيحة هي: ${item.arabic}`,
          options: this.shuffleOptions(
            { text: item.english, arabic: item.arabic, correct: true },
            item.wrongs
          )
        };

      } else if (formatType === 1) {
        // FORMAT 2: WORD SCRAMBLE / SENTENCE REORDERING
        const targetTokens = [...item.scrambleTokens];
        const bankTokens = this.shuffleArray([...item.scrambleTokens, ...item.distractorTokens]);

        qObj = {
          number: qNum,
          type: 'word-scramble',
          typeLabel: 'WORD SCRAMBLE (ترتيب الكلمات)',
          tierLabel: tierLabel,
          tierClass: tierClass,
          instruction: "Tap word chips below in the proper order to form the translation:",
          prompt: item.foreign,
          roman: item.roman,
          arabic: item.arabic,
          targetTokens: targetTokens,
          bankTokens: bankTokens,
          correctSentence: targetTokens.join(' '),
          explanation: `Correct assembled order: "${targetTokens.join(' ')}".`,
          arabicExplanation: item.arabicExp || `الترتيب الصحيح للجملة هو: "${item.arabic}"`
        };

      } else {
        // FORMAT 3: AUDIO / PRONUNCIATION MATCHING
        qObj = {
          number: qNum,
          type: 'audio-match',
          typeLabel: 'AUDIO MATCHING (استماع ونطق)',
          tierLabel: tierLabel,
          tierClass: tierClass,
          instruction: "Listen carefully to the voice accent and choose the authentic meaning:",
          prompt: item.foreign,
          roman: item.roman,
          context: item.context || "Audio challenge: Listen carefully and match the meaning.",
          arabic: item.arabic,
          explanation: `Spoken phrase: "${item.foreign}" (${item.roman}) = "${item.english}".`,
          arabicExplanation: item.arabicExp || `العبارة المنطوقة تعني: ${item.arabic}`,
          options: this.shuffleOptions(
            { text: item.english, arabic: item.arabic, correct: true },
            item.wrongs
          )
        };
      }

      questions.push(qObj);
    });

    return questions;
  }

  static shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  static shuffleOptions(correctOpt, wrongsList) {
    const list = [
      { text: correctOpt.text, arabic: correctOpt.arabic, correct: true },
      { text: wrongsList[0].text, arabic: wrongsList[0].arabic, correct: false },
      { text: wrongsList[1].text, arabic: wrongsList[1].arabic, correct: false },
      { text: wrongsList[2].text, arabic: wrongsList[2].arabic, correct: false }
    ];
    return this.shuffleArray(list);
  }

  /**
   * Massive, Multi-Thematic Question Pools across Real-Life Situations
   */
  static getMultiThematicPool(lang) {
    const DB = {
      japanese: [
        // --- TIER 1: Foundational Daily Life & Courtesies ---
        {
          tier: 1,
          foreign: "こんにちは",
          roman: "(Konnichiwa)",
          english: "Hello / Good Day",
          arabic: "مرحباً / يوم سعيد",
          context: "Everyday daytime greeting across Japan.",
          arabicExp: "الكلمة تعني مرحباً وتُستخدم في التحية النهارية في كل مكان باليابان.",
          scrambleTokens: ["Hello", "good", "day"],
          distractorTokens: ["goodbye", "night", "soldier"],
          wrongs: [
            { text: "Goodbye", arabic: "إلى اللقاء / وداعاً" },
            { text: "Thank you", arabic: "شكراً لك" },
            { text: "Excuse me", arabic: "عفواً / معذرة" }
          ]
        },
        {
          tier: 1,
          foreign: "ありがとう",
          roman: "(Arigatou)",
          english: "Thank you",
          arabic: "شكراً لك",
          context: "Expressing daily gratitude to friends and servers.",
          arabicExp: "أريغاتو تعني شكراً للتعبير عن الشكر والامتنان.",
          scrambleTokens: ["Thank", "you", "very", "much"],
          distractorTokens: ["sorry", "please", "never"],
          wrongs: [
            { text: "You're welcome", arabic: "على الرحب والسعة" },
            { text: "Please wait", arabic: "من فضلك انتظر" },
            { text: "Pardon me", arabic: "المعذرة" }
          ]
        },
        {
          tier: 1,
          foreign: "お水をください",
          roman: "(Omizu o kudasai)",
          english: "Water, please",
          arabic: "ماء من فضلك",
          context: "Ordering complimentary water at any Tokyo café or diner.",
          arabicExp: "عبارة يومية أساسية لطلب كوب ماء في المطاعم والمقاهي.",
          scrambleTokens: ["Water,", "please,", "thank", "you"],
          distractorTokens: ["hot", "bread", "bill"],
          wrongs: [
            { text: "Coffee, please", arabic: "قهوة من فضلك" },
            { text: "The bill, please", arabic: "الحساب من فضلك" },
            { text: "Excuse me, waiter", arabic: "عفواً أيها النادل" }
          ]
        },
        {
          tier: 1,
          foreign: "はい、元気です",
          roman: "(Hai, genki desu)",
          english: "Yes, I am doing well",
          arabic: "نعم، أنا بخير وفي صحة جيدة",
          context: "Responding to 'How are you?' in daily conversation.",
          arabicExp: "الرد النموذجي للتأكيد على أنك بخير وبصحة جيدة.",
          scrambleTokens: ["Yes,", "I", "am", "doing", "well"],
          distractorTokens: ["no,", "tired", "busy"],
          wrongs: [
            { text: "No, I am sick", arabic: "لا، أنا مريض" },
            { text: "I have no time", arabic: "ليس لدي وقت" },
            { text: "Where are you going?", arabic: "إلى أين أنت ذاهب؟" }
          ]
        },
        {
          tier: 1,
          foreign: "すみません",
          roman: "(Sumimasen)",
          english: "Excuse me / Pardon",
          arabic: "عفواً / المعذرة",
          context: "Calling a waiter or getting someone's attention on the street.",
          arabicExp: "كلمة يومية متعددة الاستخدامات للاعتذار أو مناداة النادل.",
          scrambleTokens: ["Excuse", "me", "very", "much"],
          distractorTokens: ["welcome", "run", "stop"],
          wrongs: [
            { text: "See you tomorrow", arabic: "أراك غداً" },
            { text: "Good night", arabic: "طابت ليلتك" },
            { text: "Congratulations", arabic: "مبروك / تهانينا" }
          ]
        },
        {
          tier: 1,
          foreign: "おはようございます",
          roman: "(Ohayou gozaimasu)",
          english: "Good morning",
          arabic: "صباح الخير",
          context: "Polite morning greeting to coworkers, neighbors, and teachers.",
          arabicExp: "تحية الصباح الرسمية والمهذبة باللغة اليابانية.",
          scrambleTokens: ["Good", "morning", "to", "you"],
          distractorTokens: ["evening", "sleep", "lunch"],
          wrongs: [
            { text: "Good evening", arabic: "مساء الخير" },
            { text: "Good night", arabic: "تصبح على خير" },
            { text: "Have a safe flight", arabic: "رحلة طيران آمنة" }
          ]
        },

        // --- TIER 2: Practical Application (Dining, Transit & Shopping) ---
        {
          tier: 2,
          foreign: "駅はどこですか？",
          roman: "(Eki wa doko desu ka?)",
          english: "Where is the train station?",
          arabic: "أين تقع محطة القطار؟",
          context: "Navigating city streets and asking pedestrians for directions.",
          arabicExp: "سؤال يومي ضروري لمعرفة اتجاه وموقع محطة القطارات.",
          scrambleTokens: ["Where", "is", "the", "train", "station?"],
          distractorTokens: ["how", "hotel", "bus"],
          wrongs: [
            { text: "Where is the airport?", arabic: "أين يقع المطار؟" },
            { text: "How much is the ticket?", arabic: "كم سعر التذكرة؟" },
            { text: "Is the train arriving?", arabic: "هل وصل القطار؟" }
          ]
        },
        {
          tier: 2,
          foreign: "これはいくらですか？",
          roman: "(Kore wa ikura desu ka?)",
          english: "How much does this cost?",
          arabic: "كم ثمن هذا الشيء؟",
          context: "Asking the price of clothing, souvenirs, or food in shops.",
          arabicExp: "السؤال الأهم عند التسوق لمعرفة سعر السلعة أو الغرض.",
          scrambleTokens: ["How", "much", "does", "this", "cost?"],
          distractorTokens: ["who", "cheap", "many"],
          wrongs: [
            { text: "Do you accept credit cards?", arabic: "هل تقبلون البطاقات الائتمانية؟" },
            { text: "Can I try this on?", arabic: "هل يمكنني قياس هذا؟" },
            { text: "Where was this made?", arabic: "أين تم تصنيع هذا؟" }
          ]
        },
        {
          tier: 2,
          foreign: "とても美味しいです",
          roman: "(Totemo oishii desu)",
          english: "It is very delicious",
          arabic: "هذا الطعام لذيذ جداً",
          context: "Complimenting the chef or dining companions during lunch/dinner.",
          arabicExp: "عبارة مجاملة شائعة جداً للتعبير عن إعجابك بمذاق الطعام.",
          scrambleTokens: ["The", "food", "is", "very", "delicious"],
          distractorTokens: ["bad", "cold", "expensive"],
          wrongs: [
            { text: "It is too spicy", arabic: "إنه حار للغاية" },
            { text: "I am full now", arabic: "لقد شبعت الآن" },
            { text: "Could I have the menu?", arabic: "هل يمكنني الحصول على قائمة الطعام؟" }
          ]
        },
        {
          tier: 2,
          foreign: "お会計をお願いします",
          roman: "(Okaikei o onegaishimasu)",
          english: "The bill, please",
          arabic: "الحساب من فضلك",
          context: "Asking the restaurant server for the check/bill.",
          arabicExp: "العبارة المعتادة لطلب الفاتورة ودفع الحساب بالمطعم.",
          scrambleTokens: ["Can", "I", "have", "the", "bill,", "please?"],
          distractorTokens: ["order", "menu", "dessert"],
          wrongs: [
            { text: "Bring the menu, please", arabic: "أحضر القائمة من فضلك" },
            { text: "Another glass of water", arabic: "كوب ماء إضافي" },
            { text: "Where are the restrooms?", arabic: "أين تقع دورات المياه؟" }
          ]
        },
        {
          tier: 2,
          foreign: "クレジットカードは使えますか？",
          roman: "(Kurejitto kaado wa tsukaemasu ka?)",
          english: "Can I pay by credit card?",
          arabic: "هل يمكنني الدفع بالبطاقة الائتمانية؟",
          context: "Checking payment method at cash registers and convenience stores.",
          arabicExp: "سؤال الاستفسار عن إمكانية الدفع بالفيزا أو الماستركارد.",
          scrambleTokens: ["Can", "I", "pay", "by", "credit", "card?"],
          distractorTokens: ["cash", "cheap", "receipt"],
          wrongs: [
            { text: "Do you have change for cash?", arabic: "هل لديك فكة نقدية؟" },
            { text: "Can you give me a discount?", arabic: "هل يمكنك إعطائي خصماً؟" },
            { text: "Please give me a receipt", arabic: "من فضلك أعطني إيصال الدفع" }
          ]
        },
        {
          tier: 2,
          foreign: "Wi-Fiのパスワードは何ですか？",
          roman: "(Waifai no pasuwaado wa nan desu ka?)",
          english: "What is the Wi-Fi password?",
          arabic: "ما هي كلمة سر الواي فاي؟",
          context: "Asking for internet access at cafés, hotels, and airports.",
          arabicExp: "سؤال تقني يومي مهم للاتصال بشبكة الإنترنت في الأماكن العامة.",
          scrambleTokens: ["What", "is", "the", "Wi-Fi", "password?"],
          distractorTokens: ["speed", "phone", "network"],
          wrongs: [
            { text: "Where can I charge my phone?", arabic: "أين يمكنني شحن هاتفي؟" },
            { text: "Is the internet connection fast?", arabic: "هل سرعة الإنترنت سريعة؟" },
            { text: "Do you have free computers?", arabic: "هل لديكم أجهزة حاسوب مجانية؟" }
          ]
        },

        // --- TIER 3: Advanced Mastery (Health, Emergency, Work & Complex) ---
        {
          tier: 3,
          foreign: "病院はどこですか？助けてください",
          roman: "(Byouin wa doko desu ka? Tasukete kudasai)",
          english: "Where is the hospital? Please help me",
          arabic: "أين يقع المستشفى؟ أرجوكم ساعدوني",
          context: "Urgent medical emergency phrase when requiring care.",
          arabicExp: "نداء استغاثة طارئ لطلب المساعدة والتوجه للمستشفى فوراً.",
          scrambleTokens: ["Where", "is", "the", "hospital?", "Please", "help", "me!"],
          distractorTokens: ["pharmacy", "hotel", "bus"],
          wrongs: [
            { text: "Where is the drug store?", arabic: "أين تقع الصيدلية؟" },
            { text: "I lost my passport", arabic: "لقد فقدت جواز سفري" },
            { text: "Can you call a taxi?", arabic: "هل يمكنك طلب سيارة أجرة؟" }
          ]
        },
        {
          tier: 3,
          foreign: "頭が痛いです。薬はありますか？",
          roman: "(Atama ga itai desu. Kusuri wa arimasu ka?)",
          english: "I have a headache. Do you have medicine?",
          arabic: "أشعر بصداع في رأسي. هل لديكم دواء؟",
          context: "Inquiring at pharmacies or hotel front desk for pain relief.",
          arabicExp: "جملة طبية شائعة لوصف آلام الرأس وطلب الدواء المناسب.",
          scrambleTokens: ["I", "have", "a", "headache.", "Do", "you", "have", "medicine?"],
          distractorTokens: ["fever", "sleep", "doctor"],
          wrongs: [
            { text: "My stomach hurts badly", arabic: "معدتي تؤلمني بشدة" },
            { text: "I have a high fever", arabic: "لدي حرارة مرتفعة" },
            { text: "Where is the emergency room?", arabic: "أين غرفة الطوارئ؟" }
          ]
        },
        {
          tier: 3,
          foreign: "明日の会議は何時から始まりますか？",
          roman: "(Ashita no kaigi wa nanji kara hajimarimasu ka?)",
          english: "What time does tomorrow's meeting start?",
          arabic: "في أي ساعة سيبدأ اجتماع الغد؟",
          context: "Professional workplace communication with colleagues.",
          arabicExp: "سؤال مهني في بيئة العمل للاستفسار عن موعد الاجتماع.",
          scrambleTokens: ["What", "time", "does", "tomorrow's", "meeting", "start?"],
          distractorTokens: ["today", "finish", "late"],
          wrongs: [
            { text: "Can we cancel the meeting?", arabic: "هل يمكننا إلغاء الاجتماع؟" },
            { text: "Did you send the report?", arabic: "هل أرسلت التقرير؟" },
            { text: "Where is the conference room?", arabic: "أين قاعة المؤتمرات؟" }
          ]
        },
        {
          tier: 3,
          foreign: "影の軍勢よ、起きろ",
          roman: "(Kage no gunzei yo, okiro)",
          english: "Shadow Legion, arise!",
          arabic: "يا جيش الظلال، انهضوا!",
          context: "The iconic anime monarch invocation of sovereign authority.",
          arabicExp: "النداء الشهير المستوحى من سولو ليفلينغ لاستدعاء جنود الظلال.",
          scrambleTokens: ["Shadow", "Legion,", "arise", "from", "darkness!"],
          distractorTokens: ["sleep", "flee", "retreat"],
          wrongs: [
            { text: "Retreat into the shadows", arabic: "تراجعوا إلى الظلال" },
            { text: "Surrender your weapons", arabic: "استسلموا وسلموا أسلحتكم" },
            { text: "The gate has collapsed", arabic: "لقد انهارت البوابة" }
          ]
        },
        {
          tier: 3,
          foreign: "電脳空間の接続が完了しました",
          roman: "(Dennō kūkan no setsuzoku ga kanryou shimashita)",
          english: "Cyberspace connection completed",
          arabic: "اكتمل الاتصال بالفضاء السيبراني بنجاح",
          context: "Modern cyberpunk tech interface status notification.",
          arabicExp: "إشعار تقني يؤكد اكتمال الربط بالشبكة الرقمية والمصفوفة.",
          scrambleTokens: ["The", "cyberspace", "connection", "is", "now", "completed"],
          distractorTokens: ["failed", "offline", "slow"],
          wrongs: [
            { text: "Connection failed completely", arabic: "فشل الاتصال بالكامل" },
            { text: "Password is wrong", arabic: "كلمة المرور غير صحيحة" },
            { text: "Download is in progress", arabic: "التحميل قيد التقدم" }
          ]
        },
        {
          tier: 3,
          foreign: "素晴らしい勝利を収めました",
          roman: "(Subarashii shouri o osamemashita)",
          english: "We achieved a glorious victory",
          arabic: "لقد حققنا انتصاراً رائعاً ومجيداً",
          context: "Celebrating decisive milestone completion with teammates.",
          arabicExp: "تعبير راقٍ للاحتفال بالفوز الكبير وتحقيق الإنجاز.",
          scrambleTokens: ["We", "have", "achieved", "a", "glorious", "victory"],
          distractorTokens: ["lost", "tied", "escaped"],
          wrongs: [
            { text: "We were badly defeated", arabic: "لقد هُزمنا بشكل مريع" },
            { text: "Let us try again later", arabic: "دعنا نحاول مرة أخرى لاحقاً" },
            { text: "The battle was a tie", arabic: "كانت المعركة تعادلاً" }
          ]
        }
      ],

      french: [
        // --- TIER 1: Foundational Daily Life ---
        {
          tier: 1,
          foreign: "Bonjour, comment allez-vous ?",
          roman: "(Bohn-zhoor, koh-mahn tah-lay voo?)",
          english: "Hello, how are you?",
          arabic: "مرحباً، كيف حالك؟",
          context: "Polite French street and social greeting.",
          arabicExp: "التحية اليومية الكلاسيكية باللغة الفرنسية للسؤال عن الحال.",
          scrambleTokens: ["Hello,", "how", "are", "you", "doing?"],
          distractorTokens: ["goodbye", "night", "tired"],
          wrongs: [
            { text: "Good night, sleep well", arabic: "طابت ليلتك، نم جيداً" },
            { text: "What is your name?", arabic: "ما هو اسمك؟" },
            { text: "Where do you work?", arabic: "أين تعمل؟" }
          ]
        },
        {
          tier: 1,
          foreign: "Un café, s'il vous plaît",
          roman: "(Uh kah-fay, seel voo pleh)",
          english: "A coffee, please",
          arabic: "قهوة من فضلك",
          context: "Ordering an espresso at a Parisian sidewalk café.",
          arabicExp: "أشهر عبارة لطلب فنجان قهوة في المقاهي الفرنسية.",
          scrambleTokens: ["A", "coffee,", "please,", "thank", "you"],
          distractorTokens: ["water", "tea", "bread"],
          wrongs: [
            { text: "A glass of water, please", arabic: "كوب ماء من فضلك" },
            { text: "The bill, please", arabic: "الحساب من فضلك" },
            { text: "Where is the restroom?", arabic: "أين الحمام؟" }
          ]
        },
        {
          tier: 1,
          foreign: "Merci beaucoup",
          roman: "(Mair-see boh-koo)",
          english: "Thank you very much",
          arabic: "شكراً جزيلاً لك",
          context: "Expressing sincere gratitude in daily interactions.",
          arabicExp: "عبارة الشكر والامتنان الأكثر استخداماً باللغة الفرنسية.",
          scrambleTokens: ["Thank", "you", "very", "much,", "friend"],
          distractorTokens: ["never", "bad", "sorry"],
          wrongs: [
            { text: "You're welcome", arabic: "عفواً / لا شكر على واجب" },
            { text: "Excuse me please", arabic: "المعذرة من فضلك" },
            { text: "See you tomorrow", arabic: "أراك غداً" }
          ]
        },
        {
          tier: 1,
          foreign: "Oui, je vais très bien",
          roman: "(Wee, zhuh vay tray byehn)",
          english: "Yes, I am doing very well",
          arabic: "نعم، أنا بخير حال وعلى ما يرام",
          context: "Affirmative positive response to greeting.",
          arabicExp: "الرد النموذجي الإيجابي لتأكيد أنك بصحة وحال ممتازة.",
          scrambleTokens: ["Yes,", "I", "am", "doing", "very", "well"],
          distractorTokens: ["no", "bad", "late"],
          wrongs: [
            { text: "No, I am sick today", arabic: "لا، أنا مريض اليوم" },
            { text: "I have to leave now", arabic: "يجب أن أغادر الآن" },
            { text: "It is raining outside", arabic: "إنها تمطر في الخارج" }
          ]
        },
        {
          tier: 1,
          foreign: "S'il vous plaît",
          roman: "(Seel voo pleh)",
          english: "Please",
          arabic: "من فضلك / رجاءً",
          context: "Essential courtesy added to requests.",
          arabicExp: "أهم عبارة للطلب بتهذيب وأدب باللغة الفرنسية.",
          scrambleTokens: ["Please,", "help", "me", "here"],
          distractorTokens: ["no", "never", "stop"],
          wrongs: [
            { text: "Pardon me", arabic: "المعذرة" },
            { text: "Goodbye", arabic: "إلى اللقاء" },
            { text: "Good evening", arabic: "مساء الخير" }
          ]
        },
        {
          tier: 1,
          foreign: "Bonne soirée",
          roman: "(Buhn swah-ray)",
          english: "Have a nice evening",
          arabic: "أتمنى لك أمسية طيبة وممتعة",
          context: "Parting wish when leaving someone in the late afternoon/evening.",
          arabicExp: "تحية توديع لطيفة عند المغادرة في المساء.",
          scrambleTokens: ["Have", "a", "very", "nice", "evening"],
          distractorTokens: ["morning", "sleep", "lunch"],
          wrongs: [
            { text: "Good morning", arabic: "صباح الخير" },
            { text: "Have a good trip", arabic: "رحلة موفقة" },
            { text: "Happy birthday", arabic: "عيد ميلاد سعيد" }
          ]
        },

        // --- TIER 2: Practical Application (Transit, Dining & Shopping) ---
        {
          tier: 2,
          foreign: "Où est la station de métro ?",
          roman: "(Oo eh lah stah-syon duh meh-troh?)",
          english: "Where is the subway station?",
          arabic: "أين تقع محطة قطار المترو؟",
          context: "Asking directions to navigate the Paris underground network.",
          arabicExp: "سؤال يومي ضروري للاستفسار عن موقع محطة المترو.",
          scrambleTokens: ["Where", "is", "the", "subway", "station?"],
          distractorTokens: ["airport", "bus", "hotel"],
          wrongs: [
            { text: "Where is the airport terminal?", arabic: "أين صالة المطار؟" },
            { text: "How much is a ticket?", arabic: "كم سعر التذكرة؟" },
            { text: "What time is the train?", arabic: "في أي ساعة القطار؟" }
          ]
        },
        {
          tier: 2,
          foreign: "L'addition, s'il vous plaît",
          roman: "(Lah-dee-syon, seel voo pleh)",
          english: "The check / bill, please",
          arabic: "الفاتورة / الحساب من فضلك",
          context: "Requesting the bill after finishing a meal.",
          arabicExp: "العبارة المعتمدة لطلب فاتورة الطعام في المطاعم والمقاهي.",
          scrambleTokens: ["Can", "we", "have", "the", "bill,", "please?"],
          distractorTokens: ["water", "menu", "bread"],
          wrongs: [
            { text: "Bring the dessert menu", arabic: "أحضر قائمة الحلويات" },
            { text: "A table for four people", arabic: "طاولة لأربعة أشخاص" },
            { text: "Is service included?", arabic: "هل الخدمة مشمولة؟" }
          ]
        },
        {
          tier: 2,
          foreign: "Combien coûte cette veste ?",
          roman: "(Kohm-byehn koot set vest?)",
          english: "How much does this jacket cost?",
          arabic: "كم يبلغ سعر هذه السترة؟",
          context: "Shopping for clothing in Parisian boutiques.",
          arabicExp: "سؤال التسوق الكلاسيكي لمعرفة ثمن الملابس أو البضائع.",
          scrambleTokens: ["How", "much", "does", "this", "jacket", "cost?"],
          distractorTokens: ["shoes", "cheap", "color"],
          wrongs: [
            { text: "Do you have this in blue?", arabic: "هل لديكم هذا باللون الأزرق؟" },
            { text: "Where are fitting rooms?", arabic: "أين غرف القياس؟" },
            { text: "Is this jacket on sale?", arabic: "هل هذه السترة عليها تخفيض؟" }
          ]
        },
        {
          tier: 2,
          foreign: "Ce plat est délicieux",
          roman: "(Suh plah ay day-lee-syuh)",
          english: "This dish is delicious",
          arabic: "هذا الطبق لذيذ وشهي جداً",
          context: "Expressing culinary enjoyment at a French restaurant.",
          arabicExp: "عبارة إطراء للمطعم للتعبير عن المذاق الشهي للطبق.",
          scrambleTokens: ["This", "French", "dish", "is", "delicious"],
          distractorTokens: ["cold", "bad", "sweet"],
          wrongs: [
            { text: "The soup is too salty", arabic: "الحساء مالح للغاية" },
            { text: "I did not order this", arabic: "أنا لم أطلب هذا" },
            { text: "Can you heat this up?", arabic: "هل يمكنك تسخين هذا؟" }
          ]
        },
        {
          tier: 2,
          foreign: "Puis-je payer par carte ?",
          roman: "(Pweezh pay-yay pahr kahrt?)",
          english: "May I pay by card?",
          arabic: "هل أستطيع الدفع بواسطة البطاقة البنكية؟",
          context: "Confirming electronic card payment at cash desk.",
          arabicExp: "سؤال الدفع المعتاد لاستخدام البطاقة البنكية بدل النقد.",
          scrambleTokens: ["May", "I", "pay", "with", "credit", "card?"],
          distractorTokens: ["cash", "coin", "receipt"],
          wrongs: [
            { text: "Do you only accept cash?", arabic: "هل تقبلون النقد فقط؟" },
            { text: "Can I have my change?", arabic: "هل يمكنني أخذ الفكة؟" },
            { text: "Where is the nearest ATM?", arabic: "أين أقرب صراف آلي؟" }
          ]
        },
        {
          tier: 2,
          foreign: "Quel est le mot de passe Wi-Fi ?",
          roman: "(Kel ay luh moh duh pahs wee-fee?)",
          english: "What is the Wi-Fi password?",
          arabic: "ما هي كلمة سر الواي فاي؟",
          context: "Connecting your devices to café/hotel networks.",
          arabicExp: "طلب كلمة مرور شبكة الإنترنت في الأماكن العامة.",
          scrambleTokens: ["What", "is", "the", "Wi-Fi", "password,", "please?"],
          distractorTokens: ["phone", "name", "login"],
          wrongs: [
            { text: "My battery is running low", arabic: "بطاريتي شارفت على النفاد" },
            { text: "Where can I plug in my laptop?", arabic: "أين يمكنني توصيل حاسوبي؟" },
            { text: "Is the Wi-Fi completely free?", arabic: "هل الواي فاي مجاني بالكامل؟" }
          ]
        },

        // --- TIER 3: Advanced Mastery (Health, Work & Tech) ---
        {
          tier: 3,
          foreign: "J'ai besoin d'un médecin immédiatement",
          roman: "(Zhay buh-zwahn duhn mayd-sahn eem-may-dyaht-mahn)",
          english: "I need a doctor immediately",
          arabic: "أحتاج إلى طبيب على الفور وبشكل عاجل",
          context: "Urgent medical request in case of health issues.",
          arabicExp: "جملة طارئة لطلب الرعاية الطبية الفورية من الأطباء.",
          scrambleTokens: ["I", "need", "a", "doctor", "immediately", "here!"],
          distractorTokens: ["pharmacy", "hotel", "pill"],
          wrongs: [
            { text: "I need some cough syrup", arabic: "أحتاج إلى شراب للسعال" },
            { text: "Where is the pharmacy?", arabic: "أين تقع الصيدلية؟" },
            { text: "I have a slight cold", arabic: "لدي نزلة برد طفيفة" }
          ]
        },
        {
          tier: 3,
          foreign: "Le rapport sera envoyé avant midi",
          roman: "(Luh rah-por suh-rah ahn-vwah-yay ah-vahn mee-dee)",
          english: "The report will be sent before noon",
          arabic: "سيتم إرسال التقرير قبل ظهر اليوم",
          context: "Professional office commitment regarding work deliverables.",
          arabicExp: "جملة عمل احترافية لتأكيد موعد تسليم وإرسال التقرير.",
          scrambleTokens: ["The", "report", "will", "be", "sent", "before", "noon"],
          distractorTokens: ["meeting", "tomorrow", "late"],
          wrongs: [
            { text: "The meeting has been rescheduled", arabic: "تمت إعادة جدولة الاجتماع" },
            { text: "Please review this document", arabic: "من فضلك راجع هذا المستند" },
            { text: "I will be absent today", arabic: "سأكون غائباً اليوم" }
          ]
        },
        {
          tier: 3,
          foreign: "Le Monarque des Ombres s'éveille",
          roman: "(Luh moh-nark day zohm-br say-vay)",
          english: "The Shadow Monarch awakens",
          arabic: "سيد الظلال يستيقظ الآن",
          context: "Legendary sovereign awakening invocation.",
          arabicExp: "عبارة استيقاظ سيد الظلال المستوحاة من عالم الأنمي.",
          scrambleTokens: ["The", "mighty", "Shadow", "Monarch", "awakens!"],
          distractorTokens: ["falls", "sleeps", "flees"],
          wrongs: [
            { text: "The army has retreated", arabic: "لقد تراجع الجيش" },
            { text: "The light warrior fell", arabic: "سقط محارب النور" },
            { text: "Close the sealed gate", arabic: "أغلق البوابة المختومة" }
          ]
        },
        {
          tier: 3,
          foreign: "Nous avons remporté une victoire totale",
          roman: "(Noo zah-vohn rahn-por-tay oon veek-twahr toh-tahl)",
          english: "We achieved a total victory",
          arabic: "لقد أحرزنا انتصاراً ساحقاً وشاملاً",
          context: "Celebrating successful team achievement.",
          arabicExp: "إعلان الفوز المؤزر والانتصار التام بعد مجهود شاق.",
          scrambleTokens: ["We", "have", "achieved", "a", "total", "victory!"],
          distractorTokens: ["defeat", "tie", "retreat"],
          wrongs: [
            { text: "The mission was canceled", arabic: "تم إلغاء المهمة" },
            { text: "We were badly surrounded", arabic: "كنا محاصرين بشدة" },
            { text: "Let us try again tomorrow", arabic: "فلنحاول مجدداً غداً" }
          ]
        }
      ],

      spanish: [
        // --- TIER 1: Foundational Daily Life ---
        {
          tier: 1,
          foreign: "¡Hola! ¿Cómo estás?",
          roman: "(Oh-lah! Koh-moh ehs-tahs?)",
          english: "Hello! How are you?",
          arabic: "أهلاً! كيف حالك؟",
          context: "Standard warm greeting across Spain and Latin America.",
          arabicExp: "التحية اليومية الأكثر شيوعاً باللغة الإسبانية للاطمئنان على الحال.",
          scrambleTokens: ["Hello!", "How", "are", "you", "doing?"],
          distractorTokens: ["goodbye", "night", "bad"],
          wrongs: [
            { text: "Goodbye, see you later", arabic: "وداعاً، أراك لاحقاً" },
            { text: "What is your job?", arabic: "ما هو عملك؟" },
            { text: "Where do you live?", arabic: "أين تعيش؟" }
          ]
        },
        {
          tier: 1,
          foreign: "Un café con leche, por favor",
          roman: "(Oon kah-fay kohn leh-cheh, pohr fah-vohr)",
          english: "Coffee with milk, please",
          arabic: "قهوة بالحليب، من فضلك",
          context: "Classic morning order at any Spanish cafeteria.",
          arabicExp: "طلب القهوة بالحليب المفضل في الصباح في إسبانيا.",
          scrambleTokens: ["Coffee", "with", "milk,", "please,", "thanks"],
          distractorTokens: ["water", "tea", "bread"],
          wrongs: [
            { text: "A glass of orange juice", arabic: "كوب عصير برتقال" },
            { text: "The bill, please", arabic: "الحساب من فضلك" },
            { text: "Is breakfast ready?", arabic: "هل الإفطار جاهز؟" }
          ]
        },
        {
          tier: 1,
          foreign: "Muchas gracias",
          roman: "(Moo-chahs grah-syahs)",
          english: "Thank you very much",
          arabic: "شكراً جزيلاً لك",
          context: "Expressing heartfelt gratitude in daily encounters.",
          arabicExp: "عبارة الشكر والامتنان الأساسية باللغة الإسبانية.",
          scrambleTokens: ["Thank", "you", "very", "much,", "friend"],
          distractorTokens: ["never", "bad", "sorry"],
          wrongs: [
            { text: "You are welcome", arabic: "على الرحب والسعة" },
            { text: "Excuse me please", arabic: "المعذرة من فضلك" },
            { text: "Never mind", arabic: "لا تكترث للأمر" }
          ]
        },
        {
          tier: 1,
          foreign: "Muy bien, gracias",
          roman: "(Mwee byehn, grah-syahs)",
          english: "Very well, thank you",
          arabic: "بخير جداً، شكراً لك",
          context: "Polite affirmative reply to daily greetings.",
          arabicExp: "الرد النموذجي المهذب لتأكيد أنك بصحة وحال جيدة.",
          scrambleTokens: ["I", "am", "doing", "very", "well,", "thanks"],
          distractorTokens: ["no", "sick", "late"],
          wrongs: [
            { text: "I feel sick today", arabic: "أشعر بالمرض اليوم" },
            { text: "I have to hurry up", arabic: "عليّ أن أسرع" },
            { text: "Where are you going?", arabic: "إلى أين أنت ذاهب؟" }
          ]
        },
        {
          tier: 1,
          foreign: "Buenos días",
          roman: "(Bweh-nohs dee-ahs)",
          english: "Good morning",
          arabic: "صباح الخير",
          context: "Standard morning greeting used throughout the Spanish-speaking world.",
          arabicExp: "تحية الصباح الرسمية واليومية باللغة الإسبانية.",
          scrambleTokens: ["Good", "morning", "to", "all", "of", "you"],
          distractorTokens: ["night", "lunch", "sleep"],
          wrongs: [
            { text: "Good night", arabic: "طابت ليلتك" },
            { text: "Good afternoon", arabic: "طاب مساؤك" },
            { text: "Have a nice weekend", arabic: "عطلة نهاية أسبوع سعيدة" }
          ]
        },

        // --- TIER 2: Practical Application (Transit, Dining & Shopping) ---
        {
          tier: 2,
          foreign: "¿Dónde está la estación de tren?",
          roman: "(Dohn-deh ehs-tah lah ehs-tah-syon deh trehn?)",
          english: "Where is the train station?",
          arabic: "أين تقع محطة القطار؟",
          context: "Locating regional and commuter railway stations.",
          arabicExp: "سؤال الاستفسار عن محطة القطارات والسكك الحديدية.",
          scrambleTokens: ["Where", "is", "the", "railway", "train", "station?"],
          distractorTokens: ["bus", "airport", "taxi"],
          wrongs: [
            { text: "Where is the bus terminal?", arabic: "أين محطة الحافلات؟" },
            { text: "How much is the ticket?", arabic: "كم ثمن التذكرة؟" },
            { text: "What platform does it leave from?", arabic: "من أي رصيف يغادر؟" }
          ]
        },
        {
          tier: 2,
          foreign: "¿Cuánto cuesta esto?",
          roman: "(Kwahn-toh kwehs-tah ehs-toh?)",
          english: "How much does this cost?",
          arabic: "كم ثمن هذا؟",
          context: "Checking merchandise and food prices at stores.",
          arabicExp: "السؤال الأهم عند التسوق وشراء الأغراض في السوق.",
          scrambleTokens: ["How", "much", "does", "this", "item", "cost?"],
          distractorTokens: ["who", "cheap", "color"],
          wrongs: [
            { text: "Can I try this shirt on?", arabic: "هل يمكنني قياس هذا القميص؟" },
            { text: "Do you have smaller sizes?", arabic: "هل لديكم مقاسات أصغر؟" },
            { text: "Where is the cash register?", arabic: "أين صندوق الدفع؟" }
          ]
        },
        {
          tier: 2,
          foreign: "La comida está deliciosa",
          roman: "(Lah koh-mee-dah ehs-tah deh-lee-syoh-sah)",
          english: "The food is delicious",
          arabic: "الطعام لذيذ وشهي للغاية",
          context: "Complimenting the meal at tapas bars and restaurants.",
          arabicExp: "عبارة جميلة للإشادة بجودة ومذاق الطعام المقدم بالمطعم.",
          scrambleTokens: ["The", "Spanish", "food", "is", "truly", "delicious"],
          distractorTokens: ["bad", "cold", "expensive"],
          wrongs: [
            { text: "The soup is cold", arabic: "الحساء بارد" },
            { text: "Can we have more bread?", arabic: "هل يمكننا أخذ المزيد من الخبز؟" },
            { text: "We are ready to order", arabic: "نحن مستعدون للطلب" }
          ]
        },
        {
          tier: 2,
          foreign: "La cuenta, por favor",
          roman: "(Lah kwehn-tah, pohr fah-vohr)",
          english: "The check / bill, please",
          arabic: "الحساب من فضلك",
          context: "Requesting the check when finishing dining.",
          arabicExp: "العبارة المعتادة لطلب فاتورة الطعام في المطاعم الإسبانية.",
          scrambleTokens: ["Could", "you", "bring", "the", "bill,", "please?"],
          distractorTokens: ["water", "menu", "dessert"],
          wrongs: [
            { text: "Bring the dessert list", arabic: "أحضر قائمة الحلويات" },
            { text: "Another bottle of water", arabic: "زجاجة ماء إضافية" },
            { text: "Where are the restrooms?", arabic: "أين تقع دورات المياه؟" }
          ]
        },
        {
          tier: 2,
          foreign: "¿Puedo pagar con tarjeta?",
          roman: "(Pweh-doh pah-gahr kohn tahr-heh-tah?)",
          english: "Can I pay by card?",
          arabic: "هل يمكنني الدفع بالبطاقة؟",
          context: "Confirming credit or debit card acceptance.",
          arabicExp: "سؤال الاستفسار عن إمكانية الدفع بالبطاقة البنكية.",
          scrambleTokens: ["Can", "I", "pay", "using", "credit", "card?"],
          distractorTokens: ["cash", "coin", "receipt"],
          wrongs: [
            { text: "Do you only accept cash?", arabic: "هل تقبلون النقد فقط؟" },
            { text: "Can I have my receipt?", arabic: "هل يمكنني أخذ الإيصال؟" },
            { text: "Is there an ATM nearby?", arabic: "هل يوجد صراف آلي قريب؟" }
          ]
        },
        {
          tier: 2,
          foreign: "¿Cuál es la contraseña del Wi-Fi?",
          roman: "(Kwahl ehs lah kohn-trah-seh-nyah dehl wee-fee?)",
          english: "What is the Wi-Fi password?",
          arabic: "ما هي كلمة سر الواي فاي؟",
          context: "Inquiring about wireless internet access.",
          arabicExp: "طلب كلمة مرور شبكة الإنترنت في المقاهي والفنادق.",
          scrambleTokens: ["What", "is", "the", "Wi-Fi", "password,", "please?"],
          distractorTokens: ["speed", "phone", "network"],
          wrongs: [
            { text: "Where can I charge my phone?", arabic: "أين يمكنني شحن هاتفي؟" },
            { text: "Is the connection fast?", arabic: "هل سرعة الاتصال جيدة؟" },
            { text: "Do you have power outlets?", arabic: "هل لديكم مقابس كهرباء؟" }
          ]
        },

        // --- TIER 3: Advanced Mastery (Health, Work & Tech) ---
        {
          tier: 3,
          foreign: "Necesito un médico con urgencia",
          roman: "(Neh-seh-see-toh oon meh-dee-koh kohn oor-hehn-syah)",
          english: "I need a doctor urgently",
          arabic: "أحتاج إلى طبيب بشكل عاجل وطارئ",
          context: "Critical medical situation request.",
          arabicExp: "طلب عاجل للرعاية الطبية عند حدوث وعكة صحية طارئة.",
          scrambleTokens: ["I", "need", "a", "doctor", "very", "urgently", "now!"],
          distractorTokens: ["pharmacy", "hotel", "bus"],
          wrongs: [
            { text: "Where is the pharmacy?", arabic: "أين تقع الصيدلية؟" },
            { text: "I have a sore throat", arabic: "لدي التهاب بالحلق" },
            { text: "Can you call an ambulance?", arabic: "هل يمكنك الاتصال بالإسعاف؟" }
          ]
        },
        {
          tier: 3,
          foreign: "El Rey de las Sombras despierta",
          roman: "(Ehl Ray deh lahs Sohm-brahs dehs-pyer-tah)",
          english: "The King of Shadows awakens",
          arabic: "ملك الظلال يستيقظ الآن",
          context: "Monarch anime power manifestation.",
          arabicExp: "استيقاظ ملك وسيد الظلال الأسطوري.",
          scrambleTokens: ["The", "supreme", "King", "of", "Shadows", "awakens!"],
          distractorTokens: ["sleeps", "flees", "falls"],
          wrongs: [
            { text: "The legion has retreated", arabic: "تراجع جيش الظلال" },
            { text: "The red gate is closed", arabic: "البوابة الحمراء مغلقة" },
            { text: "The beast monarch arrived", arabic: "وصل ملك الوحوش" }
          ]
        },
        {
          tier: 3,
          foreign: "Hemos logrado una gran victoria",
          roman: "(Eh-mohs loh-grah-doh oo-nah grahn veek-toh-ryah)",
          english: "We achieved a great victory",
          arabic: "لقد حققنا انتصاراً عظيماً ومبهراً",
          context: "Celebration of major shared success.",
          arabicExp: "التعبير عن الفوز الساحق والانتصار الكبير بعد التحدي.",
          scrambleTokens: ["We", "have", "achieved", "a", "great", "triumphant", "victory!"],
          distractorTokens: ["lost", "tied", "escaped"],
          wrongs: [
            { text: "We were totally defeated", arabic: "لقد هُزمنا بالكامل" },
            { text: "The mission failed", arabic: "فشلت المهمة الموكلة" },
            { text: "Let us retreat now", arabic: "دعنا نتراجع الآن" }
          ]
        }
      ],

      english: [
        // --- TIER 1: Foundational Daily Life ---
        {
          tier: 1,
          foreign: "Hello, how are you doing today?",
          roman: "(Everyday Greeting)",
          english: "Hello, how are you doing today?",
          arabic: "مرحباً، كيف حالك اليوم؟",
          context: "Standard polite greeting in English speaking countries.",
          arabicExp: "التحية اليومية الأكثر شيوعاً باللغة الإنجليزية للسؤال عن الحال.",
          scrambleTokens: ["Hello,", "how", "are", "you", "doing", "today?"],
          distractorTokens: ["goodbye", "night", "bad"],
          wrongs: [
            { text: "Goodbye, see you next week", arabic: "وداعاً، أراك الأسبوع القادم" },
            { text: "What is your occupation?", arabic: "ما هي مهنتك؟" },
            { text: "Where did you grow up?", arabic: "أين نشأت وترعرعت؟" }
          ]
        },
        {
          tier: 1,
          foreign: "Could I have a cup of coffee, please?",
          roman: "(Café Order)",
          english: "Could I have a cup of coffee, please?",
          arabic: "هل يمكنني الحصول على فنجان قهوة، من فضلك؟",
          context: "Polite order at coffee shops and diners.",
          arabicExp: "صيغة مهذبة جداً لطلب فنجان قهوة في المقاهي.",
          scrambleTokens: ["Could", "I", "have", "a", "cup", "of", "coffee,", "please?"],
          distractorTokens: ["tea", "water", "bill"],
          wrongs: [
            { text: "Can I have the check, please?", arabic: "هل يمكنني أخذ الفاتورة من فضلك؟" },
            { text: "Where is the bathroom located?", arabic: "أين يقع الحمام؟" },
            { text: "Is the Wi-Fi working here?", arabic: "هل يعمل الواي فاي هنا؟" }
          ]
        },
        {
          tier: 1,
          foreign: "Thank you very much for your help",
          roman: "(Gratitude)",
          english: "Thank you very much for your help",
          arabic: "شكراً جزيلاً لك على مساعدتك",
          context: "Expressing genuine gratitude when assisted.",
          arabicExp: "عبارة شكر وامتنان راقية لتقدير المساعدة المقدمة لك.",
          scrambleTokens: ["Thank", "you", "very", "much", "for", "your", "kind", "help"],
          distractorTokens: ["never", "bad", "sorry"],
          wrongs: [
            { text: "You are welcome anytime", arabic: "على الرحب والسعة في أي وقت" },
            { text: "Excuse me for a moment", arabic: "المعذرة للحظة" },
            { text: "I do not understand", arabic: "أنا لا أفهم ما تقوله" }
          ]
        },

        // --- TIER 2: Practical Transit, Dining & Shopping ---
        {
          tier: 2,
          foreign: "Excuse me, where is the nearest subway station?",
          roman: "(Transit Navigation)",
          english: "Excuse me, where is the nearest subway station?",
          arabic: "عفواً، أين تقع أقرب محطة مترو أنفاق؟",
          context: "Asking pedestrians for city navigation guidance.",
          arabicExp: "سؤال الاستفسار عن موقع أقرب محطة قطارات في المدينة.",
          scrambleTokens: ["Excuse", "me,", "where", "is", "the", "nearest", "subway", "station?"],
          distractorTokens: ["hotel", "bus", "airport"],
          wrongs: [
            { text: "Where is the international airport?", arabic: "أين يقع المطار الدولي؟" },
            { text: "How much does a subway pass cost?", arabic: "كم تكلفة تذكرة المترو؟" },
            { text: "Which bus goes downtown?", arabic: "أي حافلة تتجه لوسط المدينة؟" }
          ]
        },
        {
          tier: 2,
          foreign: "Can we have the bill, please?",
          roman: "(Dining Payment)",
          english: "Can we have the bill, please?",
          arabic: "هل يمكننا الحصول على الفاتورة، من فضلك؟",
          context: "Asking for the restaurant check after a meal.",
          arabicExp: "العبارة المعتادة لطلب فاتورة الطعام عند الانتهاء من الأكل.",
          scrambleTokens: ["Can", "we", "please", "have", "the", "bill,", "waiter?"],
          distractorTokens: ["menu", "water", "dessert"],
          wrongs: [
            { text: "Can we see the dessert menu?", arabic: "هل يمكننا رؤية قائمة الحلويات؟" },
            { text: "Is this table reserved?", arabic: "هل هذه الطاولة محجوزة؟" },
            { text: "Do you have vegetarian options?", arabic: "هل لديكم خيارات نباتية؟" }
          ]
        },
        {
          tier: 2,
          foreign: "Do you accept credit card payments?",
          roman: "(Payment Method)",
          english: "Do you accept credit card payments?",
          arabic: "هل تقبلون الدفع بالبطاقات الائتمانية؟",
          context: "Checking payment method at cash registers.",
          arabicExp: "سؤال الدفع ببطاقة الفيزا أو الماستركارد في المتاجر.",
          scrambleTokens: ["Do", "you", "accept", "credit", "card", "payments", "here?"],
          distractorTokens: ["cash", "coin", "receipt"],
          wrongs: [
            { text: "Do you have change for cash?", arabic: "هل لديك فكة نقدية؟" },
            { text: "Can you provide a receipt?", arabic: "هل يمكنك تزويدي بإيصال؟" },
            { text: "Is there an ATM in this building?", arabic: "هل يوجد صراف آلي في المبنى؟" }
          ]
        },

        // --- TIER 3: Advanced Health, Professional & High-Level ---
        {
          tier: 3,
          foreign: "I need to see a doctor immediately",
          roman: "(Urgent Healthcare)",
          english: "I need to see a doctor immediately",
          arabic: "أحتاج إلى مقابلة طبيب بشكل عاجل وفوري",
          context: "Urgent healthcare request when experiencing severe symptoms.",
          arabicExp: "طلب عاجل لرؤية الطبيب والحصول على فحص طبي فوري.",
          scrambleTokens: ["I", "need", "to", "see", "a", "doctor", "immediately!"],
          distractorTokens: ["pharmacy", "hotel", "pill"],
          wrongs: [
            { text: "Where can I buy some painkillers?", arabic: "أين يمكنني شراء مسكنات الألم؟" },
            { text: "I have a mild sore throat", arabic: "لدي التهاب خفيف في الحلق" },
            { text: "Can you recommend a hotel?", arabic: "هل يمكنك التوصية بفندق؟" }
          ]
        },
        {
          tier: 3,
          foreign: "System Awakening protocol engaged",
          roman: "(Apex Matrix)",
          english: "System Awakening protocol engaged",
          arabic: "تم تفعيل بروتوكول استيقاظ النظام والقدرات",
          context: "Hunter matrix awakening confirmation.",
          arabicExp: "إشعار تفعيل قدرات الصياد الخارقة وبدء تشغيل النظام.",
          scrambleTokens: ["The", "System", "Awakening", "protocol", "is", "now", "engaged!"],
          distractorTokens: ["shutting", "down", "failed"],
          wrongs: [
            { text: "System shutdown in progress", arabic: "إيقاف تشغيل النظام قيد التقدم" },
            { text: "Connection error detected", arabic: "تم اكتشاف خطأ في الاتصال" },
            { text: "Power supply depleted", arabic: "طاقة البطارية استُنفدت" }
          ]
        },
        {
          tier: 3,
          foreign: "We have achieved complete victory over our adversaries",
          roman: "(Triumph)",
          english: "We have achieved complete victory over our adversaries",
          arabic: "لقد حققنا انتصاراً ساحقاً وتاماً على خصومنا",
          context: "Major milestone celebratory declaration.",
          arabicExp: "إعلان الفوز الساحق والانتصار النهائي في المعركة.",
          scrambleTokens: ["We", "have", "achieved", "complete", "victory", "over", "our", "adversaries!"],
          distractorTokens: ["lost", "tied", "escaped"],
          wrongs: [
            { text: "We were forced to retreat", arabic: "أُجبرنا على الانسحاب" },
            { text: "The battle ended in a draw", arabic: "انتهت المعركة بالتعادل" },
            { text: "Our defenses have collapsed", arabic: "دفاعاتنا قد انهارت" }
          ]
        }
      ]
    };

    return DB[lang] || DB.japanese;
  }
}


// ----------------------------------------------------------------------------
// 5. PARTICLE ENGINE (CONFETTI & VICTORY FX)
// ----------------------------------------------------------------------------
class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animId = null;

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x, y, count = 60) {
    if (!AppState.state.animationsEnabled || !this.ctx) return;
    const colors = ['#00F0FF', '#1A73E8', '#FF007F', '#00FF66', '#FFD700', '#FFFFFF'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }

    if (!this.animId) this.loop();
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Gravity
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.loop());
    } else {
      this.animId = null;
    }
  }
}

let FX = null;


// ----------------------------------------------------------------------------
// 6. FLOATING AI MASCOT CONTROLLER (A.P.E.X. GUIDE)
// ----------------------------------------------------------------------------
class MascotController {
  constructor() {
    this.avatar = document.getElementById('mascot-robot-avatar');
    this.bubble = document.getElementById('mascot-speech-bubble');
    this.textEl = document.getElementById('mascot-speech-text');
    this.timeout = null;

    if (this.avatar) {
      this.avatar.addEventListener('click', () => {
        AudioEngine.playClick();
        this.sayRandomHint();
      });
    }
  }

  say(message, duration = 5000) {
    if (!this.bubble || !this.textEl) return;
    clearTimeout(this.timeout);

    this.textEl.innerText = message;
    this.bubble.classList.add('visible');

    this.timeout = setTimeout(() => {
      this.bubble.classList.remove('visible');
    }, duration);
  }

  sayRandomHint() {
    const hints = [
      "Consistent daily practice fuels your streak multiplier (🔥)! Keep it burning.",
      "Listen closely to the audio pronunciations to master genuine native accents.",
      "Solve tactical chess puzzles in the Chess tab to earn free Gems (+15 💎)!",
      "Upgrade to Apex Pro in the Cyber Store for unlimited hearts and double XP.",
      "You can switch languages anytime from the top bar flag selector."
    ];
    const pick = hints[Math.floor(Math.random() * hints.length)];
    this.say(pick, 6000);
  }
}

let Mascot = null;


// ----------------------------------------------------------------------------
// 7. DUOLINGO GAMIFIED THEMATIC STAGES & CURRICULUM PATH RENDERER
// ----------------------------------------------------------------------------
class CurriculumPathEngine {
  constructor() {
    this.stagesContainer = document.getElementById('stages-container');
    this.pathScrollArea = document.getElementById('path-scroll-area');
    this.svg = document.getElementById('path-svg');
    this.progressBar = document.getElementById('curriculum-progress-bar');
    this.statusText = document.getElementById('curriculum-status-text');
    this.sectorTag = document.getElementById('curriculum-sector-tag');
    this.pathTitle = document.getElementById('curriculum-path-title');
    this.pathSubtitle = document.getElementById('curriculum-path-subtitle');
  }

  render() {
    if (!this.stagesContainer) return;

    const lang = AppState.state.selectedLanguage;
    const config = LANGUAGE_CONFIG[lang] || LANGUAGE_CONFIG.japanese;
    const levels = LEVEL_METADATA[lang] || LEVEL_METADATA.japanese;

    // Update Banner Texts
    if (this.sectorTag) this.sectorTag.innerText = config.tag;
    if (this.pathTitle) this.pathTitle.innerText = config.sectorTitle;
    if (this.pathSubtitle) this.pathSubtitle.innerText = config.sectorSub;

    this.stagesContainer.innerHTML = '';
    if (this.svg) this.svg.innerHTML = '';

    const currentUnlocked = AppState.state.unlockedLevels[lang] || 1;
    const completedList = AppState.state.completedLevels[lang] || [];
    const total = levels.length;

    // Update Progress Bar
    const progressPct = Math.min(100, Math.round((completedList.length / total) * 100));
    if (this.progressBar) this.progressBar.style.width = `${progressPct}%`;
    if (this.statusText) {
      const rank = completedList.length >= 10 ? 'S-Rank Monarch' : (completedList.length >= 6 ? 'A-Rank Elite' : (completedList.length >= 3 ? 'B-Rank Vanguard' : 'E-Rank Novice'));
      this.statusText.innerText = `Rank: ${rank} • ${completedList.length}/10 Nodes Cleared`;
    }

    // Duolingo winding path horizontal offset shifts
    const xOffsets = [0, -45, 45, -35, 40, -45, 40, -35, 45, 0];

    // Render Thematic Stages Sections
    THEMATIC_STAGES.forEach(stage => {
      const stageSection = document.createElement('div');
      stageSection.className = 'stage-section';
      stageSection.setAttribute('data-stage-id', stage.stageId);

      // Stage Header Card
      const headerCard = document.createElement('div');
      headerCard.className = 'stage-header-card';
      headerCard.innerHTML = `
        <span class="stage-tag">${stage.tag}</span>
        <h3 class="stage-title">${stage.title}</h3>
        <div class="stage-arabic-sub">${stage.arabic}</div>
      `;
      stageSection.appendChild(headerCard);

      // Nodes Cluster inside Stage
      const cluster = document.createElement('div');
      cluster.className = 'stage-nodes-cluster';
      cluster.id = `stage-nodes-${stage.stageId}`;

      stage.levelIds.forEach(lvlId => {
        const level = levels.find(l => l.id === lvlId);
        if (!level) return;

        const isCompleted = completedList.includes(level.id);
        const isCurrent = level.id === currentUnlocked && !isCompleted;
        const isUnlocked = level.id <= currentUnlocked;

        const nodeEl = document.createElement('div');
        nodeEl.className = `path-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`;
        nodeEl.setAttribute('data-level-id', level.id);

        const xShift = xOffsets[(level.id - 1) % xOffsets.length];
        nodeEl.style.transform = `translateX(${xShift}px)`;

        const iconSymbol = isCompleted ? '⭐' : (isUnlocked ? level.icon : '🔒');

        nodeEl.innerHTML = `
          <button class="node-button" aria-label="Level ${level.id}: ${level.title}">
            <span class="node-icon">${iconSymbol}</span>
            <span class="node-number-badge">${level.id}</span>
          </button>
          <div class="node-title-tooltip">${level.title}</div>
        `;

        nodeEl.addEventListener('click', () => {
          this.handleNodeClick(level, isUnlocked);
        });

        cluster.appendChild(nodeEl);
      });

      stageSection.appendChild(cluster);
      this.stagesContainer.appendChild(stageSection);
    });

    // Draw connecting SVG curved lines between all 10 nodes
    setTimeout(() => this.drawConnectingLines(currentUnlocked), 80);
  }

  drawConnectingLines(currentUnlocked) {
    if (!this.svg || !this.stagesContainer) return;
    this.svg.innerHTML = '';

    const nodes = Array.from(this.stagesContainer.querySelectorAll('.path-node'));
    if (nodes.length < 2) return;

    const pathElem = document.getElementById('curriculum-path');
    if (!pathElem) return;
    const pathRect = pathElem.getBoundingClientRect();

    for (let i = 0; i < nodes.length - 1; i++) {
      const nodeA = nodes[i];
      const nodeB = nodes[i + 1];

      const rectA = nodeA.getBoundingClientRect();
      const rectB = nodeB.getBoundingClientRect();

      const x1 = rectA.left + rectA.width / 2 - pathRect.left;
      const y1 = rectA.top + rectA.height / 2 - pathRect.top;

      const x2 = rectB.left + rectB.width / 2 - pathRect.left;
      const y2 = rectB.top + rectB.height / 2 - pathRect.top;

      const deltaY = (y2 - y1) * 0.5;
      const d = `M ${x1} ${y1} C ${x1} ${y1 + deltaY}, ${x2} ${y2 - deltaY}, ${x2} ${y2}`;

      const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svgPath.setAttribute('d', d);
      svgPath.setAttribute('class', `path-connector-line ${i + 1 < currentUnlocked ? 'completed' : ''}`);
      this.svg.appendChild(svgPath);
    }
  }

  handleNodeClick(level, isUnlocked) {
    AudioEngine.playClick();
    if (!isUnlocked) {
      AudioEngine.playError();
      Mascot.say(`Node ${level.id} is sealed! Clear Level ${level.id - 1} first.`);
      return;
    }

    // Energy hearts check
    if (AppState.state.hearts <= 0 && !AppState.state.isApexPro) {
      AudioEngine.playError();
      QuizEngine.showOutOfHeartsOverlay();
      Mascot.say("Your energy hearts are depleted! Refill them to enter lessons.");
      return;
    }

    // Launch 20-Question Multi-Format Quiz Session
    QuizEngine.startSession(AppState.state.selectedLanguage, level.id);
  }
}

let CurriculumEngine = null;


// ----------------------------------------------------------------------------
// 8. ADVANCED DUOLINGO 20-QUESTION QUIZ ENGINE (MULTI-TYPE + ARABIC FEEDBACK)
// ----------------------------------------------------------------------------
class InteractiveQuizEngine {
  constructor() {
    // Modal Shell & Header Elements
    this.modal = document.getElementById('quiz-modal');
    this.progressFill = document.getElementById('quiz-progress-fill');
    this.qCounter = document.getElementById('quiz-question-counter');
    this.heartsVal = document.getElementById('quiz-hearts-val');
    this.btnBooster = document.getElementById('btn-quiz-booster-5050');
    this.boosterCount = document.getElementById('quiz-booster-count');
    this.closeBtn = document.getElementById('btn-close-quiz');

    // Title, Badge & Difficulty Indicator
    this.levelBadge = document.getElementById('quiz-level-badge');
    this.difficultyTag = document.getElementById('quiz-difficulty-tag');
    this.exerciseTypeTag = document.getElementById('quiz-exercise-type-tag');
    this.levelTitle = document.getElementById('quiz-level-title');
    this.instructionEl = document.getElementById('quiz-task-instruction');

    // Exercise View Containers
    this.viewMC = document.getElementById('view-multiple-choice');
    this.viewScramble = document.getElementById('view-word-scramble');
    this.viewAudio = document.getElementById('view-audio-match');

    // View 1: Multiple Choice Elements
    this.mcPromptText = document.getElementById('mc-prompt-text');
    this.mcRomanText = document.getElementById('mc-roman-text');
    this.mcContextClue = document.getElementById('mc-context-clue');
    this.mcOptionsGrid = document.getElementById('mc-options-grid');
    this.btnPronounceMC = document.getElementById('btn-pronounce-mc');

    // View 2: Word Scramble Elements
    this.scrambleTargetText = document.getElementById('scramble-target-text');
    this.scrambleTargetArabic = document.getElementById('scramble-target-arabic');
    this.btnPronounceScramble = document.getElementById('btn-pronounce-scramble');
    this.scrambleAnswerZone = document.getElementById('scramble-answer-zone');
    this.scramblePlaceholder = document.getElementById('scramble-placeholder');
    this.scrambleBankZone = document.getElementById('scramble-bank-zone');
    this.btnClearScramble = document.getElementById('btn-clear-scramble');
    this.btnCheckScramble = document.getElementById('btn-check-scramble');

    // View 3: Audio Matching Elements
    this.btnPlayAudioExercise = document.getElementById('btn-play-audio-exercise');
    this.btnSpeedNormal = document.getElementById('btn-speed-normal');
    this.btnSpeedSlow = document.getElementById('btn-speed-slow');
    this.audioOptionsGrid = document.getElementById('audio-options-grid');
    this.speechRate = 1.0;

    // Bottom Feedback Sheet
    this.bottomSheet = document.getElementById('quiz-bottom-sheet');
    this.feedbackIcon = document.getElementById('feedback-icon');
    this.feedbackTitle = document.getElementById('feedback-title');
    this.feedbackExplanation = document.getElementById('feedback-explanation');
    this.feedbackArabicExplanation = document.getElementById('feedback-arabic-explanation');
    this.continueBtn = document.getElementById('btn-quiz-continue');

    // Out of Hearts Dialog Overlay
    this.outOfHeartsOverlay = document.getElementById('out-of-hearts-overlay');
    this.btnRefillGem = document.getElementById('btn-refill-hearts-gem');
    this.btnGetApexPro = document.getElementById('btn-get-apex-pro-hearts');
    this.btnExitHearts = document.getElementById('btn-exit-hearts-quiz');

    // Victory Dialog Overlay
    this.victoryOverlay = document.getElementById('level-victory-overlay');
    this.victoryLevelName = document.getElementById('victory-level-name');
    this.victoryScoreVal = document.getElementById('victory-score-val');
    this.btnFinishVictory = document.getElementById('btn-finish-level-victory');

    // Session State
    this.currentLanguage = 'japanese';
    this.currentLevelId = 1;
    this.questions = [];
    this.currentIndex = 0;
    this.correctCount = 0;
    this.hasAnswered = false;
    this.assembledTokens = [];

    this.bindEvents();
  }

  bindEvents() {
    // Close Quiz
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        AudioEngine.playClick();
        this.close();
      });
    }

    // Voice Pronunciation in MC view (Dynamic Language Detection)
    if (this.btnPronounceMC) {
      this.btnPronounceMC.addEventListener('click', () => {
        const q = this.questions[this.currentIndex];
        if (q) {
          const tts = LANGUAGE_CONFIG[this.currentLanguage].ttsCode;
          AudioEngine.speak(q.prompt, tts, 1.0);
        }
      });
    }

    // Voice Pronunciation in Scramble view
    if (this.btnPronounceScramble) {
      this.btnPronounceScramble.addEventListener('click', () => {
        const q = this.questions[this.currentIndex];
        if (q) {
          const tts = LANGUAGE_CONFIG[this.currentLanguage].ttsCode;
          AudioEngine.speak(q.prompt, tts, 1.0);
        }
      });
    }

    // Audio Match Speed Buttons
    if (this.btnSpeedNormal) {
      this.btnSpeedNormal.addEventListener('click', () => {
        AudioEngine.playClick();
        this.speechRate = 1.0;
        this.btnSpeedNormal.classList.add('active');
        if (this.btnSpeedSlow) this.btnSpeedSlow.classList.remove('active');
      });
    }

    if (this.btnSpeedSlow) {
      this.btnSpeedSlow.addEventListener('click', () => {
        AudioEngine.playClick();
        this.speechRate = 0.7;
        this.btnSpeedSlow.classList.add('active');
        if (this.btnSpeedNormal) this.btnSpeedNormal.classList.remove('active');
      });
    }

    // Audio Match Big Wave Button (Dynamic SpeechSynthesis)
    if (this.btnPlayAudioExercise) {
      this.btnPlayAudioExercise.addEventListener('click', () => {
        const q = this.questions[this.currentIndex];
        if (q) {
          const tts = LANGUAGE_CONFIG[this.currentLanguage].ttsCode;
          AudioEngine.speak(q.prompt, tts, this.speechRate);
          this.btnPlayAudioExercise.classList.add('playing');
          setTimeout(() => this.btnPlayAudioExercise.classList.remove('playing'), 800);
        }
      });
    }

    // Scramble: Reset / Clear Words
    if (this.btnClearScramble) {
      this.btnClearScramble.addEventListener('click', () => {
        AudioEngine.playClick();
        this.resetScrambleTokens();
      });
    }

    // Scramble: Check Sequence
    if (this.btnCheckScramble) {
      this.btnCheckScramble.addEventListener('click', () => {
        this.handleScrambleVerification();
      });
    }

    // 50/50 Booster
    if (this.btnBooster) {
      this.btnBooster.addEventListener('click', () => {
        this.use5050Booster();
      });
    }

    // Continue to next question
    if (this.continueBtn) {
      this.continueBtn.addEventListener('click', () => {
        AudioEngine.playClick();
        this.nextQuestion();
      });
    }

    // Out of Hearts Actions
    if (this.btnRefillGem) {
      this.btnRefillGem.addEventListener('click', () => {
        if (AppState.state.coins >= 30) {
          AppState.update(s => {
            s.coins -= 30;
            s.hearts = 5;
            s.lastHeartDepletedTime = null;
          });
          AudioEngine.playCoin();
          this.outOfHeartsOverlay.classList.add('hidden');
          this.updateHeartsUI();
          Mascot.say("Hearts energy fully restored (+5 ❤️)! Resuming challenge.");
        } else {
          AudioEngine.playError();
          Mascot.say("Insufficient gems! Solve tactical chess puzzles to earn gems.");
        }
      });
    }

    if (this.btnGetApexPro) {
      this.btnGetApexPro.addEventListener('click', () => {
        AppState.update(s => {
          s.isApexPro = true;
          s.hearts = 9999;
          s.lastHeartDepletedTime = null;
        });
        AudioEngine.playLevelUp();
        this.outOfHeartsOverlay.classList.add('hidden');
        this.updateHeartsUI();
        Mascot.say("👑 APEX PRO ACTIVATED! Unlimited energy hearts unlocked!");
      });
    }

    if (this.btnExitHearts) {
      this.btnExitHearts.addEventListener('click', () => {
        AudioEngine.playClick();
        this.outOfHeartsOverlay.classList.add('hidden');
        this.close();
      });
    }

    // Victory Claim & Advance
    if (this.btnFinishVictory) {
      this.btnFinishVictory.addEventListener('click', () => {
        AudioEngine.playClick();
        this.victoryOverlay.classList.add('hidden');
        this.close();
        CurriculumEngine.render();
      });
    }
  }

  startSession(language, levelId) {
    this.currentLanguage = language;
    this.currentLevelId = levelId;
    this.currentIndex = 0;
    this.correctCount = 0;
    this.hasAnswered = false;

    // Load 20 multi-type, randomized questions
    this.questions = LevelQuestionEngine.get20Questions(language, levelId);

    const levels = LEVEL_METADATA[language] || LEVEL_METADATA.japanese;
    const levelInfo = levels.find(l => l.id === levelId) || levels[0];

    if (this.levelTitle) this.levelTitle.innerText = `Level ${levelId}: ${levelInfo.title}`;

    this.updateHeartsUI();
    this.loadQuestion(0);

    if (this.modal) this.modal.classList.remove('hidden');
    Mascot.say(`Level ${levelId} activated: 20 randomized questions queued!`);
  }

  loadQuestion(index) {
    this.currentIndex = index;
    this.hasAnswered = false;
    this.assembledTokens = [];

    const q = this.questions[index];
    if (!q) return;

    // Progress updates (1/20 to 20/20)
    const progressPct = ((index + 1) / 20) * 100;
    if (this.progressFill) this.progressFill.style.width = `${progressPct}%`;
    if (this.qCounter) this.qCounter.innerText = `${index + 1}/20`;
    if (this.levelBadge) this.levelBadge.innerText = `LEVEL 0${this.currentLevelId} • QUESTION ${index + 1 < 10 ? '0' : ''}${index + 1}/20`;
    
    // Update Dynamic Difficulty Indicator
    if (this.difficultyTag) {
      this.difficultyTag.innerText = q.tierLabel || 'TIER 1 • WARM-UP';
      this.difficultyTag.className = `quiz-difficulty-badge ${q.tierClass || 'difficulty-easy'}`;
    }

    if (this.exerciseTypeTag) this.exerciseTypeTag.innerText = q.typeLabel || 'EXERCISE';
    if (this.instructionEl) this.instructionEl.innerText = q.instruction;
    if (this.boosterCount) this.boosterCount.innerText = AppState.state.booster5050;

    // Hide feedback sheet
    if (this.bottomSheet) {
      this.bottomSheet.classList.add('hidden');
      this.bottomSheet.classList.remove('wrong-sheet');
    }

    // Toggle exercise view
    if (q.type === 'multiple-choice') {
      this.setupMultipleChoiceView(q);
    } else if (q.type === 'word-scramble') {
      this.setupWordScrambleView(q);
    } else if (q.type === 'audio-match') {
      this.setupAudioMatchView(q);
    }
  }

  // --- FORMAT 1: MULTIPLE CHOICE ---
  setupMultipleChoiceView(q) {
    if (this.viewMC) this.viewMC.classList.remove('hidden');
    if (this.viewScramble) this.viewScramble.classList.add('hidden');
    if (this.viewAudio) this.viewAudio.classList.add('hidden');

    if (this.mcPromptText) this.mcPromptText.innerText = q.prompt;
    if (this.mcRomanText) this.mcRomanText.innerText = q.roman;
    if (this.mcContextClue) this.mcContextClue.innerText = `Context: ${q.context}`;

    if (!this.mcOptionsGrid) return;
    this.mcOptionsGrid.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerHTML = `
        <span class="opt-badge">${letters[idx]}</span>
        <div class="opt-content">
          <span class="opt-text">${opt.text}</span>
          <span class="opt-arabic-subtext">${opt.arabic || ''}</span>
        </div>
      `;

      btn.addEventListener('click', () => {
        this.handleMCOptionSelection(opt, btn, q);
      });

      this.mcOptionsGrid.appendChild(btn);
    });

    // Auto-pronounce foreign prompt using dynamic voice detection
    setTimeout(() => {
      const tts = LANGUAGE_CONFIG[this.currentLanguage].ttsCode;
      AudioEngine.speak(q.prompt, tts, 1.0);
    }, 250);
  }

  handleMCOptionSelection(option, buttonEl, q) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    if (option.correct) {
      this.correctCount++;
      buttonEl.classList.add('correct');
      AudioEngine.playCoin();
      this.showFeedbackSheet(true, q);
      Mascot.say("Direct strike! Translation verified.");
    } else {
      buttonEl.classList.add('wrong');
      AudioEngine.playHeartLost();

      // Highlight correct option
      const allBtns = this.mcOptionsGrid.querySelectorAll('.quiz-opt-btn');
      allBtns.forEach((b, idx) => {
        if (q.options[idx].correct) b.classList.add('correct');
      });

      this.deductHeart();
      this.showFeedbackSheet(false, q);
    }
  }

  // --- FORMAT 2: WORD SCRAMBLE ---
  setupWordScrambleView(q) {
    if (this.viewMC) this.viewMC.classList.add('hidden');
    if (this.viewScramble) this.viewScramble.classList.remove('hidden');
    if (this.viewAudio) this.viewAudio.classList.add('hidden');

    if (this.scrambleTargetText) this.scrambleTargetText.innerText = q.prompt;
    if (this.scrambleTargetArabic) this.scrambleTargetArabic.innerText = `(الترجمة: ${q.arabic})`;

    this.resetScrambleTokens();
  }

  resetScrambleTokens() {
    this.assembledTokens = [];
    if (!this.scrambleBankZone || !this.scrambleAnswerZone) return;

    this.scrambleAnswerZone.innerHTML = '';
    if (this.scramblePlaceholder) {
      this.scramblePlaceholder.style.display = 'block';
      this.scrambleAnswerZone.appendChild(this.scramblePlaceholder);
    }

    this.scrambleBankZone.innerHTML = '';

    const q = this.questions[this.currentIndex];
    if (!q || !q.bankTokens) return;

    q.bankTokens.forEach((word, idx) => {
      const chip = document.createElement('button');
      chip.className = 'word-chip';
      chip.innerText = word;
      chip.setAttribute('data-word', word);
      chip.setAttribute('data-index', idx);

      chip.addEventListener('click', () => {
        this.handleBankChipClick(chip, word);
      });

      this.scrambleBankZone.appendChild(chip);
    });
  }

  handleBankChipClick(bankChip, word) {
    if (this.hasAnswered || bankChip.classList.contains('used')) return;
    AudioEngine.playChipTap();

    // Mark bank chip as used
    bankChip.classList.add('used');

    // Hide placeholder
    if (this.scramblePlaceholder) this.scramblePlaceholder.style.display = 'none';

    // Create assembled chip in answer zone
    const answerChip = document.createElement('button');
    answerChip.className = 'word-chip in-slot';
    answerChip.innerText = word;
    answerChip.title = "Tap to return word to bank";

    answerChip.addEventListener('click', () => {
      if (this.hasAnswered) return;
      AudioEngine.playChipTap();

      // Remove from assembled list
      const slotIndex = Array.from(this.scrambleAnswerZone.children).indexOf(answerChip);
      if (slotIndex > -1) {
        this.assembledTokens.splice(slotIndex, 1);
      }

      answerChip.remove();
      bankChip.classList.remove('used');

      if (this.assembledTokens.length === 0 && this.scramblePlaceholder) {
        this.scramblePlaceholder.style.display = 'block';
      }
    });

    this.scrambleAnswerZone.appendChild(answerChip);
    this.assembledTokens.push(word);
  }

  handleScrambleVerification() {
    if (this.hasAnswered) return;
    const q = this.questions[this.currentIndex];
    if (!q) return;

    if (this.assembledTokens.length === 0) {
      AudioEngine.playError();
      Mascot.say("Tap word chips to assemble your translation first!");
      return;
    }

    this.hasAnswered = true;

    const assembledStr = this.assembledTokens.join(' ').trim().toLowerCase();
    const targetStr = q.targetTokens.join(' ').trim().toLowerCase();

    if (assembledStr === targetStr) {
      this.correctCount++;
      AudioEngine.playCoin();
      this.showFeedbackSheet(true, q);
      Mascot.say("Flawless syntax sequence, Hunter!");
    } else {
      AudioEngine.playHeartLost();
      this.deductHeart();
      this.showFeedbackSheet(false, q);
    }
  }

  // --- FORMAT 3: AUDIO MATCHING ---
  setupAudioMatchView(q) {
    if (this.viewMC) this.viewMC.classList.add('hidden');
    if (this.viewScramble) this.viewScramble.classList.add('hidden');
    if (this.viewAudio) this.viewAudio.classList.remove('hidden');

    if (!this.audioOptionsGrid) return;
    this.audioOptionsGrid.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerHTML = `
        <span class="opt-badge">${letters[idx]}</span>
        <div class="opt-content">
          <span class="opt-text">${opt.text}</span>
          <span class="opt-arabic-subtext">${opt.arabic || ''}</span>
        </div>
      `;

      btn.addEventListener('click', () => {
        this.handleAudioOptionSelection(opt, btn, q);
      });

      this.audioOptionsGrid.appendChild(btn);
    });

    // Auto-play audio using dynamic SpeechSynthesis matching target study language
    setTimeout(() => {
      const tts = LANGUAGE_CONFIG[this.currentLanguage].ttsCode;
      AudioEngine.speak(q.prompt, tts, this.speechRate);
      if (this.btnPlayAudioExercise) {
        this.btnPlayAudioExercise.classList.add('playing');
        setTimeout(() => this.btnPlayAudioExercise.classList.remove('playing'), 800);
      }
    }, 350);
  }

  handleAudioOptionSelection(option, buttonEl, q) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    if (option.correct) {
      this.correctCount++;
      buttonEl.classList.add('correct');
      AudioEngine.playCoin();
      this.showFeedbackSheet(true, q);
      Mascot.say("Acoustic frequency matched! Excellent ear.");
    } else {
      buttonEl.classList.add('wrong');
      AudioEngine.playHeartLost();

      // Highlight correct option
      const allBtns = this.audioOptionsGrid.querySelectorAll('.quiz-opt-btn');
      allBtns.forEach((b, idx) => {
        if (q.options[idx].correct) b.classList.add('correct');
      });

      this.deductHeart();
      this.showFeedbackSheet(false, q);
    }
  }

  // --- COMMON FEEDBACK & HEARTS MECHANICS ---
  showFeedbackSheet(isCorrect, q) {
    if (!this.bottomSheet) return;
    this.bottomSheet.classList.remove('hidden');

    if (isCorrect) {
      this.bottomSheet.classList.remove('wrong-sheet');
      if (this.feedbackIcon) this.feedbackIcon.innerText = '🎉';
      if (this.feedbackTitle) this.feedbackTitle.innerText = 'CORRECT STRIKE!';
      if (this.feedbackExplanation) this.feedbackExplanation.innerText = q.explanation;
      if (this.feedbackArabicExplanation) this.feedbackArabicExplanation.innerText = q.arabicExplanation;
    } else {
      this.bottomSheet.classList.add('wrong-sheet');
      if (this.feedbackIcon) this.feedbackIcon.innerText = '💔';
      if (this.feedbackTitle) {
        this.feedbackTitle.innerText = AppState.state.isApexPro ? "MISALIGNMENT (PRO SHIELD ACTIVE)" : "ERROR: -1 ENERGY HEART!";
      }
      if (this.feedbackExplanation) this.feedbackExplanation.innerText = q.explanation;
      if (this.feedbackArabicExplanation) this.feedbackArabicExplanation.innerText = q.arabicExplanation;
    }

    if (this.continueBtn) {
      this.continueBtn.innerText = this.currentIndex === 19 ? "COMPLETE LEVEL (20/20) ➔" : `NEXT QUESTION (${this.currentIndex + 2}/20) ➔`;
    }
  }

  deductHeart() {
    if (!AppState.state.isApexPro) {
      AppState.update(s => {
        s.hearts = Math.max(0, s.hearts - 1);
        if (s.hearts < 5 && !s.lastHeartDepletedTime) {
          s.lastHeartDepletedTime = Date.now();
        }
      });
    }
    this.updateHeartsUI();

    if (AppState.state.hearts <= 0 && !AppState.state.isApexPro) {
      setTimeout(() => {
        this.showOutOfHeartsOverlay();
      }, 700);
    }
  }

  updateHeartsUI() {
    const displayVal = AppState.state.isApexPro ? '∞' : AppState.state.hearts;
    if (this.heartsVal) this.heartsVal.innerText = displayVal;
    const topHeart = document.getElementById('heart-counter');
    if (topHeart) topHeart.innerText = displayVal;
  }

  showOutOfHeartsOverlay() {
    if (this.outOfHeartsOverlay) {
      this.outOfHeartsOverlay.classList.remove('hidden');
      AudioEngine.playError();
    }
  }

  use5050Booster() {
    if (this.hasAnswered) return;
    if (AppState.state.booster5050 <= 0) {
      AudioEngine.playError();
      Mascot.say("No 50/50 Neural Hacks left! Purchase more in the Cyber Store.");
      return;
    }

    const q = this.questions[this.currentIndex];
    if (!q || (q.type !== 'multiple-choice' && q.type !== 'audio-match')) {
      Mascot.say("50/50 Neural Hack only applies to Multiple Choice and Audio exercises.");
      return;
    }

    const grid = q.type === 'multiple-choice' ? this.mcOptionsGrid : this.audioOptionsGrid;
    if (!grid) return;

    const buttons = Array.from(grid.querySelectorAll('.quiz-opt-btn'));
    let eliminated = 0;

    buttons.forEach((btn, idx) => {
      if (!q.options[idx].correct && eliminated < 2 && !btn.classList.contains('used')) {
        btn.style.opacity = '0.2';
        btn.style.pointerEvents = 'none';
        btn.classList.add('used');
        eliminated++;
      }
    });

    if (eliminated > 0) {
      AppState.update(s => s.booster5050 = Math.max(0, s.booster5050 - 1));
      if (this.boosterCount) this.boosterCount.innerText = AppState.state.booster5050;
      AudioEngine.playTone(880, 'triangle', 0.2, 0.15);
      Mascot.say("50/50 Neural Hack engaged: 2 decoys disabled!");
    }
  }

  nextQuestion() {
    if (this.currentIndex < 19) {
      this.loadQuestion(this.currentIndex + 1);
    } else {
      this.finishSession();
    }
  }

  finishSession() {
    AudioEngine.playVictory();
    FX.burst(window.innerWidth / 2, window.innerHeight / 2, 80);

    const xpGained = AppState.state.isApexPro ? 100 : 50;

    // Update streak and record persistent progress
    AppState.recordLessonCompletion();

    AppState.update(state => {
      state.coins += 20;
      state.userXP += xpGained;

      const lang = this.currentLanguage;
      if (!state.completedLevels[lang].includes(this.currentLevelId)) {
        state.completedLevels[lang].push(this.currentLevelId);
      }
      if (state.unlockedLevels[lang] === this.currentLevelId && this.currentLevelId < 10) {
        state.unlockedLevels[lang] += 1;
      }
    });

    if (this.victoryOverlay) {
      this.victoryOverlay.classList.remove('hidden');
      if (this.victoryScoreVal) this.victoryScoreVal.innerText = `${this.correctCount} / 20 Correct`;
      const levels = LEVEL_METADATA[this.currentLanguage] || LEVEL_METADATA.japanese;
      const lvl = levels.find(l => l.id === this.currentLevelId);
      if (this.victoryLevelName && lvl) {
        this.victoryLevelName.innerText = `Level ${this.currentLevelId}: ${lvl.title}`;
      }
    }

    Mascot.say(`VICTORY! Level ${this.currentLevelId} Cleared (+20 💎, +${xpGained} XP, 🔥 Streak active)!`);
  }

  close() {
    if (this.modal) this.modal.classList.add('hidden');
    if (this.bottomSheet) this.bottomSheet.classList.add('hidden');
    if (this.outOfHeartsOverlay) this.outOfHeartsOverlay.classList.add('hidden');
    if (this.victoryOverlay) this.victoryOverlay.classList.add('hidden');
  }
}

let QuizEngine = null;


// ----------------------------------------------------------------------------
// 9. TACTICAL CHESS PUZZLE ENGINE (TACTICAL MINIGAME TAB)
// ----------------------------------------------------------------------------
const CHESS_PUZZLES = [
  {
    id: 1,
    badge: "PUZZLE #1 • MATE IN 1",
    turn: "⚪ White to Move",
    goal: "Deliver back-rank checkmate against the Black Cyber King!",
    fen: "6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
    legalFrom: [7, 3], // d1
    targetTo: [0, 3],   // d8#
    hint: "Move the White Rook on d1 straight up to d8 for the decisive back-rank mate."
  },
  {
    id: 2,
    badge: "PUZZLE #2 • FORK STRIKE",
    turn: "⚪ White to Move",
    goal: "Fork the Black King and Queen with your Cyber Knight!",
    fen: "4k3/8/8/3q4/8/5N2/8/4K3 w - - 0 1",
    legalFrom: [5, 5], // f3
    targetTo: [3, 4],   // e5
    hint: "Leap your Knight to e5, attacking King and Queen simultaneously."
  }
];

class TacticalChessEngine {
  constructor() {
    this.grid = document.getElementById('chessboard-grid');
    this.badge = document.getElementById('puzzle-badge');
    this.turn = document.getElementById('puzzle-turn-indicator');
    this.goal = document.getElementById('puzzle-goal-text');
    this.statusBox = document.getElementById('tactical-status-box');

    this.btnReset = document.getElementById('btn-chess-reset');
    this.btnHint = document.getElementById('btn-chess-hint');
    this.btnNext = document.getElementById('btn-chess-next');

    this.currentIndex = 0;
    this.selectedSquare = null;
    this.bindEvents();
  }

  bindEvents() {
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        AudioEngine.playClick();
        this.loadPuzzle(this.currentIndex);
      });
    }

    if (this.btnHint) {
      this.btnHint.addEventListener('click', () => {
        AudioEngine.playTone(700, 'triangle', 0.2);
        const p = CHESS_PUZZLES[this.currentIndex];
        if (this.statusBox && p) {
          this.statusBox.innerText = `💡 TACTICAL HINT: ${p.hint}`;
        }
      });
    }

    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => {
        AudioEngine.playClick();
        this.currentIndex = (this.currentIndex + 1) % CHESS_PUZZLES.length;
        this.loadPuzzle(this.currentIndex);
      });
    }
  }

  loadPuzzle(index) {
    this.currentIndex = index;
    const p = CHESS_PUZZLES[index];
    if (!p) return;

    if (this.badge) this.badge.innerText = p.badge;
    if (this.turn) this.turn.innerText = p.turn;
    if (this.goal) this.goal.innerText = p.goal;
    if (this.statusBox) this.statusBox.innerText = "Select a highlighted piece to view legal tactical strikes.";

    this.renderBoard(p);
  }

  renderBoard(puzzle) {
    if (!this.grid) return;
    this.grid.innerHTML = '';
    this.selectedSquare = null;

    const board = this.parseFEN(puzzle.fen);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        const isLight = (r + c) % 2 === 0;
        sq.className = `chess-sq ${isLight ? 'light' : 'dark'}`;
        sq.dataset.row = r;
        sq.dataset.col = c;

        const piece = board[r][c];
        if (piece) {
          sq.innerText = this.pieceToSymbol(piece);
          sq.dataset.piece = piece;
        }

        // Highlight legal piece
        if (r === puzzle.legalFrom[0] && c === puzzle.legalFrom[1]) {
          sq.classList.add('tactical-highlight');
        }

        sq.addEventListener('click', () => this.handleSquareClick(r, c, puzzle));
        this.grid.appendChild(sq);
      }
    }
  }

  handleSquareClick(r, c, puzzle) {
    const sqEl = this.grid.querySelector(`[data-row="${r}"][data-col="${c}"]`);

    if (!this.selectedSquare) {
      if (r === puzzle.legalFrom[0] && c === puzzle.legalFrom[1]) {
        AudioEngine.playClick();
        this.selectedSquare = { r, c };
        sqEl.classList.add('selected');

        const targetEl = this.grid.querySelector(`[data-row="${puzzle.targetTo[0]}"][data-col="${puzzle.targetTo[1]}"]`);
        if (targetEl) targetEl.classList.add('target-hint');

        if (this.statusBox) this.statusBox.innerText = "Piece primed! Tap target destination to deliver checkmate strike.";
      }
    } else {
      if (r === puzzle.targetTo[0] && c === puzzle.targetTo[1]) {
        // Solved!
        AudioEngine.playVictory();
        FX.burst(window.innerWidth / 2, window.innerHeight / 2, 50);

        AppState.update(s => {
          s.coins += 15;
          s.userXP += 30;
        });

        if (this.statusBox) {
          this.statusBox.innerText = "⚡ CHECKMATE CONFIRMED! Tactical Puzzle Cleared (+15 💎, +30 XP)!";
        }
        Mascot.say("Grandmaster tactical precision! +15 Gems credited to your balance.");
      } else {
        AudioEngine.playError();
        if (this.statusBox) this.statusBox.innerText = "Miscalculated tactical vector. Try again!";
      }

      this.selectedSquare = null;
      this.renderBoard(puzzle);
    }
  }

  parseFEN(fen) {
    const rows = fen.split(' ')[0].split('/');
    const board = [];
    for (let r = 0; r < 8; r++) {
      const row = [];
      for (const ch of rows[r]) {
        if (!isNaN(ch)) {
          for (let i = 0; i < parseInt(ch); i++) row.push('');
        } else {
          row.push(ch);
        }
      }
      board.push(row);
    }
    return board;
  }

  pieceToSymbol(piece) {
    const map = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    return map[piece] || '';
  }
}

let ChessEngine = null;


// ----------------------------------------------------------------------------
// 10. TOURNAMENT HUNTER LEAGUES ENGINE
// ----------------------------------------------------------------------------
class TournamentEngine {
  constructor() {
    this.timerEl = document.getElementById('timer-countdown');
    this.startCountdown();
  }

  render() {
    const userRow = document.querySelector('.standing-row.user-row');
    if (userRow) {
      const nameEl = userRow.querySelector('.hunter-name');
      const scoreEl = userRow.querySelector('.hunter-xp');
      if (nameEl) nameEl.innerText = `${AppState.state.profile.name} (You)`;
      if (scoreEl) scoreEl.innerText = `${AppState.state.userXP} XP`;
    }
  }

  startCountdown() {
    let secondsLeft = 18 * 3600 + 42 * 60 + 15;
    setInterval(() => {
      secondsLeft = Math.max(0, secondsLeft - 1);
      const h = Math.floor(secondsLeft / 3600);
      const m = Math.floor((secondsLeft % 3600) / 60);
      const s = secondsLeft % 60;
      if (this.timerEl) {
        this.timerEl.innerText = `${h}h ${m < 10 ? '0' : ''}${m}m ${s < 10 ? '0' : ''}${s}s`;
      }
    }, 1000);
  }
}

let TournamentManager = null;


// ----------------------------------------------------------------------------
// 11. TARGET LANGUAGE SELECTION CONTROLLER
// ----------------------------------------------------------------------------
class LanguageSelectionController {
  constructor() {
    this.modal = document.getElementById('language-modal');
    this.btnOpen = document.getElementById('btn-language-select');
    this.btnClose = document.getElementById('btn-close-language');
    this.cards = document.querySelectorAll('.lang-selection-card');

    this.topFlag = document.getElementById('top-lang-flag');
    this.topCode = document.getElementById('top-lang-code');

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnOpen) {
      this.btnOpen.addEventListener('click', () => {
        AudioEngine.playClick();
        this.open();
      });
    }

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => {
        AudioEngine.playClick();
        this.close();
      });
    }

    this.cards.forEach(card => {
      card.addEventListener('click', () => {
        const langKey = card.getAttribute('data-lang');
        if (langKey && LANGUAGE_CONFIG[langKey]) {
          this.selectLanguage(langKey);
        }
      });
    });
  }

  open() {
    if (this.modal) this.modal.classList.remove('hidden');
    this.updateCardActiveStates();
  }

  close() {
    if (this.modal) this.modal.classList.add('hidden');
  }

  selectLanguage(langKey) {
    AudioEngine.playLevelUp();
    AppState.update(state => {
      state.selectedLanguage = langKey;
    });

    this.updateUI();
    this.close();
    CurriculumEngine.render();

    const config = LANGUAGE_CONFIG[langKey];
    Mascot.say(`Language protocol switched to ${config.name} (${config.arabicName})!`);
  }

  updateCardActiveStates() {
    const current = AppState.state.selectedLanguage;
    this.cards.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-lang') === current);
    });
  }

  updateUI() {
    const lang = AppState.state.selectedLanguage;
    const config = LANGUAGE_CONFIG[lang] || LANGUAGE_CONFIG.japanese;

    if (this.topFlag) this.topFlag.innerText = config.flag;
    if (this.topCode) this.topCode.innerText = config.code;

    this.updateCardActiveStates();
  }
}

let LanguageManager = null;


// ----------------------------------------------------------------------------
// 12. CYBER STORE & APEX PRO MONARCH PASS ENGINE
// ----------------------------------------------------------------------------
class StoreEngine {
  constructor() {
    this.modal = document.getElementById('store-modal');
    this.btnOpen = document.getElementById('btn-open-store');
    this.btnClose = document.getElementById('btn-close-store');
    this.gemPill = document.getElementById('btn-gem-counter');

    this.btnBuyApexPro = document.getElementById('btn-buy-apex-pro');
    this.subStatusLabel = document.getElementById('sub-active-status');
    this.btnBuyRefill = document.getElementById('btn-buy-heart-refill');

    this.themeCards = document.querySelectorAll('.theme-items-grid .store-item-card');
    this.powerupBtns = document.querySelectorAll('.powerup-buy-btn[data-powerup]');

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnOpen) {
      this.btnOpen.addEventListener('click', () => {
        AudioEngine.playClick();
        this.open();
      });
    }

    if (this.gemPill) {
      this.gemPill.addEventListener('click', () => {
        AudioEngine.playClick();
        this.open();
      });
    }

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => {
        AudioEngine.playClick();
        this.close();
      });
    }

    // Apex Pro Upgrade (150 gems)
    if (this.btnBuyApexPro) {
      this.btnBuyApexPro.addEventListener('click', () => {
        if (AppState.state.isApexPro) {
          Mascot.say("Monarch Pass is already active with unlimited hearts!");
          return;
        }

        if (AppState.state.coins >= 150) {
          AppState.update(s => {
            s.coins -= 150;
            s.isApexPro = true;
            s.hearts = 9999;
            s.lastHeartDepletedTime = null;
          });
          AudioEngine.playVictory();
          FX.burst(window.innerWidth / 2, window.innerHeight / 2, 70);
          this.updateStoreUI();
          Mascot.say("👑 APEX PRO ACTIVATED! Unlimited hearts and 2x XP multipliers are now live!");
        } else {
          AudioEngine.playError();
          Mascot.say("Need 150 Gems for Apex Pro. Solve chess puzzles to earn more!");
        }
      });
    }

    // Heart Refill (+5 Hearts for 30 gems)
    if (this.btnBuyRefill) {
      this.btnBuyRefill.addEventListener('click', () => {
        if (AppState.state.isApexPro) {
          Mascot.say("You have unlimited hearts with Apex Pro!");
          return;
        }
        if (AppState.state.hearts >= 5) {
          Mascot.say("Your energy hearts are already at full capacity (5/5 ❤️)!");
          return;
        }
        if (AppState.state.coins >= 30) {
          AppState.update(s => {
            s.coins -= 30;
            s.hearts = 5;
            s.lastHeartDepletedTime = null;
          });
          AudioEngine.playCoin();
          this.updateStoreUI();
          Mascot.say("Hearts energy fully restored (+5 ❤️)!");
        } else {
          AudioEngine.playError();
          Mascot.say("Need 30 Gems for heart refill.");
        }
      });
    }

    // Theme purchases (50 gems)
    this.themeCards.forEach(card => {
      const themeId = card.getAttribute('data-theme-id');
      const buyBtn = card.querySelector('.item-buy-btn');

      if (buyBtn) {
        buyBtn.addEventListener('click', () => {
          this.handleThemePurchase(themeId, buyBtn);
        });
      }
    });

    // Powerup Purchases
    this.powerupBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-powerup');
        const cost = parseInt(btn.getAttribute('data-cost') || '50');
        this.handlePowerupPurchase(type, cost);
      });
    });
  }

  open() {
    if (this.modal) this.modal.classList.remove('hidden');
    this.updateStoreUI();
  }

  close() {
    if (this.modal) this.modal.classList.add('hidden');
  }

  handleThemePurchase(themeId, buyBtn) {
    const isUnlocked = AppState.state.unlockedThemes.includes(themeId);
    if (isUnlocked) {
      AudioEngine.playClick();
      AppState.update(s => s.activeTheme = themeId);
      document.body.setAttribute('data-theme', themeId);
      this.updateStoreUI();
      Mascot.say(`Visual Matrix updated to: ${themeId}!`);
      return;
    }

    if (AppState.state.coins >= 50) {
      AppState.update(s => {
        s.coins -= 50;
        s.unlockedThemes.push(themeId);
        s.activeTheme = themeId;
      });
      document.body.setAttribute('data-theme', themeId);
      AudioEngine.playLevelUp();
      FX.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
      this.updateStoreUI();
      Mascot.say(`Theme unlocked & equipped: ${themeId}!`);
    } else {
      AudioEngine.playError();
      Mascot.say("Need 50 Gems to unlock this visual theme!");
    }
  }

  handlePowerupPurchase(type, cost) {
    if (AppState.state.coins >= cost) {
      AppState.update(s => {
        s.coins -= cost;
        if (type === 'xp-boost') s.userXP += 100;
        if (type === 'hint-boost') s.booster5050 += 1;
      });
      AudioEngine.playCoin();
      this.updateStoreUI();
      Mascot.say(`Powerup acquired! Balance updated.`);
    } else {
      AudioEngine.playError();
      Mascot.say(`Need ${cost} Gems for this tactical booster.`);
    }
  }

  updateStoreUI() {
    const storeCoin = document.getElementById('store-coin-counter');
    if (storeCoin) storeCoin.innerText = AppState.state.coins;

    if (this.subStatusLabel) {
      this.subStatusLabel.innerText = AppState.state.isApexPro ? "ACTIVE (UNLIMITED)" : "AVAILABLE";
    }

    this.themeCards.forEach(card => {
      const themeId = card.getAttribute('data-theme-id');
      const buyBtn = card.querySelector('.item-buy-btn');
      if (!buyBtn) return;

      const isUnlocked = AppState.state.unlockedThemes.includes(themeId);
      const isEquipped = AppState.state.activeTheme === themeId;

      if (isEquipped) {
        buyBtn.innerText = "EQUIPPED";
        buyBtn.className = "item-buy-btn equipped";
      } else if (isUnlocked) {
        buyBtn.innerText = "EQUIP";
        buyBtn.className = "item-buy-btn";
      } else {
        buyBtn.innerText = "50 💎";
        buyBtn.className = "item-buy-btn";
      }
    });
  }
}

let Store = null;


// ----------------------------------------------------------------------------
// 13. THEME SWITCH CONTROLLER (GOOGLE MATERIAL LIGHT VS. CYBER DARK)
// ----------------------------------------------------------------------------
class ThemeSwitchController {
  constructor() {
    this.btnToggle = document.getElementById('btn-toggle-theme');
    this.iconEl = document.getElementById('theme-toggle-icon');

    // Profile Hub theme buttons
    this.btnMaterial = document.getElementById('theme-btn-material');
    this.btnCyber = document.getElementById('theme-btn-cyber');

    // Settings Modal theme buttons
    this.settingsBtnMaterial = document.getElementById('settings-theme-btn-material');
    this.settingsBtnCyber = document.getElementById('settings-theme-btn-cyber');

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', () => {
        AudioEngine.playClick();
        const current = document.body.getAttribute('data-theme') || 'cyber-default';
        const target = current === 'material-light' ? 'cyber-default' : 'material-light';
        this.setTheme(target);
      });
    }

    if (this.btnMaterial) {
      this.btnMaterial.addEventListener('click', () => {
        AudioEngine.playClick();
        this.setTheme('material-light');
      });
    }

    if (this.btnCyber) {
      this.btnCyber.addEventListener('click', () => {
        AudioEngine.playClick();
        this.setTheme('cyber-default');
      });
    }

    if (this.settingsBtnMaterial) {
      this.settingsBtnMaterial.addEventListener('click', () => {
        AudioEngine.playClick();
        this.setTheme('material-light');
      });
    }

    if (this.settingsBtnCyber) {
      this.settingsBtnCyber.addEventListener('click', () => {
        AudioEngine.playClick();
        this.setTheme('cyber-default');
      });
    }
  }

  setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    AppState.update(s => s.activeTheme = themeName);

    if (this.iconEl) {
      this.iconEl.innerText = themeName === 'material-light' ? '🌙' : '☀️';
    }

    this.updateThemeButtons();
    CurriculumEngine.render();
  }

  updateThemeButtons() {
    const cur = document.body.getAttribute('data-theme') || 'cyber-default';
    const isLight = cur === 'material-light';

    if (this.btnMaterial) this.btnMaterial.classList.toggle('active', isLight);
    if (this.btnCyber) this.btnCyber.classList.toggle('active', !isLight);

    if (this.settingsBtnMaterial) this.settingsBtnMaterial.classList.toggle('active', isLight);
    if (this.settingsBtnCyber) this.settingsBtnCyber.classList.toggle('active', !isLight);
  }
}

let ThemeManager = null;


// ----------------------------------------------------------------------------
// 14. ONBOARDING & USER INFORMATION GATHERING FLOW
// ----------------------------------------------------------------------------
class OnboardingController {
  constructor() {
    this.modal = document.getElementById('onboarding-modal');
    this.step1 = document.getElementById('onboard-step-1');
    this.step2 = document.getElementById('onboard-step-2');
    this.step3 = document.getElementById('onboard-step-3');

    this.btnNext1 = document.getElementById('btn-onboard-next-1');
    this.btnNext2 = document.getElementById('btn-onboard-next-2');
    this.btnFinish = document.getElementById('btn-onboard-finish');

    this.nameInput = document.getElementById('onboard-name-input');
    this.langTiles = document.querySelectorAll('.onboard-lang-tile');

    this.tempName = 'Hunter Solo';
    this.tempGoal = 'casual';
    this.tempLang = 'japanese';

    this.bindEvents();
  }

  checkOnboarding() {
    if (!AppState.state.onboardingComplete && this.modal) {
      this.modal.classList.remove('hidden');
    }
  }

  bindEvents() {
    if (this.btnNext1) {
      this.btnNext1.addEventListener('click', () => {
        const val = this.nameInput ? this.nameInput.value.trim() : '';
        this.tempName = val || 'Hunter Solo';
        AudioEngine.playClick();

        if (this.step1) this.step1.classList.add('hidden');
        if (this.step2) this.step2.classList.remove('hidden');
      });
    }

    if (this.btnNext2) {
      this.btnNext2.addEventListener('click', () => {
        const selectedRadio = document.querySelector('input[name="learning-goal"]:checked');
        this.tempGoal = selectedRadio ? selectedRadio.value : 'casual';
        AudioEngine.playClick();

        if (this.step2) this.step2.classList.add('hidden');
        if (this.step3) this.step3.classList.remove('hidden');
      });
    }

    this.langTiles.forEach(tile => {
      tile.addEventListener('click', () => {
        this.langTiles.forEach(t => t.classList.remove('active'));
        tile.classList.add('active');
        this.tempLang = tile.getAttribute('data-lang') || 'japanese';
        AudioEngine.playClick();
      });
    });

    if (this.btnFinish) {
      this.btnFinish.addEventListener('click', () => {
        AudioEngine.playLevelUp();
        FX.burst(window.innerWidth / 2, window.innerHeight / 2, 60);

        AppState.update(state => {
          state.profile.name = this.tempName;
          state.learningGoal = this.tempGoal;
          state.selectedLanguage = this.tempLang;
          state.onboardingComplete = true;
        });

        if (this.modal) this.modal.classList.add('hidden');
        CurriculumEngine.render();
        Mascot.say(`Welcome to Apex Lingo, Hunter ${this.tempName}! Your neural learning matrix is calibrated.`);
      });
    }
  }
}

let OnboardingManager = null;


// ----------------------------------------------------------------------------
// 15. BULLETPROOF GOOGLE CLOUD IDENTITY & PROFILE CONTROLLER
// ----------------------------------------------------------------------------
class ProfileController {
  constructor() {
    // UI Displays
    this.nameDisplay = document.getElementById('profile-name-display');
    this.emailDisplay = document.getElementById('profile-email-display');
    this.avatarDisplay = document.getElementById('profile-avatar-display');
    this.rankTag = document.getElementById('profile-rank-tag');
    this.topGreeting = document.getElementById('top-user-greeting');
    this.resumeBtn = document.getElementById('btn-resume-course');
    this.resumeNodeTitle = document.getElementById('resume-node-title');
    this.btnEditName = document.getElementById('btn-edit-name');

    // Google Verified Container & Buttons
    this.googleConnectedBox = document.getElementById('google-connected-box');
    this.gDisplayName = document.getElementById('g-display-name');
    this.gDisplayEmail = document.getElementById('g-display-email');
    this.btnGoogleTrigger = document.getElementById('btn-google-auth-trigger');
    this.btnSignOut = document.getElementById('btn-google-signout');

    // Google Modal Elements
    this.googleModal = document.getElementById('google-auth-modal');
    this.btnCloseGoogleModal = document.getElementById('btn-close-google-modal');
    this.accountTiles = document.querySelectorAll('.google-account-tile');
    this.customEmailInput = document.getElementById('custom-google-email-input');
    this.btnCustomLogin = document.getElementById('btn-custom-google-login');

    // Profile Settings Toggles
    this.toggleSound = document.getElementById('toggle-sound');
    this.toggleSpeech = document.getElementById('toggle-speech');
    this.toggleAnimations = document.getElementById('toggle-animations');

    this.bindEvents();
  }

  bindEvents() {
    // Open Google Account Selector Modal
    if (this.btnGoogleTrigger) {
      this.btnGoogleTrigger.addEventListener('click', () => {
        AudioEngine.playClick();
        if (this.googleModal) this.googleModal.classList.remove('hidden');
      });
    }

    // Close Google Modal
    if (this.btnCloseGoogleModal) {
      this.btnCloseGoogleModal.addEventListener('click', () => {
        AudioEngine.playClick();
        if (this.googleModal) this.googleModal.classList.add('hidden');
      });
    }

    // Google Account Tile Click
    this.accountTiles.forEach(tile => {
      tile.addEventListener('click', () => {
        const name = tile.getAttribute('data-name');
        const email = tile.getAttribute('data-email');
        const avatar = tile.getAttribute('data-avatar');
        this.authenticateGoogleUser(name, email, avatar);
      });
    });

    // Custom Google Email Login
    if (this.btnCustomLogin) {
      this.btnCustomLogin.addEventListener('click', () => {
        const email = this.customEmailInput ? this.customEmailInput.value.trim() : '';
        if (email && email.includes('@')) {
          const derivedName = email.split('@')[0].replace(/[._]/g, ' ');
          const titleName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
          this.authenticateGoogleUser(titleName, email, '👑');
        } else {
          AudioEngine.playError();
          Mascot.say("Please enter a valid Google email address!");
        }
      });
    }

    // Sign Out of Google
    if (this.btnSignOut) {
      this.btnSignOut.addEventListener('click', () => {
        AudioEngine.playClick();
        this.signOutGoogle();
      });
    }

    // Resume Course Button
    if (this.resumeBtn) {
      this.resumeBtn.addEventListener('click', () => {
        AudioEngine.playClick();
        TabNavigator.switchTab('tab-lingo');
        const lang = AppState.state.selectedLanguage;
        const currentLevel = AppState.state.unlockedLevels[lang] || 1;
        const targetNode = document.querySelector(`.path-node[data-level-id="${currentLevel}"]`);
        if (targetNode) {
          targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        Mascot.say(`Resuming training at Level ${currentLevel}!`);
      });
    }

    // Edit Name
    if (this.btnEditName) {
      this.btnEditName.addEventListener('click', () => {
        const newName = prompt("Enter new Hunter Name:", AppState.state.profile.name);
        if (newName && newName.trim()) {
          AppState.update(s => s.profile.name = newName.trim());
          Mascot.say(`Codename updated to Hunter ${newName.trim()}!`);
        }
      });
    }

    // Profile Tab Toggles
    if (this.toggleSound) {
      this.toggleSound.checked = AppState.state.soundEnabled;
      this.toggleSound.addEventListener('change', () => {
        AppState.update(s => s.soundEnabled = this.toggleSound.checked);
        Settings.syncToggles();
        if (this.toggleSound.checked) AudioEngine.playClick();
      });
    }

    if (this.toggleSpeech) {
      this.toggleSpeech.checked = AppState.state.speechEnabled;
      this.toggleSpeech.addEventListener('change', () => {
        AppState.update(s => s.speechEnabled = this.toggleSpeech.checked);
        Settings.syncToggles();
      });
    }

    if (this.toggleAnimations) {
      this.toggleAnimations.checked = AppState.state.animationsEnabled;
      this.toggleAnimations.addEventListener('change', () => {
        AppState.update(s => s.animationsEnabled = this.toggleAnimations.checked);
        Settings.syncToggles();
      });
    }
  }

  authenticateGoogleUser(name, email, avatar) {
    AudioEngine.playLevelUp();
    FX.burst(window.innerWidth / 2, window.innerHeight / 2, 60);

    AppState.update(state => {
      state.profile = {
        name: name,
        email: email,
        avatar: avatar,
        isGoogle: true,
        rankTitle: 'S-Rank Verified Google Hunter'
      };
      state.userXP += 100;
    });

    if (this.googleModal) this.googleModal.classList.add('hidden');
    Mascot.say(`Google Cloud Identity verified! Welcome, Hunter ${name} (+100 bonus XP).`);
  }

  signOutGoogle() {
    AppState.update(state => {
      state.profile = {
        name: 'Hunter Solo',
        email: 'hunter.solo@apexlingo.io',
        avatar: '🤖',
        isGoogle: false,
        rankTitle: 'E-Rank Awakened'
      };
    });
    Mascot.say("Signed out of Google Cloud Identity. Operating in Guest mode.");
  }

  render(state) {
    const name = state.profile.name || "Hunter Solo";
    if (this.nameDisplay) this.nameDisplay.innerText = name;
    if (this.topGreeting) this.topGreeting.innerText = name;
    if (this.emailDisplay) this.emailDisplay.innerText = state.profile.email;
    if (this.avatarDisplay) this.avatarDisplay.innerText = state.profile.avatar;
    if (this.rankTag) this.rankTag.innerText = state.profile.rankTitle;

    // Resume button text
    const lang = state.selectedLanguage;
    const activeLevel = state.unlockedLevels[lang] || 1;
    const levels = LEVEL_METADATA[lang] || LEVEL_METADATA.japanese;
    const levelInfo = levels.find(l => l.id === activeLevel) || levels[0];
    if (this.resumeNodeTitle) {
      this.resumeNodeTitle.innerText = `Jump to Level ${levelInfo.id}: ${levelInfo.title}`;
    }

    // Stats Matrix
    const xpEl = document.getElementById('stat-xp-count');
    if (xpEl) xpEl.innerText = `${state.userXP} XP`;

    const streakEl = document.getElementById('stat-streak-count');
    if (streakEl) streakEl.innerText = `${state.streak} Days`;

    const gemsEl = document.getElementById('stat-gems-count');
    if (gemsEl) gemsEl.innerText = `${state.coins}`;

    const heartsEl = document.getElementById('stat-hearts-count');
    if (heartsEl) heartsEl.innerText = state.isApexPro ? 'Unlimited (∞)' : `${state.hearts} / 5`;

    // Google Auth Box States
    if (state.profile.isGoogle) {
      if (this.googleConnectedBox) this.googleConnectedBox.classList.remove('hidden');
      if (this.gDisplayName) this.gDisplayName.innerText = state.profile.name;
      if (this.gDisplayEmail) this.gDisplayEmail.innerText = state.profile.email;
      if (this.btnGoogleTrigger) this.btnGoogleTrigger.classList.add('hidden');
      if (this.btnSignOut) this.btnSignOut.classList.remove('hidden');
    } else {
      if (this.googleConnectedBox) this.googleConnectedBox.classList.add('hidden');
      if (this.btnGoogleTrigger) this.btnGoogleTrigger.classList.remove('hidden');
      if (this.btnSignOut) this.btnSignOut.classList.add('hidden');
    }
  }
}

let Profile = null;


// ----------------------------------------------------------------------------
// 16. OFFICIAL GOOGLE IDENTITY SERVICES (GSI) GLOBAL CALLBACK HANDLER
// ----------------------------------------------------------------------------
window.handleGoogleSignInSuccess = function(response) {
  try {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const data = JSON.parse(jsonPayload);
    console.log("Official Google GSI Token parsed:", data);

    AppState.update(state => {
      state.profile = {
        name: data.name || 'Google Hunter',
        email: data.email || 'hunter@gmail.com',
        avatar: data.picture ? '👑' : '👤',
        isGoogle: true,
        rankTitle: 'Google Verified Hunter'
      };
      state.userXP += 100;
    });

    AudioEngine.playLevelUp();
    FX.burst(window.innerWidth / 2, window.innerHeight / 2, 60);
    Mascot.say(`Welcome, ${data.name}! Google Cloud Identity verified.`);

  } catch (err) {
    console.error("Failed to parse Google JWT credential:", err);
  }
};


// ----------------------------------------------------------------------------
// 17. SYSTEM SETTINGS & STORAGE RESET CONTROLLER (SYNCHRONIZED CONTROLS)
// ----------------------------------------------------------------------------
class SettingsController {
  constructor() {
    this.modal = document.getElementById('settings-modal');
    this.btnOpen = document.getElementById('btn-open-settings');
    this.btnClose = document.getElementById('btn-close-settings');

    this.nameInput = document.getElementById('settings-name-input');
    this.btnSaveName = document.getElementById('btn-save-settings-name');
    this.btnResetStorage = document.getElementById('btn-reset-storage');

    // Dedicated Settings Modal Toggles
    this.settingsToggleSound = document.getElementById('settings-toggle-sound');
    this.settingsToggleSpeech = document.getElementById('settings-toggle-speech');
    this.settingsToggleAnimations = document.getElementById('settings-toggle-animations');

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnOpen) {
      this.btnOpen.addEventListener('click', () => {
        AudioEngine.playClick();
        if (this.nameInput) this.nameInput.value = AppState.state.profile.name;
        this.syncToggles();
        if (this.modal) this.modal.classList.remove('hidden');
      });
    }

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => {
        AudioEngine.playClick();
        if (this.modal) this.modal.classList.add('hidden');
      });
    }

    if (this.btnSaveName) {
      this.btnSaveName.addEventListener('click', () => {
        const val = this.nameInput ? this.nameInput.value.trim() : '';
        if (val) {
          AppState.update(s => s.profile.name = val);
          AudioEngine.playClick();
          if (this.modal) this.modal.classList.add('hidden');
          Mascot.say(`Hunter codename updated to: ${val}!`);
        }
      });
    }

    // Modal Sound Switch
    if (this.settingsToggleSound) {
      this.settingsToggleSound.addEventListener('change', () => {
        AppState.update(s => s.soundEnabled = this.settingsToggleSound.checked);
        this.syncProfileToggles();
        if (this.settingsToggleSound.checked) AudioEngine.playClick();
      });
    }

    // Modal Speech Switch
    if (this.settingsToggleSpeech) {
      this.settingsToggleSpeech.addEventListener('change', () => {
        AppState.update(s => s.speechEnabled = this.settingsToggleSpeech.checked);
        this.syncProfileToggles();
      });
    }

    // Modal Animations Switch
    if (this.settingsToggleAnimations) {
      this.settingsToggleAnimations.addEventListener('change', () => {
        AppState.update(s => s.animationsEnabled = this.settingsToggleAnimations.checked);
        this.syncProfileToggles();
      });
    }

    if (this.btnResetStorage) {
      this.btnResetStorage.addEventListener('click', () => {
        if (confirm("Reset all Hunter progress, unlocked levels, and stats back to default factory settings?")) {
          AppState.resetAll();
          AudioEngine.playError();
          if (this.modal) this.modal.classList.add('hidden');
          location.reload();
        }
      });
    }
  }

  syncToggles() {
    if (this.settingsToggleSound) this.settingsToggleSound.checked = AppState.state.soundEnabled;
    if (this.settingsToggleSpeech) this.settingsToggleSpeech.checked = AppState.state.speechEnabled;
    if (this.settingsToggleAnimations) this.settingsToggleAnimations.checked = AppState.state.animationsEnabled;
  }

  syncProfileToggles() {
    const pSound = document.getElementById('toggle-sound');
    const pSpeech = document.getElementById('toggle-speech');
    const pAnim = document.getElementById('toggle-animations');

    if (pSound) pSound.checked = AppState.state.soundEnabled;
    if (pSpeech) pSpeech.checked = AppState.state.speechEnabled;
    if (pAnim) pAnim.checked = AppState.state.animationsEnabled;
  }
}

let Settings = null;


// ----------------------------------------------------------------------------
// 18. TAB NAVIGATION CONTROLLER (4 DOCKED TABS)
// ----------------------------------------------------------------------------
class TabNavigationController {
  constructor() {
    this.tabs = document.querySelectorAll('.nav-tab');
    this.screens = document.querySelectorAll('.tab-screen');
    this.bindEvents();
  }

  bindEvents() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        AudioEngine.playClick();
        const targetTab = tab.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(tabId) {
    this.tabs.forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
    });

    this.screens.forEach(s => {
      s.classList.toggle('active', s.id === tabId);
    });

    switch (tabId) {
      case 'tab-lingo':
        CurriculumEngine.render();
        Mascot.say("Lingo Sector active! Choose an unlocked gate to train your language.");
        break;
      case 'tab-chess':
        ChessEngine.loadPuzzle(AppState.state.activePuzzleIndex);
        Mascot.say("Tactical Chess arena active. Solve puzzles for bonus +15 💎!");
        break;
      case 'tab-tournament':
        TournamentManager.render();
        Mascot.say("Welcome to the Monarch League! Elevate your score to reach Tier S.");
        break;
      case 'tab-profile':
        Profile.render(AppState.state);
        Mascot.say("Hunter Terminal: Check audio settings, auth status, and mission records.");
        break;
    }
  }
}

let TabNavigator = null;


// ----------------------------------------------------------------------------
// 19. APP INITIALIZATION & DOM READY DISPATCHER
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Subsystems
  FX = new ParticleEngine('fx-canvas');
  Mascot = new MascotController();
  CurriculumEngine = new CurriculumPathEngine();
  QuizEngine = new InteractiveQuizEngine();
  ChessEngine = new TacticalChessEngine();
  TournamentManager = new TournamentEngine();
  LanguageManager = new LanguageSelectionController();
  Store = new StoreEngine();
  ThemeManager = new ThemeSwitchController();
  Settings = new SettingsController();
  Profile = new ProfileController();
  TabNavigator = new TabNavigationController();
  OnboardingManager = new OnboardingController();

  // Apply initial theme from persistent state
  document.body.setAttribute('data-theme', AppState.state.activeTheme || 'cyber-default');

  // Sync state to UI elements
  AppState.subscribe(state => {
    const coinCounter = document.getElementById('coin-counter');
    const storeCoinCounter = document.getElementById('store-coin-counter');
    const xpCounter = document.getElementById('xp-counter');
    const streakCounter = document.getElementById('streak-counter');
    const heartCounter = document.getElementById('heart-counter');
    const statGems = document.getElementById('stat-gems-count');

    if (coinCounter) coinCounter.innerText = state.coins;
    if (storeCoinCounter) storeCoinCounter.innerText = state.coins;
    if (statGems) statGems.innerText = state.coins;
    if (xpCounter) xpCounter.innerText = state.userXP;
    if (streakCounter) streakCounter.innerText = state.streak;
    if (heartCounter) heartCounter.innerText = state.isApexPro ? '∞' : state.hearts;

    if (Profile) Profile.render(state);
    if (ThemeManager) ThemeManager.updateThemeButtons();
    if (LanguageManager) LanguageManager.updateUI();
  });

  // Render initial curriculum path
  CurriculumEngine.render();

  // Load first chess puzzle
  ChessEngine.loadPuzzle(AppState.state.activePuzzleIndex);

  // Check Onboarding
  OnboardingManager.checkOnboarding();

  // Initial welcome greeting
  setTimeout(() => {
    if (AppState.state.onboardingComplete) {
      const name = AppState.state.profile.name;
      Mascot.say(`A.P.E.X. online! Welcome back, Hunter ${name}.`);
    }
  }, 600);

  // Register PWA Service Worker for offline capability
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Apex Lingo Service Worker registered:', reg.scope))
        .catch(err => console.warn('Service Worker registration skipped:', err));
    });
  }
});
