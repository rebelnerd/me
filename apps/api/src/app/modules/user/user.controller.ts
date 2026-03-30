import { Controller, Get, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@app/interfaces';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@CurrentUser('id') userId: number) {
    const user = await this.userService.findById(userId);
    const { password, ...result } = user;
    return result;
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser('id') userId: number,
    @Body() body: { firstName?: string; lastName?: string },
  ) {
    const user = await this.userService.update(userId, body);
    const { password, ...result } = user;
    return result;
  }

  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    const { password, ...result } = user;
    return result;
  }
}
