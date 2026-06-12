#!/bin/bash
# Backup automático do banco de dados SQLite
# Use em cron: 0 2 * * * /path/to/backup-database.sh

set -e

# Configurações
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_PATH="${DB_PATH:-./backend/prisma/dev.db}"
DAYS_TO_KEEP="${DAYS_TO_KEEP:-30}"
LOG_FILE="${LOG_FILE:-./backups/backup.log}"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Função de logging
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Verificar se banco de dados existe
if [ ! -f "$DB_PATH" ]; then
  log "ERRO: Banco de dados não encontrado em $DB_PATH"
  exit 1
fi

# Criar timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/woojuris_backup_$TIMESTAMP.db"

# Fazer backup
log "Iniciando backup..."
cp "$DB_PATH" "$BACKUP_FILE"

# Comprimir backup
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

# Calcular tamanho
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "✅ Backup criado com sucesso: $BACKUP_FILE (Tamanho: $SIZE)"

# Remover backups antigos
log "Removendo backups com mais de $DAYS_TO_KEEP dias..."
find "$BACKUP_DIR" -name "woojuris_backup_*.db.gz" -mtime +$DAYS_TO_KEEP -delete

log "✅ Processo de backup concluído com sucesso!"
