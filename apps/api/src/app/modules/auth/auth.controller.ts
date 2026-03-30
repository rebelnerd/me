import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UnauthorizedException,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Public } from './decorators/public.decorator';
import { ILoginRequest, ISignupRequest } from '@app/interfaces';
import { environment } from '../../../envs/environment';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: ILoginRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.findByEmail(body.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new BadRequestException({ message: 'Password not set', code: 'PASSWORD_NOT_SET' });
    }

    if (!user.isActive) {
      throw new BadRequestException({ message: 'Account deactivated', code: 'ACCOUNT_DEACTIVATED' });
    }

    const isValid = await this.authService.comparePassword(body.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.authService.createToken(user.id, user.email, body.rememberMe);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: environment.production,
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    // Update last logged in
    await this.userService.update(user.id, {
      lastLoggedIn: new Date(),
      rememberMe: body.rememberMe ?? false,
    });

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      tokens: {
        accessToken: tokens.accessToken,
        xsrfToken: tokens.xsrfToken,
      },
    };
  }

  @Public()
  @Post('signup')
  async signup(
    @Body() body: ISignupRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const existing = await this.userService.findByEmail(body.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await this.authService.hashPassword(body.password);
    const user = await this.userService.create({
      ...body,
      password: hashedPassword,
    });

    const tokens = this.authService.createToken(user.id, user.email);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: environment.production,
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      tokens: {
        accessToken: tokens.accessToken,
        xsrfToken: tokens.xsrfToken,
      },
    };
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    try {
      const tokens = await this.authService.refreshTokens(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: environment.production,
        sameSite: 'strict',
        maxAge: 90 * 24 * 60 * 60 * 1000,
      });

      return {
        accessToken: tokens.accessToken,
        xsrfToken: tokens.xsrfToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  @Get('me')
  async me(@Req() req: any) {
    const user = await this.userService.findById(req.user.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
