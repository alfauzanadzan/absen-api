// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS supaya Nuxt (http://localhost:3001) bisa akses API
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // 🔹 Seed super admin
  const authService = app.get(AuthService);
  await authService.seedSuperAdmin();

  await app.listen(3000);
  console.log(`✅ Backend running at http://localhost:3000`);
}
bootstrap();
