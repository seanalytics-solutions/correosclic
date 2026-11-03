import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true -- necesario para verificar la firma HMAC del webhook de
  // Stripe (POST /payments/webhooks/stripe), que requiere los bytes crudos
  // del body. No excluye esa ruta del parser JSON global: Nest captura el
  // buffer crudo en request.rawBody ADEMÁS de parsear el body normalmente
  // para todas las demás rutas.
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.setGlobalPrefix('api');

  // Lista blanca fija de orígenes: cualquier otro dominio recibe la respuesta
  // sin la cabecera Access-Control-Allow-Origin y el navegador bloquea la
  // llamada. Sin credentials porque el JWT viaja en Authorization, no en cookie.
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite dev
      'http://localhost:4173', // Vite preview
      'https://correosclic-frontend-web.vercel.app', // producción
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  console.log(`🚀 CorreosClic API running on port ${port}`);
}

bootstrap();