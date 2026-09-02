import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET() {
  try {
    const db = getDB();
    const metaConfig = db.prepare('SELECT * FROM meta_api_config ORDER BY id DESC LIMIT 1').get() as any;
    const telegramConfig = db.prepare('SELECT * FROM telegram_config ORDER BY id DESC LIMIT 1').get() as any;
    const accounts = db.prepare('SELECT * FROM accounts').all();

    return NextResponse.json({
      meta: metaConfig || { app_id: '', access_token: '', ad_account_id: '', is_connected: 0 },
      telegram: telegramConfig || { bot_token: '', chat_id: '', is_active: 0, roas_threshold: 2.0, spend_threshold: 500000 },
      accounts,
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const body = await request.json();
    const { section, app_id, app_secret, access_token, ad_account_id, bot_token, chat_id, roas_threshold, spend_threshold, account_name, account_username } = body;

    if (section === 'meta') {
      db.prepare(`
        INSERT INTO meta_api_config (app_id, app_secret, access_token, ad_account_id, is_connected)
        VALUES (?, ?, ?, ?, 1)
      `).run(app_id, app_secret, access_token, ad_account_id);
      return NextResponse.json({ success: true, message: 'Meta Graph API berhasil disimpan & terhubung!' });
    }

    if (section === 'telegram') {
      db.prepare(`
        INSERT INTO telegram_config (bot_token, chat_id, is_active, roas_threshold, spend_threshold)
        VALUES (?, ?, 1, ?, ?)
      `).run(bot_token, chat_id, Number(roas_threshold) || 2.0, Number(spend_threshold) || 500000);
      return NextResponse.json({ success: true, message: 'Pengaturan Telegram berhasil disimpan!' });
    }

    if (section === 'add_account') {
      db.prepare('INSERT INTO accounts (name, platform, username) VALUES (?, "shopee", ?)').run(account_name, account_username);
      return NextResponse.json({ success: true, message: 'Akun Shopee baru berhasil ditambahkan!' });
    }

    return NextResponse.json({ error: 'Section tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Settings POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
