import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Docker from 'dockerode';
import * as tar from 'tar-stream';
import { Readable } from 'stream';

export interface SandboxOptions {
  memoryLimit?: string;
  cpuLimit?: number;
  timeout?: number;
  networkAccess?: boolean;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
}

@Injectable()
export class SandboxService {
  private readonly logger = new Logger(SandboxService.name);
  private docker: Docker;
  private readonly defaultMemoryLimit: string;
  private readonly defaultCpuLimit: number;
  private readonly sandboxNetwork: string;

  constructor(private configService: ConfigService) {
    this.docker = new Docker({
      socketPath: configService.get<string>('DOCKER_HOST') || '/var/run/docker.sock',
    });

    this.defaultMemoryLimit =
      configService.get<string>('SANDBOX_MEMORY_LIMIT') || '512m';
    this.defaultCpuLimit =
      parseInt(configService.get<string>('SANDBOX_CPU_LIMIT') || '1') * 100000;
    this.sandboxNetwork =
      configService.get<string>('SANDBOX_NETWORK') || 'zerocode-sandbox';
  }

  /**
   * Execute code in a sandboxed Docker container
   */
  async executeCode(
    code: string,
    language: 'javascript' | 'typescript' | 'python',
    options: SandboxOptions = {},
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    this.logger.log(`Executing ${language} code in sandbox...`);

    try {
      // Create container
      const container = await this.createContainer(language, code, options);

      // Start container
      await container.start();

      // Wait for execution with timeout
      const timeout = options.timeout || 30000; // 30 seconds default
      const result = await Promise.race([
        this.waitForContainer(container),
        this.timeoutPromise(timeout, container),
      ]);

      // Get logs
      const logs = await this.getContainerLogs(container);

      // Cleanup
      await this.cleanupContainer(container);

      const executionTime = Date.now() - startTime;

      return {
        stdout: logs.stdout,
        stderr: logs.stderr,
        exitCode: result.StatusCode,
        executionTime,
      };
    } catch (error) {
      this.logger.error('Sandbox execution error:', error);
      throw error;
    }
  }

  /**
   * Create a sandboxed container
   */
  private async createContainer(
    language: string,
    code: string,
    options: SandboxOptions,
  ): Promise<Docker.Container> {
    const image = this.getImageForLanguage(language);
    const command = this.getCommandForLanguage(language);

    // Create tar archive with code
    const codeArchive = await this.createCodeArchive(code, language);

    // Container configuration
    const containerConfig: Docker.ContainerCreateOptions = {
      Image: image,
      Cmd: command,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      HostConfig: {
        Memory: this.parseMemoryLimit(options.memoryLimit || this.defaultMemoryLimit),
        MemorySwap: this.parseMemoryLimit(
          options.memoryLimit || this.defaultMemoryLimit,
        ),
        CpuQuota: options.cpuLimit
          ? options.cpuLimit * 100000
          : this.defaultCpuLimit,
        CpuPeriod: 100000,
        PidsLimit: 100,
        ReadonlyRootfs: true,
        Tmpfs: {
          '/tmp': 'rw,noexec,nosuid,size=100m',
          '/app': 'rw,noexec,nosuid,size=100m',
        },
        CapDrop: ['ALL'],
        CapAdd: options.networkAccess ? ['NET_BIND_SERVICE'] : [],
        SecurityOpt: ['no-new-privileges'],
        NetworkMode: options.networkAccess ? this.sandboxNetwork : 'none',
      },
      WorkingDir: '/app',
    };

    const container = await this.docker.createContainer(containerConfig);

    // Copy code to container
    await container.putArchive(codeArchive, { path: '/app' });

    return container;
  }

  /**
   * Create tar archive with code file
   */
  private async createCodeArchive(
    code: string,
    language: string,
  ): Promise<Readable> {
    const pack = tar.pack();
    const fileName = this.getFileNameForLanguage(language);

    pack.entry({ name: fileName }, code);
    pack.finalize();

    return pack as any;
  }

  /**
   * Wait for container to finish
   */
  private async waitForContainer(
    container: Docker.Container,
  ): Promise<{ StatusCode: number }> {
    return container.wait();
  }

