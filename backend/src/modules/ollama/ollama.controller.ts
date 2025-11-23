import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OllamaService } from './ollama.service';

class GenerateComponentDto {
  prompt: string;
}

class ReviewCodeDto {
  code: string;
}

class DebugCodeDto {
  code: string;
  error: string;
}

@ApiTags('ai')
@Controller('ai')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Post('generate-component')
  @ApiOperation({ summary: 'Generate React component from natural language' })
  async generateComponent(@Body() dto: GenerateComponentDto) {
    const code = await this.ollamaService.generateComponent(dto.prompt);
    return { code };
  }

  @Post('review-code')
  @ApiOperation({ summary: 'Review code and provide suggestions' })
  async reviewCode(@Body() dto: ReviewCodeDto) {
    return this.ollamaService.reviewCode(dto.code);
  }

  @Post('debug-code')
  @ApiOperation({ summary: 'Debug code and suggest fixes' })
  async debugCode(@Body() dto: DebugCodeDto) {
    const fix = await this.ollamaService.debugCode(dto.code, dto.error);
    return { fix };
  }

  @Post('optimize-code')
  @ApiOperation({ summary: 'Optimize code for performance' })
  async optimizeCode(@Body() dto: ReviewCodeDto) {
    const optimized = await this.ollamaService.optimizeCode(dto.code);
    return { optimized };
  }

  @Post('check-accessibility')
  @ApiOperation({ summary: 'Check code for accessibility issues' })
  async checkAccessibility(@Body() dto: ReviewCodeDto) {
    return this.ollamaService.checkAccessibility(dto.code);
  }

  @Post('generate-docs')
  @ApiOperation({ summary: 'Generate documentation for code' })
  async generateDocs(@Body() dto: ReviewCodeDto) {
    const documentation = await this.ollamaService.generateDocumentation(dto.code);
    return { documentation };
  }
}
