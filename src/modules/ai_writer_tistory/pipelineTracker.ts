export type WriterAgentKey =
  | "agent_1_main_writer"
  | "agent_2_review_writer"
  | "agent_3_image_generator"
  | "agent_4_final_writer"
  | "unknown";

export interface WriterPipelineEvent {
  runId: string;
  moduleId: "AI_Writer_TISTORY";
  agentKey: WriterAgentKey;
  agentName: string;
  status: string;
  input?: unknown;
  output?: unknown;
  raw: Record<string, unknown>;
  receivedAt: string;
}

export interface WriterPipelineRun {
  runId: string;
  moduleId: "AI_Writer_TISTORY";
  startedAt: string;
  updatedAt: string;
  latestStatus: string;
  latestAgentKey: WriterAgentKey;
  latestAgentName: string;
  eventCount: number;
  events: WriterPipelineEvent[];
}

export interface WriterPipelineRunSummary {
  runId: string;
  moduleId: "AI_Writer_TISTORY";
  startedAt: string;
  updatedAt: string;
  latestStatus: string;
  latestAgentKey: WriterAgentKey;
  latestAgentName: string;
  eventCount: number;
}

const cloneEvent = (event: WriterPipelineEvent): WriterPipelineEvent => ({
  ...event,
  raw: { ...event.raw },
});

const toRunSummary = (run: WriterPipelineRun): WriterPipelineRunSummary => ({
  runId: run.runId,
  moduleId: run.moduleId,
  startedAt: run.startedAt,
  updatedAt: run.updatedAt,
  latestStatus: run.latestStatus,
  latestAgentKey: run.latestAgentKey,
  latestAgentName: run.latestAgentName,
  eventCount: run.eventCount,
});

export class AiWriterPipelineTracker {
  private readonly runs = new Map<string, WriterPipelineRun>();

  public appendEvent(event: WriterPipelineEvent): WriterPipelineRunSummary {
    const existingRun = this.runs.get(event.runId);

    if (!existingRun) {
      this.runs.set(event.runId, {
        runId: event.runId,
        moduleId: "AI_Writer_TISTORY",
        startedAt: event.receivedAt,
        updatedAt: event.receivedAt,
        latestStatus: event.status,
        latestAgentKey: event.agentKey,
        latestAgentName: event.agentName,
        eventCount: 1,
        events: [cloneEvent(event)],
      });

      return toRunSummary(this.runs.get(event.runId)!);
    }

    existingRun.updatedAt = event.receivedAt;
    existingRun.latestStatus = event.status;
    existingRun.latestAgentKey = event.agentKey;
    existingRun.latestAgentName = event.agentName;
    existingRun.eventCount += 1;
    existingRun.events.push(cloneEvent(event));

    return toRunSummary(existingRun);
  }

  public getRun(runId: string): WriterPipelineRun | undefined {
    const run = this.runs.get(runId);
    if (!run) {
      return undefined;
    }

    return {
      ...run,
      events: run.events.map((event) => cloneEvent(event)),
    };
  }

  public listRuns(limit = 30): WriterPipelineRunSummary[] {
    return Array.from(this.runs.values())
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, Math.max(limit, 1))
      .map((run) => toRunSummary(run));
  }
}

export const aiWriterPipelineTracker = new AiWriterPipelineTracker();
