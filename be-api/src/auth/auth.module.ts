import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'; // ✅ wajib ada
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy'; // ✅ import strategy

@Module({
  imports: [
    PassportModule, // ✅ aktifin passport
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'rahasiaSuperAmanBanget',
      signOptions: { expiresIn: '1d' }, // token berlaku 1 hari
    }),
  ],
  providers: [AuthService, PrismaService, JwtStrategy], // ✅ tambahin JwtStrategy
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
