// ── Auth & User ────────────────────────────────────────────
export type UserRole = 'admin' | 'coach' | 'client';

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  is_super_admin: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  email: string;
  full_name: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  invite_code: string;
}

// ── MT5 Accounts ───────────────────────────────────────────
export interface MT5Account {
  id: number;
  login: string;
  server: string;
  label: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  balance: number | null;
}

export interface OpenPosition {
  ticket: number;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  open_price: number;
  current_price: number;
  profit: number;
  swap: number;
  open_time: string;
  mae?: number | null;
  mfe?: number | null;
}

export interface Trade {
  ticket: number;
  symbol: string;
  type: number;
  volume: number;
  price: number;
  profit: number;
  time: string;
  comment: string;
  mae?: number | null;
  mfe?: number | null;
}

// ── Analysis ───────────────────────────────────────────────
export interface AnalysisSummary {
  total_trades: number;
  wins: number;
  losses: number;
  winrate: number;
  avg_win: number;
  avg_loss: number;
  risk_reward: number;
  total_profit: number;
  max_drawdown: number;
  max_drawdown_pct: number;
  max_drawdown_equity: number;
  max_drawdown_equity_pct: number;
  max_consecutive_losses: number;
  max_consecutive_wins: number;
  max_daily_trades: number;
  best_trade:  { symbol: string; profit: number };
  worst_trade: { symbol: string; profit: number };
  best_day:    { date: string; profit: number } | null;
  worst_day:   { date: string; profit: number } | null;
}

export interface AnalysisWarning {
  type: string;
  level: 'danger' | 'warning' | 'info';
  message: string;
}

export interface EquityCurvePoint {
  time: string;
  equity: number;
  floating_pnl: number;
  realized_pnl: number;
}

export interface TimeAnalysisPoint {
  hour: number;
  trades: number;
  wins: number;
  losses: number;
  winrate: number;
  profit: number;
}

export interface SymbolAnalysisPoint {
  symbol: string;
  trades: number;
  wins: number;
  losses: number;
  winrate: number;
  profit: number;
}

export interface Analysis {
  has_data: boolean;
  message?: string;
  summary?: AnalysisSummary;
  equity_curve: Array<{ time: string; equity: number; symbol: string; profit: number }>;
  equity_curve_realtime: EquityCurvePoint[];
  time_analysis: TimeAnalysisPoint[];
  symbol_analysis: SymbolAnalysisPoint[];
  mae_analysis: {
    avg_mae: number;
    avg_mfe: number;
    risky_trades_count: number;
    early_close_count: number;
  } | null;
  hold_time_analysis: {
    avg_win_minutes: number | null;
    avg_loss_minutes: number | null;
  } | null;
  open_positions_count: number;
  floating_pnl: number;
  warnings: AnalysisWarning[];
  psychology_score?: {
    overall: number;
    grade: { en: string; fa: string };
    scores: Record<string, number>;
    insights: Array<{
      type: string;
      severity: 'high' | 'medium' | 'low';
      message: { en: string; fa: string };
    }>;
    weights?: Record<string, number>;
  };
  session_analysis?: {
    sessions: Array<{
      session: string;
      label: { en: string; fa: string };
      trades: number;
      wins: number;
      losses: number;
      winrate: number;
      profit: number;
      avg_profit: number;
    }>;
    best_session: { session: string; label: { en: string; fa: string }; profit: number; winrate: number } | null;
    worst_session: { session: string; label: { en: string; fa: string }; profit: number; winrate: number } | null;
  };
  pareto_analysis?: {
    profit_pareto: {
      top_trades_count: number;
      top_trades_pct_of_total: number;
      top_trades_profit: number;
      total_profit: number;
    };
    loss_pareto: {
      top_trades_count: number;
      top_trades_pct_of_total: number;
      top_trades_loss: number;
      total_loss: number;
    };
    symbol_profit_share: Array<{ symbol: string; profit: number; share_pct: number }>;
    symbol_loss_share: Array<{ symbol: string; loss: number; share_pct: number }>;
  };
  entry_exit_quality?: {
    avg_entry_quality: number | null;
    avg_exit_quality: number | null;
    early_exit_count: number;
    late_exit_loss_count: number;
    sample_size: number;
    insight: { en: string; fa: string };
  } | null;
  cost_analysis?: {
    total_commission: number;
    total_swap: number;
    total_costs: number;
    gross_profit: number;
    cost_impact_pct: number;
    symbol_costs: Array<{ symbol: string; total_cost: number }>;
    most_expensive_symbol: { symbol: string; total_cost: number } | null;
  };
  trading_style?: {
    style: string;
    style_label: { en: string; fa: string };
    avg_hold_minutes: number;
    post_loss_streak_behavior: { sample_count: number; winrate: number; avg_profit: number } | null;
    post_win_streak_behavior: { sample_count: number; winrate: number; avg_profit: number } | null;
    insight: { en: string; fa: string };
  };
}

