import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { environment } from '../../../envs/environment';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async verifyJwt(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: environment.jwt.secret,
    });
  }

  createToken(userId: number, email: string, rememberMe = false) {
    const accessExpiry = rememberMe
      ? environment.jwt.longAccessExpiry
      : environment.jwt.accessExpiry;
    const refreshExpiry = rememberMe
      ? environment.jwt.longRefreshExpiry
      : environment.jwt.refreshExpiry;

    const payload = { sub: userId, email };

    const accessOpts = { secret: environment.jwt.secret, expiresIn: accessExpiry } as JwtSignOptions;
    const refreshOpts = { secret: environment.jwt.refreshSecret, expiresIn: refreshExpiry } as JwtSignOptions;
    const xsrfOpts = { secret: environment.jwt.xsrfSecret, expiresIn: accessExpiry } as JwtSignOptions;

    const accessToken = this.jwtService.sign(payload, accessOpts);
    const refreshToken = this.jwtService.sign(payload, refreshOpts);
    const xsrfToken = this.jwtService.sign({ sub: userId }, xsrfOpts);

    return { accessToken, refreshToken, xsrfToken };
  }

  async refreshTokens(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: environment.jwt.refreshSecret,
    });
    return this.createToken(payload.sub, payload.email);
  }
}
