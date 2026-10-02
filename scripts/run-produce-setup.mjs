#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
import { splitSqlStatements } from './sql-utils.mjs';

const url = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
if (!url) throw new Error('DATABASE_URL or NEON_DATABASE_URL is required.');
const sql = neon(url);
const files = [
  'db/migrations/20261002_produce_accounts.sql',
  'db/add-contact-submissions.sql',
  'db/migrations/20261002_produce_platform.sql',
];
const statements = (await Promise.all(files.map(file => readFile(new URL(`../${file}`, import.meta.url), 'utf8'))))
  .flatMap(splitSqlStatements);
await sql.transaction(statements.map(statement => sql.query(statement)));
console.log('Logistics, contact and account tables are ready. Existing records were preserved.');
