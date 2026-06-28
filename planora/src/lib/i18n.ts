import { useAppStore } from '../store/app';
import { es, fr, de, zh, ja, pt, ru, it, ko, ar, bn, tr } from './i18n-locales';

const en = {
  // Navigation
  'nav.home': 'Home',
  'nav.tasks': 'Tasks',
  'nav.ai': 'AI',
  'nav.progress': 'Progress',
  'nav.settings': 'Settings',

  // Dashboard
  'dashboard.greeting': 'Good Morning',
  'dashboard.greeting.afternoon': 'Good Afternoon',
  'dashboard.greeting.evening': 'Good Evening',
  'dashboard.greeting.night': 'Good Night',
  'dashboard.points': 'pt',
  'dashboard.dueToday': 'Due Today',
  'dashboard.totalActive': 'Total Active',
  'dashboard.askAi': 'Ask AI',
  'dashboard.add': 'Add',
  'dashboard.priorityTasks': 'Priority Tasks',
  'dashboard.seeAll': 'See all',
  'dashboard.high': 'High',
  'dashboard.dueTodayLabel': 'Due Today',
  'dashboard.dueTomorrow': 'Tomorrow',
  'dashboard.caughtUp': 'You\'re all caught up',
  'dashboard.noActiveTasks': 'No active tasks for now.',

  // Tasks
  'tasks.title': 'Tasks',
  'tasks.placeholder': 'What\'s on your mind? Add a task or idea...',
  'tasks.filter.all': 'all',
  'tasks.filter.today': 'today',
  'tasks.filter.upcoming': 'upcoming',
  'tasks.filter.completed': 'completed',
  'tasks.mindClear': 'Your mind is clear.',

  // Progress
  'progress.title': 'Progress',
  'progress.subtitle': 'Your weekly activity and insights.',
  'progress.totalPoints': 'Total Points',
  'progress.dayStreak': 'Day Streak',
  'progress.weeklyOverview': 'Weekly Overview',
  'progress.aiInsights': 'AI Insights',
  'progress.achievements': 'Achievements',
  'progress.unlockInsights': 'Complete a few more tasks to unlock personalized productivity insights.',

  // Agent
  'agent.subtitle': 'Your Personal Agent',
  'agent.placeholder': 'Message your agent...',

  // Settings
  'settings.title': 'Settings',
  'settings.aiIntelligence': 'AI Intelligence',
  'settings.proactiveSuggestions': 'Proactive Suggestions',
  'settings.aiCanStart': 'AI can start conversations',
  'settings.notifications': 'Notifications',
  'settings.quietHours': 'Quiet Hours',
  'settings.to': 'to',
  'settings.account': 'Account',
  'settings.signOut': 'Sign Out & Reset App',
  'settings.languageRegionTime': 'Language, Region & Time',
  'settings.language': 'App Language',
  'settings.region': 'Region',
  'settings.dateFormat': 'Date Format',
  'settings.timeFormat': 'Time Format',
  'settings.timezone': 'Time Zone',
  'settings.firstDay': 'First Day of Week',
  'settings.sunday': 'Sunday',
  'settings.monday': 'Monday',
  'settings.preview': 'Preview',
  'settings.timeFormat.12': '12-hour (AM/PM)',
  'settings.timeFormat.24': '24-hour',
  'settings.searchLanguage': 'Search language...',
  'settings.searchTimezone': 'Search time zone...',
};

