import {
  ManagedAssistantModule,
  ModuleConfigState,
  ModuleHistoryPayload,
  ModuleHistoryRecord,
  ModuleMonitoringStatus,
  ModuleStatusPatch,
} from "../../types/module";

interface InMemoryAssistantModuleOptions {
  moduleId: string;
  moduleName: string;
  initialConfig?: Record<string, unknown>;
  initialStatus?: Partial<Omit<ModuleMonitoringStatus, "moduleId" | "moduleName" | "updatedAt">>;
}

const createHistoryId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${timestamp}_${random}`;
};

export class InMemoryAssistantModule implements ManagedAssistantModule {
  public readonly moduleId: string;
  public readonly moduleName: string;

  private status: ModuleMonitoringStatus;
  private config: ModuleConfigState;
  private history: ModuleHistoryRecord[] = [];

  constructor(options: InMemoryAssistantModuleOptions) {
    const now = new Date().toISOString();

    this.moduleId = options.moduleId;
    this.moduleName = options.moduleName;

    this.status = {
      moduleId: options.moduleId,
      moduleName: options.moduleName,
      healthy: options.initialStatus?.healthy ?? true,
      stage: options.initialStatus?.stage ?? "idle",
      message: options.initialStatus?.message ?? "초기화 완료",
      updatedAt: now,
    };

    this.config = {
      moduleId: options.moduleId,
      moduleName: options.moduleName,
      values: {
        enabled: true,
        ...(options.initialConfig ?? {}),
      },
      updatedAt: now,
    };
  }

  public async getMonitoringStatus(): Promise<ModuleMonitoringStatus> {
    return { ...this.status };
  }

  public async setMonitoringStatus(patch: ModuleStatusPatch): Promise<ModuleMonitoringStatus> {
    this.status = {
      ...this.status,
      healthy: patch.healthy ?? this.status.healthy,
      stage: patch.stage ?? this.status.stage,
      message: patch.message ?? this.status.message,
      updatedAt: new Date().toISOString(),
    };

    return { ...this.status };
  }

  public async getConfig(): Promise<ModuleConfigState> {
    return {
      ...this.config,
      values: {
        ...this.config.values,
      },
    };
  }

  public async updateConfig(patch: Record<string, unknown>): Promise<ModuleConfigState> {
    this.config = {
      ...this.config,
      values: {
        ...this.config.values,
        ...patch,
      },
      updatedAt: new Date().toISOString(),
    };

    return {
      ...this.config,
      values: {
        ...this.config.values,
      },
    };
  }

  public async appendHistory(payload: ModuleHistoryPayload): Promise<ModuleHistoryRecord> {
    const record: ModuleHistoryRecord = {
      id: createHistoryId(),
      moduleId: this.moduleId,
      action: payload.action,
      input: payload.input,
      output: payload.output,
      createdAt: new Date().toISOString(),
    };

    this.history.unshift(record);

    return { ...record };
  }

  public async listHistory(limit = 30): Promise<ModuleHistoryRecord[]> {
    return this.history.slice(0, Math.max(limit, 0)).map((record) => ({ ...record }));
  }
}
