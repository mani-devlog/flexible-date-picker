import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../shared/code-block/code-block.component';
import { docsSnippets } from './docs-snippets';
import { GITHUB_REPO_URL, NPM_PACKAGE_URL } from '../shared/project-links';

@Component({
  selector: 'app-docs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CodeBlockComponent],
  templateUrl: './docs.component.html',
})
export class DocsComponent {
  readonly snippets = docsSnippets;
  readonly githubUrl = GITHUB_REPO_URL;
  readonly npmPackageUrl = NPM_PACKAGE_URL;
}
