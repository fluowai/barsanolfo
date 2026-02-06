
import React from 'react';
import { Gavel, Scale, Briefcase, Users, FileText, ShieldAlert } from 'lucide-react';
import { NavItem, Service, TeamMember } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Início', href: '#home' },
  { label: 'O Escritório', href: '#escritorio' },
  { label: 'Atuação', href: '#atuacao' },
  { label: 'Equipe', href: '#equipe' },
  { label: 'Contato', href: '#contato' },
  { label: 'Área Restrita', href: 'http://localhost:3002' },
];

export const SERVICES: Service[] = [
  {
    id: 'rescisao',
    title: 'Rescisão Indireta',
    description: 'Quando a empresa comete falta grave, garantimos que você saia com todos os seus direitos preservados.',
    icon: 'ShieldAlert',
  },
  {
    id: 'horas-extras',
    title: 'Horas Extras e Intervalos',
    description: 'Cálculo e cobrança de horas trabalhadas além da jornada e intervalos não concedidos.',
    icon: 'Briefcase',
  },
  {
    id: 'assedio',
    title: 'Assédio Moral e Sexual',
    description: 'Defesa incisiva contra abusos no ambiente de trabalho, buscando justiça e reparação.',
    icon: 'Scale',
  },
  {
    id: 'acidente',
    title: 'Acidentes de Trabalho',
    description: 'Assessoria completa para indenizações por danos morais, materiais e estéticos decorrentes do trabalho.',
    icon: 'Gavel',
  },
  {
    id: 'documentacao',
    title: 'Vínculo Empregatício',
    description: 'Reconhecimento de direitos para trabalhadores sem carteira assinada ou com fraude na contratação.',
    icon: 'FileText',
  },
  {
    id: 'fgts',
    title: 'FGTS e Verbas Rescisórias',
    description: 'Garantia de que cada centavo devido na saída da empresa seja devidamente pago.',
    icon: 'Users',
  },
];

export const TEAM: TeamMember[] = [
  {
    name: 'Dra. Maria José Martins de Oliveira Almeida',
    role: 'Sócia-Fundadora | OAB/GO 43.681',
    bio: 'Advogada há 14 anos, formada pela UFG, especialista em Direito do Trabalho e Previdenciário. Atua com qualidade, proximidade e tecnologia na gestão da advocacia.',
    image: '/dra_maria_jose.jpg',
  },
  {
    name: 'Dra. Amanda Barsanulfo Martins de Oliveira Brandão',
    role: 'Sócia-Fundadora | OAB/GO 69.838',
    bio: 'Advogada formada pela Universo, pós-graduada em Direito do Trabalho. Atua nas áreas trabalhista e cível com foco em negociações complexas e defesa de direitos.',
    image: '/dra_amanda.jpg',
  },
];
