export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Topic {
  id: string;
  content: string;
  style?: string;
  targetDuration: number;
  createdAt: string;
}

export interface Script {
  id: string;
  topicId: string;
  topic?: Topic;
  title: string;
  description?: string;
  scenes: any[];
  captions: any[];
  createdAt: string;
}

export interface VideoJob {
  id: string;
  scriptId: string;
  script?: Script;
  status: JobStatus;
  progress: number;
  outputUrl?: string | null;
  thumbnailUrl?: string | null;
  error?: string | null;
  processingTime?: number | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobStats {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  pending: number;
}
