import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ ambil token dari header Authorization
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'mysecret', // fallback secret kalau ga ada di env
    });
  }

  // ✅ payload ini yang dilempar ke req.user
  async validate(payload: any) {
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
