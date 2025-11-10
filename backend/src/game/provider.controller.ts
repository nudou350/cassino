import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProviderService } from './services/provider.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Controller('api/providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get()
  async findAll() {
    const providers = await this.providerService.findAll();
    return {
      success: true,
      data: providers,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const provider = await this.providerService.findOne(id);
    return {
      success: true,
      data: provider,
    };
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    const stats = await this.providerService.getProviderStats(id);
    return {
      success: true,
      data: stats,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProviderDto: CreateProviderDto) {
    const provider = await this.providerService.create(createProviderDto);
    return {
      success: true,
      data: provider,
      message: 'Provider created successfully',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    const provider = await this.providerService.update(id, updateProviderDto);
    return {
      success: true,
      data: provider,
      message: 'Provider updated successfully',
    };
  }

  @Post(':id/sync-games')
  @UseGuards(JwtAuthGuard)
  async syncGames(@Param('id') id: string) {
    const syncedCount = await this.providerService.syncGames(id);
    return {
      success: true,
      message: `Successfully synced ${syncedCount} games`,
      data: { syncedCount },
    };
  }

  @Post(':id/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleActive(@Param('id') id: string) {
    const provider = await this.providerService.toggleActive(id);
    return {
      success: true,
      data: provider,
      message: `Provider ${provider.isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.providerService.remove(id);
    return {
      success: true,
      message: 'Provider deleted successfully',
    };
  }
}
