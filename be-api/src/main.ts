// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS supaya Nuxt (http://localhost:3001) bisa akses API
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Aktifin validasi global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Optional: seed superadmin cuma di development
  try {
    const env = process.env.NODE_ENV || 'development';
    if (env !== 'production') {
      const authService = app.get(AuthService);
      await authService.seedSuperAdmin();
      console.log('🔹 Seeded superadmin (dev mode)');
    } else {
      console.log('🔹 Skipping seedSuperAdmin in production');
    }
  } catch (err) {
    console.error('Seed superadmin error:', err);
  }

  await app.listen(3000);
  console.log('🚀 Backend running on: http://localhost:3000');
  console.log('🔑 Login endpoint (frontend): http://localhost:3001/login (POST)');
}

bootstrap();