  /**
   * Timeout promise
   */
  private async timeoutPromise(
    timeout: number,
    container: Docker.Container,
  ): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(async () => {
        await container.kill();
        reject(new Error(`Execution timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Get container logs
   */
  private async getContainerLogs(
    container: Docker.Container,
  ): Promise<{ stdout: string; stderr: string }> {
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      follow: false,
    });

    // Docker multiplexes stdout and stderr
    // First 8 bytes are header, rest is content
    let stdout = '';
    let stderr = '';

    const logsStr = logs.toString();
    const lines = logsStr.split('\n');

    for (const line of lines) {
      if (line.length === 0) continue;

      // Check stream type (stdout=1, stderr=2)
      const streamType = line.charCodeAt(0);

      if (streamType === 1) {
        stdout += line.slice(8) + '\n';
      } else if (streamType === 2) {
        stderr += line.slice(8) + '\n';
      }
    }

    return { stdout: stdout.trim(), stderr: stderr.trim() };
  }

  /**
   * Cleanup container
   */
  private async cleanupContainer(container: Docker.Container): Promise<void> {
    try {
      await container.remove({ force: true });
      this.logger.log('Container cleaned up successfully');
    } catch (error) {
      this.logger.error('Error cleaning up container:', error);
    }
  }

  /**
   * Get Docker image for language
   */
  private getImageForLanguage(language: string): string {
    const images: Record<string, string> = {
      javascript: 'node:20-alpine',
      typescript: 'node:20-alpine',
      python: 'python:3.11-alpine',
    };

    return images[language] || 'node:20-alpine';
  }

  /**
   * Get command for language
   */
  private getCommandForLanguage(language: string): string[] {
    const commands: Record<string, string[]> = {
      javascript: ['node', 'code.js'],
      typescript: ['sh', '-c', 'npx ts-node code.ts'],
      python: ['python', 'code.py'],
    };

    return commands[language] || ['node', 'code.js'];
  }

  /**
   * Get file name for language
   */
  private getFileNameForLanguage(language: string): string {
    const fileNames: Record<string, string> = {
      javascript: 'code.js',
      typescript: 'code.ts',
      python: 'code.py',
    };

    return fileNames[language] || 'code.js';
  }

  /**
   * Parse memory limit string to bytes
   */
  private parseMemoryLimit(limit: string): number {
    const units: Record<string, number> = {
      b: 1,
      k: 1024,
      m: 1024 * 1024,
      g: 1024 * 1024 * 1024,
    };

    const match = limit.match(/^(\d+)([bkmg])$/i);

    if (!match) {
      return 512 * 1024 * 1024; // Default 512MB
    }

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    return value * units[unit];
  }

  /**
   * Monitor container resources
   */
  async monitorContainer(containerId: string): Promise<any> {
    const container = this.docker.getContainer(containerId);
    const stats = await container.stats({ stream: false });

    const cpuUsage = this.calculateCPUUsage(stats);
    const memoryUsage = stats.memory_stats.usage;
    const memoryLimit = stats.memory_stats.limit;

    return {
      cpuUsage,
      memoryUsage,
      memoryLimit,
      memoryPercent: (memoryUsage / memoryLimit) * 100,
    };
  }

  /**
   * Calculate CPU usage percentage
   */
  private calculateCPUUsage(stats: any): number {
    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta =
      stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const numberCpus = stats.cpu_stats.online_cpus;

    return (cpuDelta / systemDelta) * numberCpus * 100;
  }

  /**
   * List all running sandbox containers
   */
  async listSandboxes(): Promise<any[]> {
    const containers = await this.docker.listContainers({
      all: true,
      filters: {
        label: ['app=zerocode-sandbox'],
      },
    });

    return containers.map((c) => ({
      id: c.Id,
      image: c.Image,
      status: c.Status,
      created: new Date(c.Created * 1000),
    }));
  }

  /**
   * Kill all sandbox containers
   */
  async killAllSandboxes(): Promise<void> {
    const containers = await this.listSandboxes();

    for (const container of containers) {
      try {
        const c = this.docker.getContainer(container.id);
        await c.kill();
        await c.remove();
        this.logger.log(`Killed sandbox container: ${container.id}`);
      } catch (error) {
        this.logger.error(`Error killing container ${container.id}:`, error);
      }
    }
  }
}
