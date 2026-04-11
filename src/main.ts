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
      (function() {
        var STORAGE_KEY = 'netzer_swagger_jwt';

        // On page load, restore token into Swagger UI if available
        window.addEventListener('load', function() {
          var savedToken = localStorage.getItem(STORAGE_KEY);
          if (savedToken && window.ui) {
            try {
              window.ui.authActions.authorize({
                'JWT-auth': {
                  name: 'JWT-auth',
                  schema: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                  value: savedToken
                }
              });
              console.log('[NetzerAuth] Restored saved token into Swagger UI');
            } catch(e) { console.warn('[NetzerAuth] Could not restore token:', e); }
          }
        });

        // Patch fetch to capture login tokens AND inject auth header
        var origFetch = window.fetch;
        window.fetch = function(input, init) {
          var url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
          
          // Inject saved token into outgoing requests (if not a login request)
          if (url.indexOf('/login') === -1) {
            var token = localStorage.getItem(STORAGE_KEY);
            if (token) {
              init = init || {};
              init.headers = init.headers || {};
              // Only add if not already set
              if (!init.headers['Authorization'] && !init.headers['authorization']) {
                init.headers['Authorization'] = 'Bearer ' + token;
                console.log('[NetzerAuth] Injected Bearer token into request:', url);
              }
            }
          }

          return origFetch.call(this, input, init).then(function(response) {
            // Capture token from login responses
            if (url.indexOf('/login') !== -1 && response.ok) {
              response.clone().json().then(function(data) {
                var accessToken = data && (data.accessToken || data.access_token);
                if (accessToken) {
                  localStorage.setItem(STORAGE_KEY, accessToken);
                  console.log('[NetzerAuth] Token captured and saved from login response');
                  
                  // Also set in Swagger UI authorize dialog
                  if (window.ui && window.ui.authActions) {
                    try {
                      window.ui.authActions.authorize({
                        'JWT-auth': {
                          name: 'JWT-auth',
                          schema: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                          value: accessToken
                        }
                      });
                      console.log('[NetzerAuth] Token set in Swagger UI authorize');
                    } catch(e) {}
                  }
                }
              }).catch(function(e) { console.warn('[NetzerAuth] Parse error:', e); });
            }
            return response;
          });
        };

        console.log('[NetzerAuth] Swagger auto-auth interceptor installed');
      })();
    `,
    customSiteTitle: 'NetzerTech API Docs',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`Swagger documentation: http://localhost:${port}/api-docs`);
}
bootstrap();
