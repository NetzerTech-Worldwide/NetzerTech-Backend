import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  // Configure CORS based on environment
  const corsOriginsEnv = process.env.CORS_ORIGINS;
  const allowAllOrigins = corsOriginsEnv === '*' || !corsOriginsEnv;

  const allowedOrigins = corsOriginsEnv && corsOriginsEnv !== '*'
    ? corsOriginsEnv.split(',').map((origin) => origin.trim())
    : process.env.NODE_ENV === 'production'
      ? [] // In production, will allow all if CORS_ORIGINS not set
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:4200'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // If CORS_ORIGINS is set to "*" or not set, allow all origins
      if (allowAllOrigins) {
        if (process.env.NODE_ENV === 'production') {
          const logger = new Logger('CORS');
          logger.warn(`CORS allowing all origins (CORS_ORIGINS=${corsOriginsEnv || 'not set'}). This is not recommended for production.`);
        }
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const logger = new Logger('CORS');
        logger.error(`CORS blocked origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Set global logger
  const logger = new Logger('Bootstrap');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NetzerTech EdTech Platform API')
    .setDescription('Secure authentication and user management system for edtech platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
    customJsStr: `
      window.addEventListener('load', function() {
        // Intercept fetch to automatically set Bearer token when logging in via Swagger
        const originalFetch = window.fetch;
        window.fetch = async function() {
          const response = await originalFetch.apply(this, arguments);
          const url = typeof arguments[0] === 'string' ? arguments[0] : (arguments[0]?.url || '');
          
          if (url.includes('/login') && response.ok) {
            const clone = response.clone();
            clone.json().then((data) => {
              if (data && data.access_token) {
                // Wait briefly for Swagger UI to finish rendering
                setTimeout(() => {
                  if (window.ui && window.ui.authActions) {
                    window.ui.authActions.authorize({
                      'JWT-auth': {
                        name: 'JWT-auth',
                        schema: { type: 'http', in: 'header', name: 'Authorization', description: '' },
                        value: data.access_token
                      }
                    });
                    console.log('✅ Swagger UI auto-populated with access token!');
                  }
                }, 500);
              }
            }).catch(() => {}); // ignore parse errors
          }
          return response;
        };
      });
    `,
    customSiteTitle: 'NetzerTech API Docs',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`Swagger documentation: http://localhost:${port}/api-docs`);
}
bootstrap();
