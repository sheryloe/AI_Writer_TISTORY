export interface ModuleMonitoringStatus {
  moduleId: string;
  moduleName: string;
  healthy: boolean;
  stage: string;
  message: string;
  updatedAt: string;
}

export interface ModuleConfigState {
  moduleId: string;
  moduleName: string;
  values: Record<string, unknown>;
  updatedAt: string;
}

export interface ModuleHistoryRecord {
  id: string;
  moduleId: string;
  action: string;
  input?: unknown;
  output?: unknown;
  createdAt: string;
}

export interface ModuleStatusPatch {
  healthy?: boolean;
  stage?: string;
  message?: string;
}

export interface ModuleHistoryPayload {
  action: string;
  input?: unknown;
  output?: unknown;
}

export interface AssistantModule {
  moduleId: string;
  moduleName: string;
  getMonitoringStatus: () => Promise<ModuleMonitoringStatus>;
  getConfig: () => Promise<ModuleConfigState>;
  updateConfig: (patch: Record<string, unknown>) => Promise<ModuleConfigState>;
  listHistory: (limit?: number) => Promise<ModuleHistoryRecord[]>;
}

export interface ManagedAssistantModule extends AssistantModule {
  setMonitoringStatus: (patch: ModuleStatusPatch) => Promise<ModuleMonitoringStatus>;
  appendHistory: (payload: ModuleHistoryPayload) => Promise<ModuleHistoryRecord>;
}
