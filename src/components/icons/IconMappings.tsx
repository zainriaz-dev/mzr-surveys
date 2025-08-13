/**
 * Modern Icon Mappings using Material-UI Icons
 * This file provides a consistent icon library across the entire application
 */

// Import only commonly available Material-UI icons
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  WhatsApp,
  Facebook,
  Twitter,
  LinkedIn,
  Telegram,
  Email,
  Sms,
  PhoneAndroid,
  Security,
  AutoAwesome,
  Language,
  Storage,
  People,
  Settings,
  Lightbulb,
  GitHub,
  Launch,
  Close,
  Menu,
  Home,
  Analytics,
  Download,
  Check,
  Error,
  Warning,
  Info,
  Poll,
  QuestionAnswer,
  Chat,
  Comment,
  BarChart,
  PieChart,
  TrendingUp,
  Assessment,
  Dashboard,
  AccountCircle,
  Group,
  Business,
  Visibility,
  VisibilityOff,
  Search,
  Edit,
  Delete,
  Add,
  Remove,
  ArrowBack,
  ArrowForward,
  ArrowUpward,
  ArrowDownward,
  ExpandMore,
  ExpandLess,
  ChevronLeft,
  ChevronRight,
  Refresh,
  Save,
  FileDownload,
  Print,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Folder,
  Notifications,
  DarkMode,
  LightMode,
  Wifi,
  WifiOff,
  LocationOn,
  Smartphone,
  Tablet,
  Computer,
  Star,
  Favorite,
  BookmarkBorder,
  CalendarToday,
  Schedule,
  AccessTime,
  Timer,
  Update,
  Sync,
  History,
  Code,
  Build,
  Extension,
  Tune,
  GridOn,
  ViewList,
} from '@mui/icons-material';

// Define icon categories with semantic meanings
export const AppIcons = {
  // Core App Icons
  logo: Home,
  survey: Poll,
  
  // Sharing & Social
  share: ShareIcon,
  copy: CopyIcon,
  whatsapp: WhatsApp,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: LinkedIn,
  telegram: Telegram,
  email: Email,
  sms: Sms,
  phone: PhoneAndroid,
  
  // Navigation
  menu: Menu,
  close: Close,
  back: ArrowBack,
  forward: ArrowForward,
  up: ArrowUpward,
  down: ArrowDownward,
  expand: ExpandMore,
  collapse: ExpandLess,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  
  // Actions
  add: Add,
  remove: Remove,
  edit: Edit,
  delete: Delete,
  save: Save,
  download: Download,
  print: Print,
  refresh: Refresh,
  search: Search,
  
  // Status & Feedback
  success: Check,
  error: Error,
  warning: Warning,
  info: Info,
  star: Star,
  favorite: Favorite,
  bookmark: BookmarkBorder,
  
  // User & Social
  user: AccountCircle,
  users: People,
  group: Group,
  business: Business,
  
  // Features (from your current home page)
  security: Security,
  privacy: Security, // Using Security for privacy as well
  ai: AutoAwesome,
  sparkles: AutoAwesome,
  multilingual: Language,
  database: Storage,
  analytics: Analytics,
  settings: Settings,
  lightbulb: Lightbulb,
  
  // Development & Open Source
  github: GitHub,
  code: Code,
  launch: Launch,
  
  // Data & Charts
  chart: BarChart,
  pieChart: PieChart,
  trending: TrendingUp,
  assessment: Assessment,
  
  // File Types
  file: InsertDriveFile,
  pdf: PictureAsPdf,
  image: Image,
  folder: Folder,
  
  // UI States
  visible: Visibility,
  hidden: VisibilityOff,
  notifications: Notifications,
  darkMode: DarkMode,
  lightMode: LightMode,
  
  // Time & Schedule
  time: AccessTime,
  calendar: CalendarToday,
  schedule: Schedule,
  timer: Timer,
  
  // Connectivity
  wifi: Wifi,
  offline: WifiOff,
  location: LocationOn,
  
  // Device Types
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Computer,
  
  // Communication
  chat: Chat,
  comment: Comment,
  question: QuestionAnswer,
  poll: Poll,
  
  // Layout
  dashboard: Dashboard,
  grid: GridOn,
  list: ViewList,
  
  // Sync & Updates
  sync: Sync,
  update: Update,
  history: History,
  
  // Build & Development
  build: Build,
  extension: Extension,
  tune: Tune,
};

// Export individual icon components for direct use
export {
  ShareIcon,
  CopyIcon,
  WhatsApp,
  Facebook,
  Twitter,
  LinkedIn,
  Telegram,
  Email,
  Sms,
  PhoneAndroid,
  Security,
  AutoAwesome,
  Language,
  Storage,
  People,
  Settings,
  Lightbulb,
  GitHub,
  Launch,
  Close,
  Menu,
  Home,
  Analytics,
  Download,
  Check,
  Error,
  Warning,
  Info,
  Poll,
  QuestionAnswer,
  Chat,
  Comment,
  BarChart,
  PieChart,
  TrendingUp,
  Assessment,
  Dashboard,
  AccountCircle,
  Group,
  Business,
};

// Icon sizing utilities
export const IconSizes = {
  xs: { fontSize: 16 },
  sm: { fontSize: 20 },
  md: { fontSize: 24 },
  lg: { fontSize: 32 },
  xl: { fontSize: 40 },
  xxl: { fontSize: 48 },
} as const;

// Color variants for consistent theming
export const IconColors = {
  emerald: '#10b981',
  purple: '#9333ea',
  teal: '#14b8a6',
  amber: '#f59e0b',
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#22c55e',
  gray: '#6b7280',
  white: '#ffffff',
  black: '#000000',
} as const;

export type IconSizeKey = keyof typeof IconSizes;
export type IconColorKey = keyof typeof IconColors;
