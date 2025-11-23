import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DeploymentService, DeploymentConfig, DeploymentResult } from './deployment.service';

@Controller('deployment')
@UseGuards(JwtAuthGuard)
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Post('vercel')
  @HttpCode(HttpStatus.CREATED)
  async deployToVercel(
    @Body() body: { config: DeploymentConfig; projectData: any },
    @CurrentUser() user: any,
  ): Promise<DeploymentResult> {
    const files = this.deploymentService.generateDeploymentFiles(body.projectData);
    return this.deploymentService.deployToVercel(body.config, files);
  }

  @Post('railway')
  @HttpCode(HttpStatus.CREATED)
  async deployToRailway(
    @Body() body: { config: DeploymentConfig; repositoryUrl: string },
    @CurrentUser() user: any,
  ): Promise<DeploymentResult> {
    return this.deploymentService.deployToRailway(body.config, body.repositoryUrl);
  }

  @Get('status/:platform/:deploymentId')
  async getDeploymentStatus(
    @Param('platform') platform: 'vercel' | 'railway',
    @Param('deploymentId') deploymentId: string,
    @CurrentUser() user: any,
  ): Promise<DeploymentResult> {
    return this.deploymentService.getDeploymentStatus(platform, deploymentId);
  }
}