const hi = {
  // Navigation
  'nav.home': 'होम',
  'nav.tasks': 'टास्क',
  'nav.ai': 'एआई',
  'nav.progress': 'प्रगति',
  'nav.settings': 'सेटिंग्स',

  // Dashboard
  'dashboard.greeting': 'सुप्रभात',
  'dashboard.greeting.afternoon': 'शुभ दोपहर',
  'dashboard.greeting.evening': 'शुभ संध्या',
  'dashboard.greeting.night': 'शुभ रात्रि',
  'dashboard.points': 'पॉइंट्स',
  'dashboard.dueToday': 'आज के कार्य',
  'dashboard.totalActive': 'कुल सक्रिय',
  'dashboard.askAi': 'एआई से पूछें',
  'dashboard.add': 'जोड़ें',
  'dashboard.priorityTasks': 'प्राथमिकता कार्य',
  'dashboard.seeAll': 'सभी देखें',
  'dashboard.high': 'उच्च',
  'dashboard.dueTodayLabel': 'आज देय',
  'dashboard.dueTomorrow': 'कल देय',
  'dashboard.caughtUp': 'सब कुछ पूरा हो गया',
  'dashboard.noActiveTasks': 'फ़िलहाल कोई सक्रिय टास्क नहीं है।',

  // Tasks
  'tasks.title': 'टास्क',
  'tasks.placeholder': 'कुछ भी लिखें - परीक्षा, काम, विचार...',
  'tasks.filter.all': 'सभी',
  'tasks.filter.today': 'आज',
  'tasks.filter.upcoming': 'आगामी',
  'tasks.filter.completed': 'पूरा हुआ',
  'tasks.mindClear': 'आपका मन शांत है।',

  // Progress
  'progress.title': 'प्रगति',
  'progress.subtitle': 'आपकी साप्ताहिक गतिविधि और अंतर्दृष्टि।',
  'progress.totalPoints': 'कुल पॉइंट्स',
  'progress.dayStreak': 'लगातार दिन',
  'progress.weeklyOverview': 'साप्ताहिक अवलोकन',
  'progress.aiInsights': 'एआई अंतर्दृष्टि',
  'progress.achievements': 'उपलब्धियां',
  'progress.unlockInsights': 'व्यक्तिगत उत्पादकता अंतर्दृष्टि अनलॉक करने के लिए कुछ और कार्य पूरे करें।',

  // Agent
  'agent.subtitle': 'आपका व्यक्तिगत एजेंट',
  'agent.placeholder': 'अपने एजेंट को संदेश भेजें...',

  // Settings
  'settings.title': 'सेटिंग्स',
  'settings.aiIntelligence': 'एआई बुद्धिमत्ता',
  'settings.proactiveSuggestions': 'सक्रिय सुझाव',
  'settings.aiCanStart': 'एआई बातचीत शुरू कर सकता है',
  'settings.notifications': 'सूचनाएं',
  'settings.quietHours': 'शांत घंटे',
  'settings.to': 'से',
  'settings.account': 'खाता',
  'settings.signOut': 'साइन आउट करें',
  'settings.languageRegionTime': 'भाषा, क्षेत्र और समय',
  'settings.language': 'ऐप की भाषा',
  'settings.region': 'क्षेत्र',
  'settings.dateFormat': 'दिनांक प्रारूप',
  'settings.timeFormat': 'समय प्रारूप',
  'settings.timezone': 'समय क्षेत्र',
  'settings.firstDay': 'सप्ताह का पहला दिन',
  'settings.sunday': 'रविवार',
  'settings.monday': 'सोमवार',
  'settings.preview': 'पूर्वावलोकन',
  'settings.timeFormat.12': '12-घंटे (AM/PM)',
  'settings.timeFormat.24': '24-घंटे',
  'settings.searchLanguage': 'भाषा खोजें...',
  'settings.searchTimezone': 'समय क्षेत्र खोजें...',
};

