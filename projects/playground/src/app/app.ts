import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FlexLocaleService, FlexThemeService } from '@manidev/ngx-flexible-date-picker';
import { GITHUB_REPO_URL, NPM_PACKAGE_URL } from './shared/project-links';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly theme = inject(FlexThemeService);
  private readonly locale = inject(FlexLocaleService);

  readonly darkMode = signal(false);
  readonly selectedLocale = signal('en');
  readonly githubUrl = GITHUB_REPO_URL;
  readonly npmPackageUrl = NPM_PACKAGE_URL;
  readonly currentYear = new Date().getFullYear();

  toggleDarkMode(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    this.theme.setDarkMode(next);
  }

  onLocaleChange(code: string): void {
    this.selectedLocale.set(code);
    this.locale.setLocale(code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
  }
}
