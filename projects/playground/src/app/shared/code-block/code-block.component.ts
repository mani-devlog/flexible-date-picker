import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { highlightCode, type CodeLanguage } from './highlight-code';

@Component({
  selector: 'app-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-block">
      <div class="code-block__header">
        <span class="code-block__icon" aria-hidden="true">&lt; &gt;</span>
        <span class="code-block__label">{{ label() }}</span>
      </div>
      <div class="code-block__panel">
        <div class="code-block__toolbar">
          <div class="code-block__dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="code-block__filename">{{ filename() }}</span>
        </div>
        <pre class="code-block__pre"><code [innerHTML]="highlighted()"></code></pre>
      </div>
    </div>
  `,
})
export class CodeBlockComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly code = input.required<string>();
  readonly label = input('Implementation Code');
  readonly filename = input('code.txt');
  readonly language = input<CodeLanguage>('text');

  readonly highlighted = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(highlightCode(this.code(), this.language())),
  );
}
