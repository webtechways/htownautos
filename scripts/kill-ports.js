#!/usr/bin/env node
// Kill processes on ports 3000, 3002, 3003 using /proc (no fuser/lsof needed)
const fs = require('fs');
const ports = [3000, 3002, 3003];

const lines = fs.readFileSync('/proc/net/tcp6', 'utf8').split('\n').slice(1);
const targetInodes = new Set();
const inodeToPort = {};

for (const line of lines) {
  const parts = line.trim().split(/\s+/);
  if (!parts[1]) continue;
  const portHex = parts[1].split(':').pop();
  const port = parseInt(portHex, 16);
  if (ports.includes(port) && parts[3] === '0A') { // 0A = LISTEN
    targetInodes.add(parts[9]);
    inodeToPort[parts[9]] = port;
  }
}

if (targetInodes.size === 0) {
  console.log('All ports free');
  process.exit(0);
}

const procDirs = fs.readdirSync('/proc').filter(d => /^\d+$/.test(d));
let killed = 0;

for (const pid of procDirs) {
  try {
    const fds = fs.readdirSync(`/proc/${pid}/fd`);
    for (const fd of fds) {
      try {
        const link = fs.readlinkSync(`/proc/${pid}/fd/${fd}`);
        for (const inode of targetInodes) {
          if (link === `socket:[${inode}]`) {
            process.kill(Number(pid), 9);
            console.log(`Killed PID ${pid} (port ${inodeToPort[inode]})`);
            killed++;
          }
        }
      } catch {}
    }
  } catch {}
}

console.log(killed ? `Killed ${killed} processes` : 'No processes found');
