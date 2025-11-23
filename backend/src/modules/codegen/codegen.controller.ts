import { Controller, Post, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CodegenService } from './codegen.service';

@ApiTags('codegen')
@Controller('codegen')
export class CodegenController {
  constructor(private readonly codegenService: CodegenService) {}

  @Post('generate/:projectId')
  @ApiOperation({ summary: 'Generate code for a project' })
  async generateProject(@Param('projectId') projectId: string) {
    // TODO: Get userId from JWT
    const userId = 'temp-user-id';
    return this.codegenService.generateProject(projectId, userId);
  }
}
