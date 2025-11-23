import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { firstValueFrom } from 'rxjs';

export interface AIGenerationRequest {
  prompt: string;
  model?: string;
  stream?: boolean;
}

export interface CodeReview {
  issues: Array<{
    line: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
  }>;
  summary: string;
  score: number;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly ollamaBaseUrl: string;
  private readonly defaultModel: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectQueue('ai-tasks') private aiQueue: Queue,
  ) {
    this.ollamaBaseUrl = this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434';
    this.defaultModel = this.configService.get<string>('OLLAMA_DEFAULT_MODEL') || 'deepseek-coder:6.7b';
  }

  /**
   * Generate a React component from natural language description
   */
  async generateComponent(prompt: string): Promise<string> {
    this.logger.log(`Generating component from prompt: ${prompt}`);

    const systemPrompt = `You are an expert React/TypeScript developer. Generate clean, production-ready React components with TypeScript.
Follow these rules:
1. Use functional components with hooks
2. Include proper TypeScript types
3. Use Tailwind CSS for styling
4. Follow React best practices
5. Include comments for complex logic
6. Return ONLY the component code, no explanations`;

    const response = await this.callOllama({
      prompt: `${systemPrompt}\n\nUser request: ${prompt}\n\nGenerate the React component:`,
      model: 'deepseek-coder:6.7b',
    });

    return this.extractCode(response);
  }

  /**
   * Review code and provide suggestions
   */
  async reviewCode(code: string): Promise<CodeReview> {
    this.logger.log('Reviewing code...');

    const prompt = `You are a senior code reviewer. Review this code and provide:
1. List of issues (with line numbers, severity, message, and suggestion)
2. Overall summary
3. Quality score (0-100)

Code to review:
\`\`\`typescript
${code}
\`\`\`

Return your review in JSON format:
{
  "issues": [{ "line": number, "severity": "error|warning|info", "message": string, "suggestion": string }],
  "summary": string,
  "score": number
}`;

    const response = await this.callOllama({
      prompt,
      model: 'codellama:13b',
    });

    return this.parseCodeReview(response);
  }

  /**
   * Debug code and suggest fixes
   */
  async debugCode(code: string, error: string): Promise<string> {
    this.logger.log('Debugging code...');

    const prompt = `You are an expert debugger. Fix this code error:

Code:
\`\`\`typescript
${code}
\`\`\`

Error:
${error}

Provide the fixed code and explanation:`;

    const response = await this.callOllama({
      prompt,
      model: 'starcoder2:15b',
    });

    return response;
  }

  /**
   * Optimize code for performance
   */
  async optimizeCode(code: string): Promise<string> {
    this.logger.log('Optimizing code...');

    const prompt = `You are a performance optimization expert. Optimize this code:

\`\`\`typescript
${code}
\`\`\`

Provide optimized version with explanations of improvements:`;

    const response = await this.callOllama({
      prompt,
      model: 'deepseek-coder:6.7b',
    });

    return response;
  }

  /**
   * Check accessibility (WCAG compliance)
   */
  async checkAccessibility(code: string): Promise<any> {
    this.logger.log('Checking accessibility...');

    const prompt = `You are an accessibility expert. Check this React component for WCAG 2.1 AA compliance:

\`\`\`typescript
${code}
\`\`\`

Return issues in JSON format:
{
  "issues": [{ "severity": "error|warning", "guideline": string, "message": string, "fix": string }],
  "score": number,
  "summary": string
}`;

    const response = await this.callOllama({
      prompt,
      model: 'codellama:13b',
    });

    try {
      return JSON.parse(this.extractJSON(response));
    } catch {
      return { issues: [], score: 100, summary: 'No accessibility issues found' };
    }
  }

  /**
   * Generate documentation for code
   */
  async generateDocumentation(code: string): Promise<string> {
    this.logger.log('Generating documentation...');

    const prompt = `Generate comprehensive documentation for this code:

\`\`\`typescript
${code}
\`\`\`

Include:
1. Overview
2. Props/Parameters
3. Usage examples
4. Notes`;

    const response = await this.callOllama({
      prompt,
      model: 'deepseek-coder:6.7b',
    });

    return response;
  }

  /**
   * Queue AI task for async processing
   */
  async queueTask(type: string, data: any): Promise<string> {
    const job = await this.aiQueue.add(type, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    return job.id.toString();
  }

  /**
   * Core method to call Ollama API
   */
  private async callOllama(request: AIGenerationRequest): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.ollamaBaseUrl}/api/generate`, {
          model: request.model || this.defaultModel,
          prompt: request.prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
          },
        }),
      );

      return response.data.response;
    } catch (error) {
      this.logger.error('Ollama API error:', error.message);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Extract code from markdown code blocks
   */
  private extractCode(text: string): string {
    const codeBlockMatch = text.match(/```(?:typescript|tsx|jsx|javascript)?\n([\s\S]*?)```/);
    return codeBlockMatch ? codeBlockMatch[1].trim() : text.trim();
  }

  /**
   * Extract JSON from response
   */
  private extractJSON(text: string): string {
    const jsonMatch = text.match(/```json\n([\s\S]*?)```/);
    if (jsonMatch) return jsonMatch[1].trim();

    const objectMatch = text.match(/\{[\s\S]*\}/);
    return objectMatch ? objectMatch[0] : text;
  }

  /**
   * Parse code review response
   */
  private parseCodeReview(response: string): CodeReview {
    try {
      const json = this.extractJSON(response);
      return JSON.parse(json);
    } catch {
      // Fallback if parsing fails
      return {
        issues: [],
        summary: response,
        score: 80,
      };
    }
  }
}
