import { Injectable, computed, signal } from '@angular/core';

export interface EngineAdapter<TState, TSelectors> {
  state: TState;
  selectors: TSelectors;
}

@Injectable()
export class PickerEngineBridge<TState extends object, TSelectors extends object> {
  private readonly version = signal(0);
  private engine: EngineAdapter<TState, TSelectors> | null = null;

  connect(engine: EngineAdapter<TState, TSelectors>): void {
    this.engine = engine;
    this.notify();
  }

  readonly state = computed(() => {
    this.version();
    return this.engine?.state ?? ({} as TState);
  });

  get selectors(): TSelectors {
    if (!this.engine) {
      throw new Error('Picker engine not connected');
    }
    return this.engine.selectors;
  }

  notify(): void {
    this.version.update((v) => v + 1);
  }
}
