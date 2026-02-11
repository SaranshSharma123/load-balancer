import http from 'http';
const args = process.argv.slice(2);
const getArg = (flag, fallback) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
};
const hasFlag = (flag) => args.includes(flag);

const TARGET = getArg('--target', 'http://localhost:3000');
const TOTAL_REQUESTS = parseInt(getArg('--requests', '500'));
const CONCURRENCY = parseInt(getArg('--concurrency', '50'));
const RUN_PHASES = hasFlag('--phases');

// ─── Colors ─────────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgBlue: '\x1b[44m',
  bgYellow: '\x1b[43m',
};

// ─── HTTP Request Helper ────────────────────────────────────────────────────
function sendRequest(url) {
  return new Promise((resolve) => {
    const start = performance.now();

    const req = http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const elapsed = performance.now() - start;
        let parsed = null;
        try { parsed = JSON.parse(body); } catch {}

        resolve({
          status: res.statusCode,
          latency: elapsed,
          server: parsed?.server || 'unknown',
          error: null,
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 0,
        latency: performance.now() - start,
        server: 'error',
        error: err.message,
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 0,
        latency: performance.now() - start,
        server: 'timeout',
        error: 'Request timed out (10s)',
      });
    });
  });
}

// ─── Concurrent Batch Runner ────────────────────────────────────────────────
async function runBatch(url, totalRequests, concurrency) {
  const results = [];
  let completed = 0;
  let inFlight = 0;
  const queue = Array.from({ length: totalRequests }, (_, i) => i);
  const progressBarWidth = 40;

  function updateProgress() {
    const pct = completed / totalRequests;
    const filled = Math.round(pct * progressBarWidth);
    const empty = progressBarWidth - filled;
    const bar = `${c.green}${'█'.repeat(filled)}${c.dim}${'░'.repeat(empty)}${c.reset}`;
    const pctStr = `${(pct * 100).toFixed(1)}%`.padStart(6);
    process.stdout.write(
      `\r  ${bar}  ${pctStr}  ${c.cyan}${completed}${c.reset}/${totalRequests}  ` +
      `${c.yellow}⚡ ${inFlight} in-flight${c.reset}   `
    );
  }

  const startTime = performance.now();

  await new Promise((resolve) => {
    function next() {
      while (inFlight < concurrency && queue.length > 0) {
        queue.shift();
        inFlight++;
        sendRequest(url).then((result) => {
          results.push(result);
          completed++;
          inFlight--;
          updateProgress();
          if (completed === totalRequests) {
            resolve();
          } else {
            next();
          }
        });
      }
    }
    next();
  });

  const totalTime = performance.now() - startTime;
  process.stdout.write('\n');

  return { results, totalTime };
}

// ─── Stats Calculator ───────────────────────────────────────────────────────
function calcStats(results, totalTime) {
  const successes = results.filter((r) => r.status >= 200 && r.status < 400);
  const errors = results.filter((r) => r.status === 0 || r.status >= 400);
  const latencies = successes.map((r) => r.latency).sort((a, b) => a - b);

  const percentile = (arr, p) => {
    if (arr.length === 0) return 0;
    const idx = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, idx)];
  };

  // Per-backend distribution
  const distribution = {};
  for (const r of successes) {
    distribution[r.server] = (distribution[r.server] || 0) + 1;
  }

  return {
    total: results.length,
    successes: successes.length,
    errors: errors.length,
    errorRate: ((errors.length / results.length) * 100).toFixed(2),
    totalTimeMs: totalTime.toFixed(0),
    rps: ((results.length / totalTime) * 1000).toFixed(1),
    latency: {
      min: latencies.length ? latencies[0].toFixed(1) : '—',
      max: latencies.length ? latencies[latencies.length - 1].toFixed(1) : '—',
      avg: latencies.length
        ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1)
        : '—',
      p50: percentile(latencies, 50).toFixed(1),
      p95: percentile(latencies, 95).toFixed(1),
      p99: percentile(latencies, 99).toFixed(1),
    },
    distribution,
    errorDetails: errors.slice(0, 5).map((e) => e.error),
  };
}

