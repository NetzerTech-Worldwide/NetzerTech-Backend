import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

let cachedApp: any;

async function bootstrap() {
    if (!cachedApp) {
        const app = await NestFactory.create(AppModule);

        app.setGlobalPrefix('api/v1');

        const corsOriginsEnv = process.env.CORS_ORIGINS;
        const allowAllOrigins = corsOriginsEnv === '*' || !corsOriginsEnv;
        const allowedOrigins = corsOriginsEnv && corsOriginsEnv !== '*'
            ? corsOriginsEnv.split(',').map((origin) => origin.trim())
            : process.env.NODE_ENV === 'production'
                ? []
                : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:4200'];

        app.enableCors({
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                if (allowAllOrigins) return callback(null, true);
                if (allowedOrigins.includes(origin)) return callback(null, true);
                callback(new Error('Not allowed by CORS'));
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                transformOptions: { enableImplicitConversion: true },
            }),
        );

        app.useGlobalInterceptors(new LoggingInterceptor());

        const config = new DocumentBuilder()
            .setTitle('NetzerTech EdTech Platform API')
            .setDescription('Secure authentication and user management system for edtech platform')
            .setVersion('1.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter JWT token' }, 'JWT-auth')
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
            customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
            customJs: [
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
            ],
            customSiteTitle: 'NetzerTech API Docs',
        });

        await app.init();
        cachedApp = app.getHttpAdapter().getInstance();
    }
    return cachedApp;
}

export default async function handler(req: any, res: any) {
    const expressApp = await bootstrap();
    return expressApp(req, res);
}
