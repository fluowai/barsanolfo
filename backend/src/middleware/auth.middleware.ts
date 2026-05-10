import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
  };
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
  iat: number;
  exp: number;
}

/**
 * Obter JWT_SECRET com validação
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET não está definido em variáveis de ambiente');
  }
  
  if (secret.includes('change-in-production') && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET padrão detectado em produção - Configure um secret seguro');
  }
  
  return secret;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Token não fornecido',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret) as JWTPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };

    next();
  } catch (error: any) {
    if (error.message === 'jwt expired') {
      res.status(401).json({
        success: false,
        message: 'Token expirado',
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
  }
}

export function generateToken(userId: string, email: string, role: string, organizationId: string): string {
  const secret = getJWTSecret();
  
  return jwt.sign(
    { sub: userId, email, role, organizationId },
    secret,
    { expiresIn: '24h' }
  );
}
