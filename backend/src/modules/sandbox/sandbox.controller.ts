import { Controller, Post, Body, Get, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SandboxService } from './sandbox.service';

class ExecuteCodeDto {
  code: string;
  language: 'javascript' | 'typescript' | 'python';
  timeout?: number;
  memoryLimit?: string;
  networkAccess?: boolean;
}

@ApiTags('sandbox')
@Controller('sandbox')
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @Post('execute')
  @ApiOperation({ summary: 'Execute code in sandboxed environment' })
  async executeCode(@Body() dto: ExecuteCodeDto) {
    return this.sandboxService.executeCode(dto.code, dto.language, {
      timeout: dto.timeout,
      memoryLimit: dto.memoryLimit,
      networkAccess: dto.networkAccess,
    });
  }

  @Get('list')
  @ApiOperation({ summary: 'List all running sandbox containers' })
  async listSandboxes() {
    return this.sandboxService.listSandboxes();
  }

  @Delete('kill-all')
  @ApiOperation({ summary: 'Kill all sandbox containers' })
  async killAll() {
    await this.sandboxService.killAllSandboxes();
    return { message: 'All sandbox containers killed' };
  }
}