export interface SnapshotResponse {
  analysis_triggered?: boolean;
  has_snapshot: boolean;
  status?: string;
  message?: string;
  snapshot_time?: string;
  next_update_time?: string;
  hours_since_update?: number;
  hours_until_next?: number;
  balance?: number | null;
  equity?: number | null;
  analysis?: Analysis | null;
  open_positions?: OpenPosition[];
  trades?: Trade[];
}

// ── Plans & Subscriptions ──────────────────────────────────
export type PlanSlug = 'trial' | 'basic' | 'pro' | 'elite';

export interface Plan {
  id: number;
  name: string;
  slug: PlanSlug;
  price_usd: number;
  duration_days: number;
  max_mt5_accounts: number;
  is_active: boolean;
  analysis_mode?: string;
  analysis_interval_hours?: number | null;
}

// ── Coaching ───────────────────────────────────────────────
export type DisplayMode = 'name' | 'email' | 'both';

export interface CoachClientAccount {
  id: number;
  login: string;
  server: string;
  is_demo: boolean;
  has_snapshot: boolean;
  balance: number | null;
  equity: number | null;
  profit: number | null;
  max_drawdown: number | null;
  hours_since_update: number | null;
  hours_until_next: number | null;
}

export interface CoachClient {
  client_coach_id: number;
  client_id: number;
  client_email: string;
  client_full_name: string | null;
  display_mode: DisplayMode;
  display_label: string | null;
  plan_name: string | null;
  plan_slug: string | null;
  connected_since: string | null;
  accounts: CoachClientAccount[];
}

// ── Invite Codes ───────────────────────────────────────────
export type InviteCodeType = 'coach' | 'client';

export interface InviteCode {
  id: number;
  code: string;
  code_type: InviteCodeType;
  is_used: boolean;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string | null;
  used_at: string | null;
  used_by_name?: string | null;
}

// ── Admin ──────────────────────────────────────────────────
export interface AdminStats {
  total_users: number;
  total_coaches: number;
  total_clients: number;
  total_mt5_accounts: number;
  active_subscriptions: number;
  unused_invite_codes: number;
}

export interface AdminUser extends User {
  plan_name: string | null;
  plan_slug: string | null;
  plan_id: number | null;
}

export interface AdminCoach extends User {
  client_count: number;
  active_invite_codes_count: number;
  plan_name: string | null;
  plan_slug: string | null;
}

// ── Journal ────────────────────────────────────────────────
export interface Journal {
  pre_emotion?: string;
  pre_reason?: string;
  pre_strategy?: string;
  pre_risk?: number;
  post_emotion?: string;
  post_lesson?: string;
  post_rating?: number;
  post_followed_plan?: boolean;
  tags?: string;
}

// ── Features ───────────────────────────────────────────────
export interface UserFeatures {
  realtime_analysis: boolean;
  analysis_mode: boolean;
  [key: string]: boolean;
}

// ── Journal ────────────────────────────────────────────────
export interface JournalEntry {
  id: number;
  account_id: number;
  ticket?: number;
  symbol?: string;
  trade_type?: string;
  pre_emotion?: string;
  pre_reason?: string;
  pre_strategy?: string;
  pre_risk?: number;
  post_emotion?: string;
  post_lesson?: string;
  post_rating?: number;
  post_followed_plan?: boolean;
  tags?: string;
  profit?: number;
  created_at: string;
  updated_at?: string;
}

export interface EmotionPnL {
  emotion: string;
  avg_profit: number;
  count: number;
}

export interface JournalAnalysisData {
  total_journals: number;
  avg_post_rating: number | null;
  plan_followed_pct: number | null;
  emotion_distribution: Record<string, number>;
  post_emotion_distribution: Record<string, number>;
  emotion_pnl: EmotionPnL[];
  rating_pnl_correlation: { rating: number; avg_profit: number; count: number }[];
  plan_followed_pnl: {
    followed: { avg_profit: number; count: number };
    not_followed: { avg_profit: number; count: number };
  };
  top_tags: { tag: string; count: number }[];
  monthly_journal_count: { month: string; count: number }[];
}

export interface JournalPermission {
  coach_id: number;
  coach_name: string;
  allow_journal_view: boolean;
}

// ── Charts ─────────────────────────────────────────────────
export interface ChartPt { time: string; value: number; }

export interface ChartsData {
  account_id: number;
  initial_balance: number | null;
  series: {
    growth:   { balance_growth: ChartPt[]; equity_growth: ChartPt[]; mfe_growth: ChartPt[]; mae_growth: ChartPt[]; };
    balance:  { balance: ChartPt[];        equity: ChartPt[]; };
    profit:   { profit: ChartPt[]; per_trade: ChartPt[]; };
    drawdown: { drawdown: ChartPt[]; };
    margin:   { margin: ChartPt[]; };
  };
}

// ── API ────────────────────────────────────────────────────
export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
