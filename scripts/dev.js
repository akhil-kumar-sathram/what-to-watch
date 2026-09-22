import { spawn } from 'child_process';

// Next.js dev CLI expects -p/--port and -H/--hostname (default: 0.0.0.0)
// Translate any Vite-style --host arguments to Next.js -H arguments
const rawArgs = process.argv.slice(2);
const nextArgs = ['dev'];

let hasPort = false;
let hasHostname = false;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--port' || arg === '-p') {
    nextArgs.push('-p', rawArgs[++i]);
    hasPort = true;
  } else if (arg.startsWith('--port=')) {
    nextArgs.push('-p', arg.split('=')[1]);
    hasPort = true;
  } else if (arg === '--host' || arg === '--hostname' || arg === '-H') {
    nextArgs.push('-H', rawArgs[++i]);
    hasHostname = true;
  } else if (arg.startsWith('--host=') || arg.startsWith('--hostname=')) {
    nextArgs.push('-H', arg.split('=')[1]);
    hasHostname = true;
  } else {
    nextArgs.push(arg);
  }
}

if (!hasPort) {
  nextArgs.push('-p', '3000');
}
if (!hasHostname) {
  nextArgs.push('-H', '0.0.0.0');
}

const child = spawn('./node_modules/.bin/next', nextArgs, {
  stdio: 'inherit',
  env: process.env,
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
