import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { OllamaService } from './ollama.service';

@Processor('ai-tasks')
export class AITasksProcessor {
  private readonly logger = new Logger(AITasksProcessor.name);

  constructor(private ollamaService: OllamaService) {}

  @Process('generate-component')
  async handleGenerateComponent(job: Job) {
    this.logger.log(`Processing component generation job ${job.id}`);

    const { prompt } = job.data;

    await job.progress(10);

    const code = await this.ollamaService.generateComponent(prompt);
    await job.progress(50);

    // Validate generated code
    await job.progress(80);

    await job.progress(100);

    return { code };
  }

  @Process('review-code')
  async handleReviewCode(job: Job) {
    this.logger.log(`Processing code review job ${job.id}`);

    const { code } = job.data;

    await job.progress(10);

    const review = await this.ollamaService.reviewCode(code);
    await job.progress(100);

    return review;
  }

  @Process('optimize-code')
  async handleOptimizeCode(job: Job) {
    this.logger.log(`Processing code optimization job ${job.id}`);

    const { code } = job.data;

    await job.progress(10);

    const optimized = await this.ollamaService.optimizeCode(code);
    await job.progress(100);

    return { optimized };
  }
}
