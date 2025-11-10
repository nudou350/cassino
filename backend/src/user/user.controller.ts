import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return await this.userService.getProfile(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    // Filter allowed fields
    const allowedFields = ['username'];
    const filteredData = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    return await this.userService.updateProfile(req.user.id, filteredData);
  }

  @Put('responsible-gaming/limits')
  async setLimits(@Request() req, @Body() limits: any) {
    return await this.userService.setResponsibleGamingLimits(
      req.user.id,
      limits,
    );
  }

  @Put('self-exclusion')
  async setSelfExclusion(@Request() req, @Body() body: { until: string }) {
    const until = new Date(body.until);
    return await this.userService.setSelfExclusion(req.user.id, until);
  }
}
