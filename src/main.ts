import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  // Configure CORS based on environment
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With,Origin',
    optionsSuccessStatus: 204,
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
      // Capture the access token from login responses and store it
      responseInterceptor: function (response: any) {
        if (response.url && response.url.indexOf('/login') !== -1 && response.status === 200) {
          try {
            var body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
            var token = body && (body.accessToken || body.access_token);
            if (token) {
              (window as any).__netzer_token = token;
              console.log('[NetzerAuth] Token captured from login response');
            }
          } catch (e) { }
        }
        return response;
      },
      // Inject the stored token into all outgoing requests
      requestInterceptor: function (req: any) {
        var token = (window as any).__netzer_token;
        if (token && req.url && req.url.indexOf('/login') === -1) {
          req.headers['Authorization'] = 'Bearer ' + token;
          console.log('[NetzerAuth] Injected Bearer token into:', req.url);
        }
        return req;
      },
    },
    // Vercel serverless can't serve static files from node_modules, so load from CDN
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
    customSiteTitle: 'NetzerTech API Docs',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`Swagger documentation: http://localhost:${port}/api-docs`);
}
bootstrap();
