export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: 'Novo',
  AWAITING_CONTACT: 'Aguardando Contato',
  TRIAGE: 'Em Triagem',
  SCHEDULED: 'Agendado',
  PROPOSAL_SENT: 'Proposta Enviada',
  CLOSED: 'Fechado',
  LOST: 'Perdido',
};

export const CASE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
  ARCHIVED: 'Arquivado',
  FINISHED: 'Concluído',
};

export const CLIENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  BLOCKED: 'Bloqueado',
};

export const DEADLINE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  COMPLETED: 'Concluído',
  EXPIRED: 'Expirado',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Andamento',
  REVIEW: 'Revisão',
  DONE: 'Concluído',
};

export const HEARING_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendada',
  CONFIRMED: 'Confirmada',
  HELD: 'Realizada',
  CANCELLED: 'Cancelada',
  ADJOURNED: 'Adiada',
};

export const FINANCIAL_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Vencido',
  CANCELLED: 'Cancelado',
  PARTIAL: 'Parcial',
};

export function getStatusLabel(category: string, status: string): string {
  const maps: Record<string, Record<string, string>> = {
    lead: LEAD_STATUS_LABELS,
    case: CASE_STATUS_LABELS,
    client: CLIENT_STATUS_LABELS,
    deadline: DEADLINE_STATUS_LABELS,
    task: TASK_STATUS_LABELS,
    hearing: HEARING_STATUS_LABELS,
    financial: FINANCIAL_STATUS_LABELS,
  };
  return maps[category]?.[status] || status;
}
