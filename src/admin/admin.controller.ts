import { Controller, Post, Headers, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseSeeder } from '../database/seeder';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Post('seed')
  @ApiOperation({ summary: 'Trigger database seeding (requires secret key)' })
  @ApiHeader({ name: 'x-seed-secret', description: 'Secret key to authorize seeding' })
  async runSeed(@Headers('x-seed-secret') secret: string) {
    const expectedSecret = process.env.SEED_SECRET;

    if (!expectedSecret) {
      throw new InternalServerErrorException('SEED_SECRET environment variable is not configured');
    }

    if (!secret || secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid seed secret');
    }

    try {
      const seeder = new DatabaseSeeder(this.dataSource);
      await seeder.seed();
      return { message: 'Database seeded successfully' };
    } catch (error) {
      throw new InternalServerErrorException(`Seeding failed: ${error.message}`);
    }
  }
}
