// Creates a fresh copy of db/ in tests/.db before the test server starts
import { cpSync, rmSync } from 'node:fs';

const target = 'tests/.db';
rmSync(target, { recursive: true, force: true });
cpSync('db', target, { recursive: true });
console.log(`[prepare-db] fresh test data copied to ${target}`);
