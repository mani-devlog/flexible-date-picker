import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { PresetRange } from '../models';

@Component({
  selector: 'flex-preset-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-preset-list" role="listbox" aria-label="Preset ranges">
      @for (preset of presets(); track preset.id) {
        <button
          type="button"
          class="flex-preset-button"
          role="option"
          (click)="presetSelect.emit(preset)"
        >
          {{ preset.label }}
        </button>
      }
    </div>
  `,
})
export class FlexPresetListComponent {
  readonly presets = input<PresetRange[]>([]);
  readonly presetSelect = output<PresetRange>();
}
