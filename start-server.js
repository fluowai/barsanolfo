#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(__dirname, 'backend');
const serverPath = path.join(backendDir, 'dist', 'server.js');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║          🚀 BARSA ADVOCACIA - INICIANDO                    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📂 Diretório:', backendDir);
console.log('📄 Servidor:', serverPath);
console.log('⏳ Iniciando...\n');

// Spawn o processo do servidor
const server = spawn('node', [serverPath], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true
});

// Handlers
server.on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`\n⚠️  Servidor encerrado com código ${code}`);
  process.exit(code || 0);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📛 Encerrando servidor...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n📛 Encerrando servidor...');
  server.kill();
  process.exit(0);
});

console.log('🎯 Pressione Ctrl+C para parar o servidor\n');
