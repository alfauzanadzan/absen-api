import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS biar Nuxt (http://localhost:3001) bisa call API (http://localhost:3000)
  app.enableCors({
    origin: 'http://localhost:3001', // FE Nuxt
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // 🔹 Reset / seed superadmin tiap kali start
  const authService = app.get(AuthService);
  await authService.seedSuperAdmin();

  await app.listen(3000);
}
bootstrap();
