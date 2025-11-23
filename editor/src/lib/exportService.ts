import { Component } from '../types';
import { CodeGenerator } from './codeGenerator';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export class ExportService {
  /**
   * Export project as a downloadable ZIP file
   */
  static async exportAsZip(
    components: Component[],
    projectName: string = 'my-app'
  ): Promise<void> {
    const zip = new JSZip();

    // Generate all project files
    const files = CodeGenerator.generateProjectFiles(components, projectName);

    // Add each file to the ZIP
    for (const [filePath, content] of Object.entries(files)) {
      zip.file(filePath, content);
    }

    // Generate and download the ZIP file
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${projectName}.zip`);
  }

  /**
   * Export as individual files (for development/debugging)
   */
  static exportAsFiles(components: Component[]): Record<string, string> {
    return CodeGenerator.generateProjectFiles(components);
  }

  /**
   * Export single component as React code
   */
  static exportComponentCode(components: Component[]): string {
    return CodeGenerator.generateReactComponent(components);
  }

  /**
   * Copy code to clipboard
   */
  static async copyToClipboard(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      throw new Error('Failed to copy to clipboard');
    }
  }

  /**
   * Download a single file
   */
  static downloadFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    saveAs(blob, filename);
  }
}
