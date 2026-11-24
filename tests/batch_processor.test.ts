import { describe, it, expect } from 'vitest';
import { BatchProcessor } from '../src/core/batch_processor';

describe('BatchProcessor', () => {
  it('creates a new batch job with queued items', () => {
    const processor = new BatchProcessor();
    const files = [
      { fileName: 'scan_01.png', fileSize: 1024000 },
      { fileName: 'scan_02.png', fileSize: 2048000 },
    ];

    const job = processor.createJob('Test Batch', files);
    expect(job.id).toMatch(/^job_/);
    expect(job.name).toBe('Test Batch');
    expect(job.items.length).toBe(2);
    expect(job.items[0].status).toBe('QUEUED');
    expect(job.progressPercent).toBe(0);
  });

  it('processes items sequentially and updates progress percentage', async () => {
    const processor = new BatchProcessor();
    const files = [
      { fileName: 'page1.png', fileSize: 100 },
      { fileName: 'page2.png', fileSize: 100 },
    ];

    const job = processor.createJob('Sequential Test', files);

    const completedJob = await processor.processJob(job.id, async (item) => {
      return { documentId: `doc_${item.fileName}`, pageCount: 1 };
    });

    expect(completedJob.progressPercent).toBe(100);
    expect(completedJob.items[0].status).toBe('COMPLETED');
    expect(completedJob.items[0].documentId).toBe('doc_page1.png');
    expect(completedJob.items[1].status).toBe('COMPLETED');
  });

  it('handles item errors gracefully without crashing the whole batch', async () => {
    const processor = new BatchProcessor();
    const files = [
      { fileName: 'good.png', fileSize: 100 },
      { fileName: 'corrupted.png', fileSize: 100 },
    ];

    const job = processor.createJob('Resilience Test', files);

    const result = await processor.processJob(job.id, async (item) => {
      if (item.fileName === 'corrupted.png') {
        throw new Error('Unreadable image format');
      }
      return { documentId: 'doc_good', pageCount: 1 };
    });

    expect(result.items[0].status).toBe('COMPLETED');
    expect(result.items[1].status).toBe('FAILED');
    expect(result.items[1].error).toBe('Unreadable image format');
    expect(result.progressPercent).toBe(100);
  });

  it('cancels queued items when cancelled by user', () => {
    const processor = new BatchProcessor();
    const files = [{ fileName: 'pending.png', fileSize: 100 }];
    const job = processor.createJob('Cancel Test', files);

    const cancelled = processor.cancelJob(job.id);
    expect(cancelled).toBe(true);

    const fetched = processor.getJob(job.id);
    expect(fetched?.items[0].status).toBe('FAILED');
    expect(fetched?.items[0].error).toContain('Cancelled by user');
  });
});
