import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

router.get('/petition-config', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let config = await prisma.petitionConfig.findFirst();
    
    if (!config) {
      config = await prisma.petitionConfig.create({
        data: {}
      });
    }

    res.json({ 
      success: true, 
      config: {
        hasLogo: !!config.logoData,
        logoData: config.logoData,
        footerName: config.footerName,
        footerOab: config.footerOab,
        footerAddress: config.footerAddress,
        footerPhone: config.footerPhone,
        footerEmail: config.footerEmail,
        footerWebsite: config.footerWebsite,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar configuração' });
  }
});

router.post('/petition-config', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { logoData, logoMimeType, footerName, footerOab, footerAddress, footerPhone, footerEmail, footerWebsite } = req.body;

    let config = await prisma.petitionConfig.findFirst();
    
    if (config) {
      config = await prisma.petitionConfig.update({
        where: { id: config.id },
        data: {
          logoData,
          logoMimeType,
          footerName,
          footerOab,
          footerAddress,
          footerPhone,
          footerEmail,
          footerWebsite,
        }
      });
    } else {
      config = await prisma.petitionConfig.create({
        data: {
          logoData,
          logoMimeType,
          footerName,
          footerOab,
          footerAddress,
          footerPhone,
          footerEmail,
          footerWebsite,
        }
      });
    }

    res.json({ 
      success: true, 
      message: 'Configuração salva com sucesso',
      config: {
        hasLogo: !!config.logoData,
        footerName: config.footerName,
        footerOab: config.footerOab,
        footerAddress: config.footerAddress,
        footerPhone: config.footerPhone,
        footerEmail: config.footerEmail,
        footerWebsite: config.footerWebsite,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao salvar configuração' });
  }
});

router.delete('/petition-config/logo', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.petitionConfig.findFirst();
    if (config) {
      await prisma.petitionConfig.update({
        where: { id: config.id },
        data: { logoData: null, logoMimeType: null }
      });
    }
    res.json({ success: true, message: 'Logo removido' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao remover logo' });
  }
});

router.get('/petition-templates', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const templates = await prisma.petitionTemplate.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, templates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar templates' });
  }
});

router.post('/petition-templates', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, content, fields } = req.body;
    const template = await prisma.petitionTemplate.create({
      data: { name, content, fields: JSON.stringify(fields) }
    });
    res.json({ success: true, template });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar template' });
  }
});

router.delete('/petition-templates/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.petitionTemplate.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Template removido' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao remover template' });
  }
});

router.get('/petitions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const petitions = await prisma.petition.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ success: true, petitions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar petições' });
  }
});

router.post('/petitions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, templateId, caseId, clientName, values } = req.body;
    const petition = await prisma.petition.create({
      data: { 
        title, 
        content, 
        templateId, 
        caseId, 
        clientName, 
        values: JSON.stringify(values) 
      }
    });
    res.json({ success: true, petition });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao salvar petição' });
  }
});

router.get('/petitions/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const petition = await prisma.petition.findUnique({
      where: { id }
    });
    if (!petition) {
      res.status(404).json({ success: false, message: 'Petição não encontrada' });
      return;
    }
    res.json({ success: true, petition });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar petição' });
  }
});

router.delete('/petitions/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.petition.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Petição removida' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao remover petição' });
  }
});

export default router;
