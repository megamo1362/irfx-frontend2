'use server';

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CSV_FILE = path.join(DATA_DIR, 'waitlist.csv');

export async function submitWaitlist(
  email: string,
  lang: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.includes('@') || !email.includes('.')) {
    return { success: false, error: 'Invalid email' };
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CSV_FILE)) {
      fs.writeFileSync(CSV_FILE, 'email,lang,timestamp\n', 'utf-8');
    }
    const safeEmail = email.replace(/"/g, '""');
    fs.appendFileSync(
      CSV_FILE,
      `"${safeEmail}","${lang}","${new Date().toISOString()}"\n`,
      'utf-8'
    );
    return { success: true };
  } catch (err) {
    console.error('Waitlist error:', err);
    return { success: false, error: 'Server error' };
  }
}
