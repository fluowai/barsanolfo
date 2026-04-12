import rateLimit from 'express-rate-limit';

/**
 * Rate limit para login - máximo 5 tentativas a cada 15 minutos
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting em modo development
    return process.env.NODE_ENV === 'development';
  },
});

/**
 * Rate limit para API em geral - máximo 100 requisições a cada 15 minutos
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limit para endpoints sensíveis - máximo 30 requisições a cada 1 hora
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 30,
  message: 'Limite de requisições atingido. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
