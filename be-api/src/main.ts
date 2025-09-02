import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 Reset / seed superadmin tiap kali start
  const authService = app.get(AuthService);
  await authService.seedSuperAdmin();

  await app.listen(3000);
}
bootstrap();
