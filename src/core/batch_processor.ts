import { BatchJob, BatchItem } from '../types';

export class BatchProcessor {
  private jobs: Map<string, BatchJob> = new Map();

  createJob(name: string, files: Array<{ fileName: string; fileSize: number }>): BatchJob {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const items: BatchItem[] = files.map((f, idx) => ({
      id: `${id}_item_${idx + 1}`,
      fileName: f.fileName,
      fileSize: f.fileSize,
      status: 'QUEUED',
      pageCount: 1,
    }));

    const job: BatchJob = {
      id,
      name,
      createdAt: Date.now(),
      items,
      progressPercent: 0,
    };

    this.jobs.set(id, job);
    return job;
  }

  getJob(jobId: string): BatchJob | undefined {
    return this.jobs.get(jobId);
  }

  listJobs(): BatchJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async processJob(
    jobId: string,
    itemProcessor: (item: BatchItem) => Promise<{ documentId: string; pageCount: number }>
  ): Promise<BatchJob> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    let completedCount = 0;

    for (const item of job.items) {
      item.status = 'PROCESSING';
      try {
        const result = await itemProcessor(item);
        item.status = 'COMPLETED';
        item.documentId = result.documentId;
        item.pageCount = result.pageCount;
      } catch (err: any) {
        item.status = 'FAILED';
        item.error = err.message || 'Processing failed';
      }
      completedCount++;
      job.progressPercent = Math.round((completedCount / job.items.length) * 100);
    }

    return job;
  }

  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    for (const item of job.items) {
      if (item.status === 'QUEUED') {
        item.status = 'FAILED';
        item.error = 'Cancelled by user';
      }
    }
    return true;
  }

  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }
}
