/**
 * Jest Setup File
 * Executado antes de todos os testes
 */

// Aumentar timeout para testes de integração com Redis
jest.setTimeout(30000);

// Suprimir logs durante testes (opcional)
// jest.spyOn(console, 'log').mockImplementation(() => {});

// Mock de variáveis de ambiente padrão
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.NODE_ENV = 'test';
