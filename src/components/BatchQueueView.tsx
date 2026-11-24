import React, { useState } from 'react';
import { BatchJob } from '../types';
import { BatchProcessor } from '../core/batch_processor';

interface BatchQueueViewProps {
  batchProcessor: BatchProcessor;
  onJobCompleted?: (job: BatchJob) => void;
}

export const BatchQueueView: React.FC<BatchQueueViewProps> = ({ batchProcessor }) => {
  const [jobs, setJobs] = useState<BatchJob[]>(batchProcessor.listJobs());
  const [isCreating, setIsCreating] = useState(false);
  const [jobName, setJobName] = useState('');
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);

  const sampleBatchFiles = [
    { fileName: 'Lecture_01_Calculus_Limits.pdf', fileSize: 4200000 },
    { fileName: 'Lecture_02_Derivatives_ChainRule.pdf', fileSize: 5100000 },
    { fileName: 'Lab_Notebook_Electromagnetism.png', fileSize: 3800000 },
    { fileName: 'Historical_Manuscript_Archive_P4.jpg', fileSize: 6200000 },
    { fileName: 'Meeting_Minutes_Annual_AGM.pdf', fileSize: 2900000 },
  ];

  const handleCreateJob = async () => {
    if (!jobName.trim()) return;

    const filesToInclude = sampleBatchFiles.filter((f) =>
      selectedFileNames.includes(f.fileName)
    );

    if (filesToInclude.length === 0) return;

    const job = batchProcessor.createJob(jobName.trim(), filesToInclude);
    setJobs(batchProcessor.listJobs());
    setIsCreating(false);
    setJobName('');
    setSelectedFileNames([]);

    // Run batch simulation
    await batchProcessor.processJob(job.id, async (_item) => {
      await new Promise((r) => setTimeout(r, 800));
      return {
        documentId: `doc_batch_${Date.now()}`,
        pageCount: Math.floor(Math.random() * 3) + 1,
      };
    });

    setJobs(batchProcessor.listJobs());
  };

  const handleCancelJob = (jobId: string) => {
    batchProcessor.cancelJob(jobId);
    setJobs(batchProcessor.listJobs());
  };

  const handleDeleteJob = (jobId: string) => {
    batchProcessor.deleteJob(jobId);
    setJobs(batchProcessor.listJobs());
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Batch Processing Queue</h2>
          <p className="text-slate-400 text-sm">
            Execute high-throughput OCR and multi-format conversion on batches of scanned files.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          + New Batch Job
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-semibold text-slate-100 mb-4">Configure Batch Job</h3>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Job Name</label>
            <input
              type="text"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="e.g. Physics Semester Notes 2026"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Select Documents for Batch (Simulated Available Scans)
            </label>
            <div className="space-y-2">
              {sampleBatchFiles.map((file) => {
                const checked = selectedFileNames.includes(file.fileName);
                return (
                  <label
                    key={file.fileName}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      checked
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFileNames([...selectedFileNames, file.fileName]);
                          } else {
                            setSelectedFileNames(
                              selectedFileNames.filter((name) => name !== file.fileName)
                            );
                          }
                        }}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium">{file.fileName}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {(file.fileSize / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateJob}
              disabled={!jobName.trim() || selectedFileNames.length === 0}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
            >
              Queue & Start Batch ({selectedFileNames.length} items)
            </button>
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-slate-800/80 rounded-2xl">
          <div className="text-4xl mb-3">📁</div>
          <h3 className="text-base font-medium text-slate-300">No active batch jobs</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Create a batch job to ingest multiple high-resolution scans and digitize them in parallel.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-200 text-base">{job.name}</h4>
                  <p className="text-xs text-slate-400">
                    Created {new Date(job.createdAt).toLocaleTimeString()} • {job.items.length} items
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {job.progressPercent < 100 && (
                    <button
                      onClick={() => handleCancelJob(job.id)}
                      className="px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-amber-400"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-rose-400"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Batch Progress</span>
                  <span>{job.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${job.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {job.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/60"
                  >
                    <span className="truncate max-w-[200px] text-slate-300">{item.fileName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : item.status === 'PROCESSING'
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : item.status === 'FAILED'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
