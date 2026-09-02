import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET() {
  try {
    const db = getDB();

    // Fetch rules
    const rules = db.prepare('SELECT * FROM automation_rules ORDER BY id DESC').all();

    // Fetch logs
    const logs = db.prepare(`
      SELECT l.*, r.rule_name
      FROM automation_logs l
      LEFT JOIN automation_rules r ON l.rule_id = r.id
      ORDER BY l.executed_at DESC
      LIMIT 20
    `).all();

    return NextResponse.json({ rules, logs });
  } catch (error) {
    console.error('Automation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const body = await request.json();
    const { action, id, rule_name, rule_type, is_active } = body;

    if (action === 'toggle') {
      db.prepare('UPDATE automation_rules SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, id);
      return NextResponse.json({ success: true });
    }

    if (action === 'create') {
      db.prepare(`
        INSERT INTO automation_rules (rule_name, rule_type, conditions, actions, is_active)
        VALUES (?, ?, ?, ?, 1)
      `).run(
        rule_name || 'Rule Baru',
        rule_type || 'pause_low_roas',
        JSON.stringify({ min_roas: 1.5, min_spend: 100000 }),
        JSON.stringify({ action: 'PAUSE_CAMPAIGN' })
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'run_now') {
      // Simulate running automation rules engine
      db.prepare(`
        INSERT INTO automation_logs (rule_id, action_taken, details, status, executed_at)
        VALUES (?, ?, ?, 'success', datetime('now'))
      `).run(
        id || 1,
        'ROBOT_EXECUTE_CHECK',
        JSON.stringify({ message: 'Evaluasi performa ROAS kampanye selesai. 0 kampanye di-pause.' })
      );
      return NextResponse.json({ success: true, message: 'Robot automasi selesai mengeksekusi rule.' });
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Automation POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
