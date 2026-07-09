export interface CommandHandler {
  name: string;
  description: string;
  voiceTriggers: string[];
  execute: (context: any) => Promise<string>;
}

export interface QueueStatus {
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  failedTasks: number;
}