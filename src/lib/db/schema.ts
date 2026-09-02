// ProfitPilot Database Schema
// All monetary values stored in IDR (Indonesian Rupiah)

export interface Account {
  id: number;
  name: string;
  platform: 'shopee';
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface MetaAdAccount {
  id: number;
  account_id: string;
  name: string;
  currency: string;
  is_active: boolean;
  include_tax_11: boolean;
  created_at: string;
}

export interface ShopeeOrder {
  id: number;
  account_id: number;
  order_id: string;
  product_name: string;
  product_id: string;
  shop_name: string;
  item_price: number;
  quantity: number;
  commission_rate: number;
  commission_amount: number;
  status: 'selesai' | 'pending' | 'batal';
  source: 'organic' | 'ads';
  tag: string;
  utm_campaign: string;
  utm_source: string;
  utm_medium: string;
  order_date: string;
  created_at: string;
}

export interface MetaCampaign {
  id: number;
  meta_account_id: number;
  campaign_id: string;
  campaign_name: string;
  ad_set_id: string;
  ad_set_name: string;
  ad_id: string;
  ad_name: string;
  objective: string;
  status: 'active' | 'paused' | 'archived';
  daily_budget: number;
  lifetime_budget: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface MetaAdsMetric {
  id: number;
  campaign_id: number;
  metric_date: string;
  spend: number;
  spend_with_tax: number; // Includes PPN 11%
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  cost_per_conversion: number;
  reach: number;
  frequency: number;
  health_status: 'healthy' | 'high_cpm' | 'fatigue' | 'low_ctr';
  created_at: string;
}

export interface DailySummary {
  id: number;
  account_id: number;
  summary_date: string;
  total_commission: number;
  ads_commission: number;
  organic_commission: number;
  total_ad_spend: number;
  total_ad_spend_with_tax: number; // Includes PPN 11%
  net_profit: number;
  roas: number;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  cancelled_orders: number;
  created_at: string;
}

export interface Product {
  id: number;
  account_id: number;
  product_id: string;
  name: string;
  shop_name: string;
  category: string;
  tag: string;
  affiliate_link: string;
  commission_rate: number;
  image_url: string;
  is_active: boolean;
  total_revenue: number;
  total_orders: number;
  created_at: string;
}

export interface KPITarget {
  id: number;
  period: 'daily' | 'weekly' | 'monthly';
  target_date: string;
  target_revenue: number;
  target_roas: number;
  max_ad_spend: number;
  target_commission: number;
  target_orders: number;
  created_at: string;
}

export interface AutomationRule {
  id: number;
  rule_name: string;
  rule_type: 'pause_low_roas' | 'scale_high_roas' | 'budget_cap' | 'schedule' | 'custom';
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  is_active: boolean;
  last_triggered: string;
  created_at: string;
}

export interface AutomationLog {
  id: number;
  rule_id: number;
  action_taken: string;
  details: Record<string, unknown>;
  status: 'success' | 'failed';
  executed_at: string;
}

export interface MetaAPIConfig {
  id: number;
  app_id: string;
  app_secret: string;
  access_token: string;
  ad_account_id: string;
  include_tax_11: boolean;
  token_expires_at: string;
  is_connected: boolean;
  last_sync: string;
  created_at: string;
}

export interface TelegramConfig {
  id: number;
  bot_token: string;
  chat_id: string;
  is_active: boolean;
  notify_on_low_roas: boolean;
  notify_on_high_spend: boolean;
  notify_on_daily_summary: boolean;
  roas_threshold: number;
  spend_threshold: number;
  created_at: string;
}

// SQL Schema for SQLite initialization
export const DB_SCHEMA = `
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'shopee',
    username TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meta_ad_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'IDR',
    is_active INTEGER NOT NULL DEFAULT 1,
    include_tax_11 INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS shopee_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL DEFAULT 1,
    order_id TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    product_id TEXT,
    shop_name TEXT,
    item_price REAL NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    commission_rate REAL NOT NULL DEFAULT 0,
    commission_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    source TEXT NOT NULL DEFAULT 'organic',
    tag TEXT,
    utm_campaign TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    order_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meta_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meta_account_id INTEGER NOT NULL DEFAULT 1,
    campaign_id TEXT UNIQUE NOT NULL,
    campaign_name TEXT NOT NULL,
    ad_set_id TEXT,
    ad_set_name TEXT,
    ad_id TEXT,
    ad_name TEXT,
    objective TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    daily_budget REAL NOT NULL DEFAULT 0,
    lifetime_budget REAL NOT NULL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meta_ads_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    metric_date TEXT NOT NULL,
    spend REAL NOT NULL DEFAULT 0,
    spend_with_tax REAL NOT NULL DEFAULT 0,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    ctr REAL NOT NULL DEFAULT 0,
    cpc REAL NOT NULL DEFAULT 0,
    cpm REAL NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    cost_per_conversion REAL NOT NULL DEFAULT 0,
    reach INTEGER NOT NULL DEFAULT 0,
    frequency REAL NOT NULL DEFAULT 0,
    health_status TEXT NOT NULL DEFAULT 'healthy',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (campaign_id) REFERENCES meta_campaigns(id),
    UNIQUE(campaign_id, metric_date)
  );

  CREATE TABLE IF NOT EXISTS daily_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL DEFAULT 1,
    summary_date TEXT UNIQUE NOT NULL,
    total_commission REAL NOT NULL DEFAULT 0,
    ads_commission REAL NOT NULL DEFAULT 0,
    organic_commission REAL NOT NULL DEFAULT 0,
    total_ad_spend REAL NOT NULL DEFAULT 0,
    total_ad_spend_with_tax REAL NOT NULL DEFAULT 0,
    net_profit REAL NOT NULL DEFAULT 0,
    roas REAL NOT NULL DEFAULT 0,
    total_orders INTEGER NOT NULL DEFAULT 0,
    completed_orders INTEGER NOT NULL DEFAULT 0,
    pending_orders INTEGER NOT NULL DEFAULT 0,
    cancelled_orders INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL DEFAULT 1,
    product_id TEXT UNIQUE,
    name TEXT NOT NULL,
    shop_name TEXT,
    category TEXT,
    tag TEXT,
    affiliate_link TEXT,
    commission_rate REAL NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    total_revenue REAL NOT NULL DEFAULT 0,
    total_orders INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS kpi_targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL DEFAULT 'monthly',
    target_date TEXT NOT NULL,
    target_revenue REAL NOT NULL DEFAULT 0,
    target_roas REAL NOT NULL DEFAULT 0,
    max_ad_spend REAL NOT NULL DEFAULT 0,
    target_commission REAL NOT NULL DEFAULT 0,
    target_orders INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS automation_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    conditions TEXT NOT NULL DEFAULT '{}',
    actions TEXT NOT NULL DEFAULT '{}',
    is_active INTEGER NOT NULL DEFAULT 1,
    last_triggered TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS automation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER NOT NULL,
    action_taken TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'success',
    executed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (rule_id) REFERENCES automation_rules(id)
  );

  CREATE TABLE IF NOT EXISTS meta_api_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT,
    app_secret TEXT,
    access_token TEXT,
    ad_account_id TEXT,
    include_tax_11 INTEGER NOT NULL DEFAULT 1,
    token_expires_at TEXT,
    is_connected INTEGER NOT NULL DEFAULT 0,
    last_sync TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS telegram_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bot_token TEXT,
    chat_id TEXT,
    is_active INTEGER NOT NULL DEFAULT 0,
    notify_on_low_roas INTEGER NOT NULL DEFAULT 1,
    notify_on_high_spend INTEGER NOT NULL DEFAULT 1,
    notify_on_daily_summary INTEGER NOT NULL DEFAULT 1,
    roas_threshold REAL NOT NULL DEFAULT 2.0,
    spend_threshold REAL NOT NULL DEFAULT 500000,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_orders_date ON shopee_orders(order_date);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON shopee_orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_account ON shopee_orders(account_id);
  CREATE INDEX IF NOT EXISTS idx_metrics_date ON meta_ads_metrics(metric_date);
  CREATE INDEX IF NOT EXISTS idx_summary_date ON daily_summary(summary_date);
  CREATE INDEX IF NOT EXISTS idx_products_tag ON products(tag);
`;
