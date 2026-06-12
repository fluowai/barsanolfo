-- WOOJURIS DATABASE SCHEMA (PostgreSQL)
-- Execute this entire file in your PostgreSQL database

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    logo TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    theme TEXT,
    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'LAWYER',
    title TEXT,
    oab TEXT,
    avatar TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    cpf_cnpj TEXT,
    city TEXT,
    state TEXT,
    source TEXT NOT NULL DEFAULT 'WEBSITE',
    channel TEXT,
    legal_area TEXT,
    description TEXT,
    urgency TEXT NOT NULL DEFAULT 'NORMAL',
    potential_value DECIMAL(10,2),
    score INTEGER,
    status TEXT NOT NULL DEFAULT 'NEW',
    loss_reason TEXT,
    responsible_id TEXT,
    lawyer_id TEXT,
    client_id UUID,
    last_contact_at TIMESTAMPTZ,
    next_action TEXT,
    next_action_date TIMESTAMPTZ,
    tags TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_leads_org ON leads(organization_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_legal_area ON leads(legal_area);
CREATE INDEX idx_leads_urgency ON leads(urgency);
CREATE INDEX idx_leads_responsible ON leads(responsible_id);

CREATE TABLE lead_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id),
    type TEXT NOT NULL,
    content TEXT,
    user_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_triages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id),
    legal_area TEXT NOT NULL,
    form_data TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'NORMAL',
    risk_level TEXT,
    summary TEXT,
    next_steps TEXT,
    internal_note TEXT,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'PERSON',
    cpf_cnpj TEXT,
    rg TEXT,
    birth_date DATE,
    marital_status TEXT,
    profession TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT NOT NULL,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    responsible_id TEXT,
    lawyer_id TEXT,
    notes TEXT,
    tags TEXT,
    onboarding_at TIMESTAMPTZ,
    last_contact_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_clients_org ON clients(organization_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_lawyer ON clients(lawyer_id);
CREATE INDEX idx_clients_doc ON clients(cpf_cnpj);

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    number TEXT,
    internal_title TEXT NOT NULL,
    court TEXT,
    court_room TEXT,
    district TEXT,
    state TEXT,
    case_class TEXT,
    legal_area TEXT,
    subject TEXT,
    active_pole TEXT,
    passive_pole TEXT,
    opposing_party TEXT,
    lawyer_id UUID NOT NULL REFERENCES users(id),
    intern_id TEXT,
    phase TEXT NOT NULL DEFAULT 'PRE_PROCEDURAL',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    case_value DECIMAL(12,2),
    success_probability INTEGER,
    risk_level TEXT,
    strategy TEXT,
    next_action TEXT,
    last_movement_at TIMESTAMPTZ,
    visible_to_client BOOLEAN NOT NULL DEFAULT FALSE,
    client_friendly_update TEXT,
    filed_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_cases_org ON cases(organization_id);
CREATE INDEX idx_cases_client ON cases(client_id);
CREATE INDEX idx_cases_lawyer ON cases(lawyer_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_phase ON cases(phase);
CREATE INDEX idx_cases_legal_area ON cases(legal_area);
CREATE INDEX idx_cases_number ON cases(number);

CREATE TABLE case_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id),
    date TIMESTAMPTZ NOT NULL,
    description TEXT NOT NULL,
    type TEXT,
    visible_to_client BOOLEAN NOT NULL DEFAULT FALSE,
    client_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_movements_case ON case_movements(case_id);

CREATE TABLE deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    client_id TEXT,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'OTHER',
    notification_date TIMESTAMPTZ,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    days_count INTEGER,
    business_days BOOLEAN NOT NULL DEFAULT FALSE,
    responsible_id UUID NOT NULL REFERENCES users(id),
    reviewer_id TEXT,
    status TEXT NOT NULL DEFAULT 'NOT_STARTED',
    priority TEXT NOT NULL DEFAULT 'NORMAL',
    description TEXT,
    document_id TEXT,
    proof_file TEXT,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_deadlines_org ON deadlines(organization_id);
CREATE INDEX idx_deadlines_case ON deadlines(case_id);
CREATE INDEX idx_deadlines_resp ON deadlines(responsible_id);
CREATE INDEX idx_deadlines_status ON deadlines(status);
CREATE INDEX idx_deadlines_end ON deadlines(end_date);
CREATE INDEX idx_deadlines_priority ON deadlines(priority);

CREATE TABLE hearings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    client_id TEXT,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'HEARING',
    date TIMESTAMPTZ NOT NULL,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    meeting_link TEXT,
    responsible_id UUID NOT NULL REFERENCES users(id),
    participants TEXT,
    description TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    reminder_before INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_hearings_org ON hearings(organization_id);
CREATE INDEX idx_hearings_case ON hearings(case_id);
CREATE INDEX idx_hearings_resp ON hearings(responsible_id);
CREATE INDEX idx_hearings_date ON hearings(date);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    title TEXT NOT NULL,
    description TEXT,
    client_id TEXT,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    deadline_id TEXT,
    created_by_id UUID NOT NULL REFERENCES users(id),
    assigned_to_id UUID NOT NULL REFERENCES users(id),
    reviewer_id TEXT,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'TODO',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_time INTEGER,
    spent_time INTEGER,
    tags TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_tasks_org ON tasks(organization_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due ON tasks(due_date);

CREATE TABLE task_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id),
    content TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'OTHER',
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    content_hash TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'PENDING',
    visible_to_client BOOLEAN NOT NULL DEFAULT FALSE,
    valid_until DATE,
    notes TEXT,
    uploaded_by_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_docs_org ON documents(organization_id);
CREATE INDEX idx_docs_client ON documents(client_id);
CREATE INDEX idx_docs_case ON documents(case_id);
CREATE INDEX idx_docs_category ON documents(category);
CREATE INDEX idx_docs_status ON documents(status);

CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id),
    version INTEGER NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    content_hash TEXT,
    uploaded_by_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    legal_area TEXT,
    type TEXT NOT NULL DEFAULT 'FIXED_FEE',
    template_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    total_value DECIMAL(12,2),
    upfront_payment DECIMAL(12,2),
    installment_count INTEGER,
    contingency_percent DECIMAL(5,2),
    payment_method TEXT,
    due_day INTEGER,
    penalty DECIMAL(5,2) DEFAULT 0,
    interest DECIMAL(5,2) DEFAULT 0,
    clauses TEXT,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    sent_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    valid_until DATE,
    signed_by_client BOOLEAN NOT NULL DEFAULT FALSE,
    signed_by_office BOOLEAN NOT NULL DEFAULT FALSE,
    responsible_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_contracts_org ON contracts(organization_id);
