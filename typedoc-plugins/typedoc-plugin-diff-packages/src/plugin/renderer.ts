/**
 * Contains functionality to decouple HTML logic from the TypeDoc [Renderer](https://typedoc.org/api/classes/Renderer.html).
 * @module
 */

import * as fs from 'fs';
import * as path from 'path';
import { ProjectReflection } from 'typedoc';
import { generateReport } from './generate-report';

const FILE_NAME = 'diff-report.md';

/**
 * Replacement of TypeDoc's [Application.generateDocs](https://typedoc.org/api/classes/Application.html#generateDocs) to decouple HTML logic.
 *
 */
export async function generateDocs(project: ProjectReflection, out: string) {
  const start = Date.now();

  await this.renderer.render(project, out);

  if (this.logger.hasErrors()) {
    this.logger.error('Documentation could not be generated due to the errors above.');
  } else {
    this.logger.info(`Documentation generated at ${out}`);

    this.logger.info(`Comparing packages took ${Date.now() - start}ms`);
  }
}

/**
 * Replacement of TypeDoc's [Renderer.render](https://typedoc.org/api/classes/Renderer.html#render) to decouple HTML logic.
 */
export async function render(project: ProjectReflection, outputDirectory: string): Promise<void> {
  this.renderStartTime = Date.now();

  if (this.cleanOutputDir) {
    try {
      fs.rmSync(outputDirectory, { recursive: true, force: true });
    } catch (error) {
      this.application.logger.warn('Could not empty the output directory.');
      return;
    }
  }

  try {
    fs.mkdirSync(outputDirectory, { recursive: true });
  } catch (error) {
    this.application.logger.error(`Could not create output directory ${outputDirectory}.`);
    return;
  }

  try {
    writeFileSync(`${outputDirectory}/${FILE_NAME}`, generateReport(project));
  } catch (error) {
    this.application.logger.error(`Could not write ${FILE_NAME}`, error);
  }
}

export function writeFileSync(fileName: string, data: string) {
  fs.mkdirSync(path.dirname(normalizePath(fileName)), { recursive: true });
  fs.writeFileSync(normalizePath(fileName), data);
}

export function normalizePath(path: string) {
  return path.replace(/\\/g, '/');
}
