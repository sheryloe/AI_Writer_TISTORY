import { ManagedAssistantModule } from "../../types/module";

export class ModuleRegistry {
  private readonly modules = new Map<string, ManagedAssistantModule>();

  public registerModule(module: ManagedAssistantModule): void {
    this.modules.set(module.moduleId, module);
  }

  public getModule(moduleId: string): ManagedAssistantModule | undefined {
    return this.modules.get(moduleId);
  }

  public listModules(): ManagedAssistantModule[] {
    return Array.from(this.modules.values());
  }
}