CREATE INDEX idx_contracts_client ON contracts(client_id);
CREATE INDEX idx_contracts_status ON contracts(status);

CREATE TABLE contract_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    legal_area TEXT,
    type TEXT NOT NULL DEFAULT 'FIXED_FEE',
    content TEXT NOT NULL,
    fields TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    client_id TEXT,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    contract_id TEXT,
    invoice_id TEXT,
    description TEXT NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    proof_file TEXT,
    notes TEXT,
    cost_center TEXT,
    commission_pct DECIMAL(5,2),
    commission_value DECIMAL(12,2),
    created_by_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_financial_org ON financial_transactions(organization_id);
CREATE INDEX idx_financial_client ON financial_transactions(client_id);
CREATE INDEX idx_financial_case ON financial_transactions(case_id);
CREATE INDEX idx_financial_status ON financial_transactions(status);
CREATE INDEX idx_financial_type ON financial_transactions(type);
CREATE INDEX idx_financial_category ON financial_transactions(category);
CREATE INDEX idx_financial_due ON financial_transactions(due_date);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    client_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status TEXT NOT NULL DEFAULT 'PENDING',
    payment_method TEXT,
    barcode TEXT,
    pix_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_contract ON invoices(contract_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    lead_id TEXT,
    channel TEXT NOT NULL,
    external_id TEXT,
    contact_name TEXT NOT NULL,
    contact_phone TEXT,
    contact_email TEXT,
    responsible_id TEXT,
    status TEXT NOT NULL DEFAULT 'NEW',
    tags TEXT,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_conv_org ON conversations(organization_id);
CREATE INDEX idx_conv_client ON conversations(client_id);
CREATE INDEX idx_conv_status ON conversations(status);
CREATE INDEX idx_conv_channel ON conversations(channel);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    content TEXT NOT NULL,
    direction TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'TEXT',
    media_url TEXT,
    status TEXT NOT NULL DEFAULT 'SENT',
    user_id TEXT,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,
    trigger TEXT NOT NULL,
    condition TEXT,
    action TEXT NOT NULL,
    action_config TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID NOT NULL REFERENCES automations(id),
    trigger TEXT NOT NULL,
    result TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data TEXT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id TEXT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    description TEXT,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity);
CREATE INDEX idx_audit_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, key)
);

CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL DEFAULT 'NATIONAL',
    recurring BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_holidays_org ON holidays(organization_id);
CREATE INDEX idx_holidays_date ON holidays(date);

CREATE TABLE ai_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    api_key TEXT NOT NULL,
    model TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE whatsapp_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auto_reply BOOLEAN NOT NULL DEFAULT FALSE,
    welcome_message TEXT,
    reminder_hours INTEGER NOT NULL DEFAULT 24,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'CUSTOM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE whatsapp_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL UNIQUE,
    name TEXT,
    client_id TEXT,
    last_message TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    direction TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    message_id TEXT,
    template_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE client_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE petition_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_data TEXT,
    logo_mime_type TEXT,
    footer_name TEXT,
    footer_oab TEXT,
    footer_address TEXT,
    footer_phone TEXT,
    footer_email TEXT,
    footer_website TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE petition_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    fields TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE petitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    template_id TEXT,
    case_id TEXT,
    client_name TEXT,
    values TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    channel TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_campaigns_org ON marketing_campaigns(organization_id);

CREATE TABLE content_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    title TEXT NOT NULL,
    type TEXT,
    date DATE NOT NULL,
    status TEXT,
    content TEXT,
    platform TEXT,
    author TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_calendar_org ON content_calendar(organization_id);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accounting_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    invoice_id TEXT,
    expense_id TEXT,
    synced BOOLEAN NOT NULL DEFAULT FALSE,
    external_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEED DATA
INSERT INTO organizations (name, timezone) VALUES ('Woojuris', 'America/Sao_Paulo');

INSERT INTO users (organization_id, email, password_hash, name, role)
SELECT id, 'admin@woojuris.com.br', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrador', 'ADMIN'
FROM organizations WHERE name = 'Woojuris';