// ─── Report Printer ─────────────────────────────────────────────────────────
function printReport(label, stats) {
  const divider = `${c.dim}${'─'.repeat(60)}${c.reset}`;

  console.log('');
  console.log(divider);
  console.log(`${c.bold}${c.cyan}  📊  ${label}${c.reset}`);
  console.log(divider);

  // Throughput
  console.log(`${c.bold}  Throughput${c.reset}`);
  console.log(`    Total Requests   : ${c.white}${stats.total}${c.reset}`);
  console.log(`    Duration         : ${c.white}${stats.totalTimeMs}ms${c.reset}`);
  console.log(`    Requests/sec     : ${c.green}${c.bold}${stats.rps} RPS${c.reset}`);
  console.log('');

  // Status
  console.log(`${c.bold}  Status${c.reset}`);
  console.log(`    ✅ Success        : ${c.green}${stats.successes}${c.reset}`);
  const errColor = stats.errors > 0 ? c.red : c.green;
  console.log(`    ❌ Errors         : ${errColor}${stats.errors}${c.reset}  (${stats.errorRate}%)`);
  if (stats.errorDetails.length > 0) {
    stats.errorDetails.forEach((e) => {
      console.log(`       ${c.dim}→ ${e}${c.reset}`);
    });
  }
  console.log('');

  // Latency
  console.log(`${c.bold}  Latency${c.reset}`);
  console.log(`    Min              : ${c.white}${stats.latency.min}ms${c.reset}`);
  console.log(`    Avg              : ${c.white}${stats.latency.avg}ms${c.reset}`);
  console.log(`    p50              : ${c.yellow}${stats.latency.p50}ms${c.reset}`);
  console.log(`    p95              : ${c.yellow}${stats.latency.p95}ms${c.reset}`);
  console.log(`    p99              : ${c.magenta}${stats.latency.p99}ms${c.reset}`);
  console.log(`    Max              : ${c.red}${stats.latency.max}ms${c.reset}`);
  console.log('');

  // Distribution
  console.log(`${c.bold}  Backend Distribution${c.reset}`);
  const maxCount = Math.max(...Object.values(stats.distribution), 1);
  const barMax = 30;

  const sortedBackends = Object.entries(stats.distribution).sort((a, b) => b[1] - a[1]);
  for (const [server, count] of sortedBackends) {
    const barLen = Math.round((count / maxCount) * barMax);
    const pct = ((count / stats.successes) * 100).toFixed(1);
    const bar = `${c.blue}${'█'.repeat(barLen)}${c.reset}`;
    console.log(`    ${server.padEnd(12)}  ${bar}  ${c.white}${count}${c.reset} (${pct}%)`);
  }

  console.log(divider);
  console.log('');
}

// ─── Phase Runner (multi-phase stress test) ─────────────────────────────────
async function runPhases() {
  const phases = [
    { name: '🔥 Warm-Up',        requests: 50,   concurrency: 10  },
    { name: '🚀 Ramp-Up',        requests: 200,  concurrency: 50  },
    { name: '⚡ Burst',           requests: 500,  concurrency: 100 },
    { name: '🌊 Sustained Load', requests: 1000, concurrency: 75  },
    { name: '💥 Spike',           requests: 300,  concurrency: 150 },
    { name: '🧊 Cool-Down',      requests: 100,  concurrency: 20  },
  ];

  console.log('');
  console.log(`${c.bold}${c.magenta}╔══════════════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}${c.magenta}║       🧪  Multi-Phase Load Balancer Stress Test         ║${c.reset}`);
  console.log(`${c.bold}${c.magenta}╠══════════════════════════════════════════════════════════╣${c.reset}`);
  console.log(`${c.bold}${c.magenta}║  Target: ${TARGET.padEnd(46)} ║${c.reset}`);
  console.log(`${c.bold}${c.magenta}║  Phases: ${String(phases.length).padEnd(46)} ║${c.reset}`);
  console.log(`${c.bold}${c.magenta}║  Total Requests: ${String(phases.reduce((s, p) => s + p.requests, 0)).padEnd(38)} ║${c.reset}`);
  console.log(`${c.bold}${c.magenta}╚══════════════════════════════════════════════════════════╝${c.reset}`);

  const allResults = [];
  const globalStart = performance.now();

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    console.log('');
    console.log(`${c.bold}${c.cyan}  Phase ${i + 1}/${phases.length}: ${phase.name}${c.reset}`);
    console.log(`${c.dim}  ${phase.requests} requests @ ${phase.concurrency} concurrency${c.reset}`);
    console.log('');

    const { results, totalTime } = await runBatch(TARGET, phase.requests, phase.concurrency);
    allResults.push(...results);

    const stats = calcStats(results, totalTime);
    printReport(`Phase ${i + 1}: ${phase.name}`, stats);

    // Brief pause between phases
    if (i < phases.length - 1) {
      process.stdout.write(`${c.dim}  Pausing 1s before next phase...${c.reset}`);
      await new Promise((r) => setTimeout(r, 1000));
      process.stdout.write('\r' + ' '.repeat(50) + '\r');
    }
  }

  // Final summary
  const globalTime = performance.now() - globalStart;
  const globalStats = calcStats(allResults, globalTime);
  printReport('📈 OVERALL SUMMARY — All Phases Combined', globalStats);
}

// ─── Single Run ─────────────────────────────────────────────────────────────
async function runSingle() {
  console.log('');
  console.log(`${c.bold}${c.cyan}╔══════════════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}${c.cyan}║          🧪  Load Balancer Stress Test                  ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╠══════════════════════════════════════════════════════════╣${c.reset}`);
  console.log(`${c.bold}${c.cyan}║  Target       : ${TARGET.padEnd(39)} ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║  Requests     : ${String(TOTAL_REQUESTS).padEnd(39)} ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║  Concurrency  : ${String(CONCURRENCY).padEnd(39)} ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╚══════════════════════════════════════════════════════════╝${c.reset}`);
  console.log('');

  const { results, totalTime } = await runBatch(TARGET, TOTAL_REQUESTS, CONCURRENCY);
  const stats = calcStats(results, totalTime);
  printReport('Test Results', stats);
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  // Quick connectivity check
  try {
    await sendRequest(TARGET);
  } catch {
    console.error(`${c.red}❌ Cannot reach ${TARGET}. Is the load balancer running?${c.reset}`);
    process.exit(1);
  }

  if (RUN_PHASES) {
    await runPhases();
  } else {
    await runSingle();
  }
}

main().catch(console.error);
