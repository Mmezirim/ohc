// Creates (or resets the password of) an admin-panel account.
//   npm run admin:create -- --email you@example.com --name "Your Name" [--role admin|editor]
// The password is read from a hidden prompt (or ADMIN_PASSWORD for automated setups) and never
// passed on the command line, so it doesn't end up in shell history.
import 'dotenv/config';
import readline from 'node:readline';
import mysql from 'mysql2/promise';
import { dbConfig } from '../src/db.js';
import { hashPassword, passwordProblem } from '../src/admin/security.js';

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

function askHidden(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const write = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (s) => write(s.includes(prompt) ? s : '*'.repeat(s.length ? 1 : 0));
    rl.question(prompt, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

async function main() {
  const email = String(arg('email') || '').trim().toLowerCase();
  const name = String(arg('name') || '').trim();
  const role = arg('role') === 'editor' ? 'editor' : 'admin';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || name.length < 2) {
    console.error('Usage: npm run admin:create -- --email you@example.com --name "Your Name" [--role admin|editor]');
    process.exit(1);
  }

  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await askHidden('New password (min 8 characters): ');
    const again = await askHidden('Repeat password: ');
    if (password !== again) {
      console.error('Passwords do not match.');
      process.exit(1);
    }
  }
  const problem = passwordProblem(password, { email, name });
  if (problem) {
    console.error(`Password rejected: ${problem}`);
    process.exit(1);
  }

  const conn = await mysql.createConnection(dbConfig());
  const hash = await hashPassword(password);
  const [existing] = await conn.query('SELECT id FROM admin_users WHERE email = ?', [email]);
  if (existing.length) {
    await conn.query(
      'UPDATE admin_users SET name = ?, role = ?, password_hash = ?, active = 1, failed_attempts = 0, locked_until = NULL, password_changed_at = UTC_TIMESTAMP() WHERE id = ?',
      [name, role, hash, existing[0].id],
    );
    await conn.query('DELETE FROM admin_sessions WHERE user_id = ?', [existing[0].id]);
    console.log(`Updated ${email} (${role}). Existing sessions were signed out.`);
  } else {
    await conn.query('INSERT INTO admin_users SET ?', [{ email, name, role, password_hash: hash }]);
    console.log(`Created ${role} account for ${email}. Sign in at /admin.`);
  }
  await conn.query('INSERT INTO audit_log SET ?', [{ user_email: email, action: existing.length ? 'cli_password_reset' : 'cli_user_created', entity: 'admin_users' }]);
  await conn.end();
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
