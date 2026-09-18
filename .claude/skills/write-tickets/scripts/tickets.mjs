#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : undefined;
};

const ROOT = arg('--dir') || join(process.cwd(), 'agent-doc');
const TASKS_MD = join(ROOT, 'tasks.md');
const TICKETS = join(ROOT, 'tickets.json');

const fail = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };

if (args.includes('--complete')) {
  const id = Number(arg('--complete'));
  if (!existsSync(TICKETS)) fail(`${TICKETS} not found - run the build first`);
  const data = JSON.parse(readFileSync(TICKETS, 'utf8'));
  const task = data.tasks.find((t) => t.id === id);
  if (!task) fail(`no task with id ${id}`);
  task.status = 'completed';
  writeFileSync(TICKETS, JSON.stringify(data, null, 2) + '\n');
  console.log(`✓ task ${id} (${task.title}) marked completed`);
  process.exit(0);
}

if (!existsSync(TASKS_MD)) fail(`${TASKS_MD} not found - run /write-spec first`);

const HEAD = /^##\s+(\d+)\.?\s+(.*?)\s*(?:<!--\s*(.*?)\s*-->)?\s*$/;
const BULLET = /^\s*-\s*\[[ xX]\]\s*(.+)$/;

const tasks = [];
let current = null;
let point = null;

const flushPoint = () => {
  if (current && point !== null) current.points.push(point.trim());
  point = null;
};
const flushTask = () => {
  flushPoint();
  if (current) tasks.push(current);
  current = null;
};

for (const raw of readFileSync(TASKS_MD, 'utf8').split(/\r?\n/)) {
  const head = raw.match(HEAD);
  if (head) {
    flushTask();
    const meta = head[3] || '';
    const blocked = (meta.match(/blockedBy:\s*([\d,\s]+)/) || [])[1] || '';
    current = {
      id: Number(head[1]),
      title: head[2] ? head[2].replace(/<!--.*?-->/, '').trim() : '',
      points: [],
      status: 'pending',
      blockedBy: blocked.split(/[,\s]+/).filter(Boolean).map(Number),
    };
    continue;
  }
  const bullet = raw.match(BULLET);
  if (bullet && current) {
    flushPoint();
    point = bullet[1].trim();
    continue;
  }
  if (current && point !== null && raw.trim() !== '') {
    point += `\n${raw.trim()}`;
  }
}
flushTask();

if (tasks.length === 0) fail('no tasks found - expected "## N. Title" headings with checkbox bullets');

const blockedArg = arg('--blocked-by');
if (blockedArg) {
  for (const pair of blockedArg.split(';')) {
    const [idStr, depsStr] = pair.split(':');
    const id = Number((idStr || '').trim());
    const deps = (depsStr || '').split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
    const t = tasks.find((x) => x.id === id);
    if (!t) fail(`--blocked-by references task ${id} - no such task`);
    t.blockedBy = deps;
  }
}

const ids = new Set(tasks.map((t) => t.id));
if (ids.size !== tasks.length) fail('duplicate task ids in tasks.md');
for (const t of tasks) {
  for (const b of t.blockedBy) {
    if (!ids.has(b)) fail(`task ${t.id} (${t.title}) is blockedBy ${b} - no such task id`);
  }
}
const byId = new Map(tasks.map((t) => [t.id, t]));
const ok = new Set();
const cycle = (id, stack) => {
  if (stack.includes(id)) return [...stack, id];
  if (ok.has(id)) return null;
  stack.push(id);
  for (const b of byId.get(id).blockedBy) {
    const c = cycle(b, stack);
    if (c) return c;
  }
  stack.pop();
  ok.add(id);
  return null;
};
for (const t of tasks) {
  const c = cycle(t.id, []);
  if (c) fail(`circular block: ${c.join(' → ')}`);
}

const out = {
  specs: arg('--specs') || join(ROOT, 'proposal.md'),
  codingRules: arg('--coding-rules') || null,
  additionalPrompt: arg('--prompt') || '',
  tasks,
};
writeFileSync(TICKETS, JSON.stringify(out, null, 2) + '\n');
console.log(`✓ ${TICKETS} written - ${tasks.length} tasks, all status=pending`);
for (const t of tasks) {
  console.log(`  #${t.id} ${t.title} - ${t.points.length} point(s), blockedBy: [${t.blockedBy.join(', ') || '-'}]`);
}
