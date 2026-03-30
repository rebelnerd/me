import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { environment } from '../../../../envs/environment';

@Injectable()
export class XsrfGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method?.toUpperCase();

    // Only check XSRF for state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const xsrfToken = request.headers['x-xsrf-token'];
    if (!xsrfToken) {
      throw new ForbiddenException('Missing XSRF token');
    }

    try {
      this.jwtService.verify(xsrfToken, { secret: environment.jwt.xsrfSecret });
      return true;
    } catch {
      throw new ForbiddenException('Invalid XSRF token');
    }
  }
}
