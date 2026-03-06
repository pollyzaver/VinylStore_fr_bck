const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vinyl Store API',
      version: '1.0.0',
      description: 'API для магазина виниловых пластинок с AI-рекомендациями',
      contact: {
        name: 'Vinyl Store',
        email: 'info@vinylstore.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://your-backend.onrender.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Violator' },
            description: { type: 'string', example: 'Depeche Mode' },
            year: { type: 'integer', example: 1990 },
            genre: { type: 'string', example: 'Электроника' },
            format: { type: 'string', example: '12" LP' },
            price: { type: 'integer', example: 5290 },
            category: { type: 'string', example: 'electronic' },
            image: { type: 'string', example: '/assets/violator.jpg' },
            badge: { type: 'string', example: 'Хит' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'user_abc123' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'Иван Иванов' },
            testCompleted: { type: 'boolean', example: true },
            testDate: { type: 'string', format: 'date', example: '2026-02-22' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Ошибка сервера' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Products',
        description: 'Управление товарами'
      },
      {
        name: 'Auth',
        description: 'Авторизация и регистрация'
      },
      {
        name: 'Profile',
        description: 'Профиль пользователя и тесты'
      },
      {
        name: 'AI',
        description: 'AI-рекомендации'
      },
      {
        name: 'Favorites',
        description: 'Избранное'
      }
    ]
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;