const or = {
  // Navigation
  'nav.home': 'ହୋମ',
  'nav.tasks': 'ଟାସ୍କ',
  'nav.ai': 'ଏଆଇ',
  'nav.progress': 'ପ୍ରଗତି',
  'nav.settings': 'ସେଟିଂସ',

  // Dashboard
  'dashboard.greeting': 'ଶୁଭ ସକାଳ',
  'dashboard.greeting.afternoon': 'ଶୁଭ ଅପରାହ୍ନ',
  'dashboard.greeting.evening': 'ଶୁଭ ସନ୍ଧ୍ୟା',
  'dashboard.greeting.night': 'ଶୁଭ ରାତ୍ରି',
  'dashboard.points': 'ପଏଣ୍ଟ',
  'dashboard.dueToday': 'ଆଜିର ଟାସ୍କ',
  'dashboard.totalActive': 'ମୋଟ ସକ୍ରିୟ',
  'dashboard.askAi': 'ଏଆଇ କୁ ପଚାରନ୍ତୁ',
  'dashboard.add': 'ଯୋଡନ୍ତୁ',
  'dashboard.priorityTasks': 'ଜରୁରୀ ଟାସ୍କ',
  'dashboard.seeAll': 'ସବୁ ଦେଖନ୍ତୁ',
  'dashboard.high': 'ଉଚ୍ଚ',
  'dashboard.dueTodayLabel': 'ଆଜି ପାଇଁ',
  'dashboard.dueTomorrow': 'ଆସନ୍ତାକାଲି',
  'dashboard.caughtUp': 'ଆପଣ ସବୁ କାମ ସାରିଦେଇଛନ୍ତି',
  'dashboard.noActiveTasks': 'ବର୍ତ୍ତମାନ କୌଣସି ସକ୍ରିୟ ଟାସ୍କ ନାହିଁ।',

  // Tasks
  'tasks.title': 'ଟାସ୍କ',
  'tasks.placeholder': 'ଯେକୌଣସି କଥା ଲେଖନ୍ତୁ - ପରୀକ୍ଷା, କାମ, ବିଚାର...',
  'tasks.filter.all': 'ସବୁ',
  'tasks.filter.today': 'ଆଜି',
  'tasks.filter.upcoming': 'ଆଗାମୀ',
  'tasks.filter.completed': 'ସମ୍ପୂର୍ଣ୍ଣ',
  'tasks.mindClear': 'ଆପଣଙ୍କ ମନ ଶାନ୍ତ ଅଛି।',

  // Progress
  'progress.title': 'ପ୍ରଗତି',
  'progress.subtitle': 'ଆପଣଙ୍କର ସାପ୍ତାହିକ କାର୍ଯ୍ୟକଳାପ ଏବଂ ତଥ୍ୟ।',
  'progress.totalPoints': 'ମୋଟ ପଏଣ୍ଟ',
  'progress.dayStreak': 'ଲଗାତାର ଦିନ',
  'progress.weeklyOverview': 'ସାପ୍ତାହିକ ସମୀକ୍ଷା',
  'progress.aiInsights': 'ଏଆଇ ତଥ୍ୟ',
  'progress.achievements': 'ସଫଳତା',
  'progress.unlockInsights': 'ବ୍ୟକ୍ତିଗତ ଉତ୍ପାଦନଶୀଳତା ତଥ୍ୟ ଅନଲକ୍ କରିବାକୁ ଆଉ କିଛି ଟାସ୍କ ପୂରଣ କରନ୍ତୁ।',

  // Agent
  'agent.subtitle': 'ଆପଣଙ୍କ ବ୍ୟକ୍ତିଗତ ଏଜେଣ୍ଟ',
  'agent.placeholder': 'ଏଜେଣ୍ଟଙ୍କୁ ମେସେଜ୍ କରନ୍ତୁ...',

  // Settings
  'settings.title': 'ସେଟିଂସ',
  'settings.aiIntelligence': 'ଏଆଇ ବୁଦ୍ଧିମତ୍ତା',
  'settings.proactiveSuggestions': 'ସକ୍ରିୟ ପରାମର୍ଶ',
  'settings.aiCanStart': 'ଏଆଇ କଥାବାର୍ତ୍ତା ଆରମ୍ଭ କରିପାରିବ',
  'settings.notifications': 'ନୋଟିଫିକେସନ୍',
  'settings.quietHours': 'ଶାନ୍ତ ସମୟ',
  'settings.to': 'ରୁ',
  'settings.account': 'ଆକାଉଣ୍ଟ',
  'settings.signOut': 'ସାଇନ୍ ଆଉଟ୍ କରନ୍ତୁ',
  'settings.languageRegionTime': 'ଭାଷା, ଅଞ୍ଚଳ ଏବଂ ସମୟ',
  'settings.language': 'ଆପ୍ ଭାଷା',
  'settings.region': 'ଅଞ୍ଚଳ',
  'settings.dateFormat': 'ତାରିଖ ଫର୍ମାଟ୍',
  'settings.timeFormat': 'ସମୟ ଫର୍ମାଟ୍',
  'settings.timezone': 'ଟାଇମ୍ ଜୋନ୍',
  'settings.firstDay': 'ସପ୍ତାହର ପ୍ରଥମ ଦିନ',
  'settings.sunday': 'ରବିବାର',
  'settings.monday': 'ସୋମବାର',
  'settings.preview': 'ପ୍ରିଭ୍ୟୁ',
  'settings.timeFormat.12': '12-ଘଣ୍ଟା (AM/PM)',
  'settings.timeFormat.24': '24-ଘଣ୍ଟା',
  'settings.searchLanguage': 'ଭାଷା ଖୋଜନ୍ତୁ...',
  'settings.searchTimezone': 'ଟାଇମ୍ ଜୋନ୍ ଖୋଜନ୍ତୁ...',
};

const dictionaries: Record<string, typeof en> = {
  en,
  hi,
  or,
  es,
  fr,
  de,
  zh,
  ja,
  pt,
  ru,
  it,
  ko,
  ar,
  bn,
  tr,
};

export type LanguageCode = 'en' | 'hi' | 'or';

export function useTranslation() {
  const language = useAppStore((state) => state.settings.region.language) as LanguageCode | string;
  
  const dict = dictionaries[language] 
    ?? dictionaries[language.split('-')[0]] 
    ?? dictionaries['en'] 
    ?? {};

  return {
    t: (key: keyof typeof en | string) => (dict as any)[key] ?? (en as any)[key] ?? key,
    language,
  };
}
