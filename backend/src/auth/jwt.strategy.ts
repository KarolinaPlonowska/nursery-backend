import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Najpierw spróbuj czytać z cookies
        (req: any) => {
          if (req && req.cookies) {
            return req.cookies.access_token;
          }
          return null;
        },
        // Następnie z Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'development_secret_key_change_in_production',
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      groupId: payload.groupId,
    };
  }
}
