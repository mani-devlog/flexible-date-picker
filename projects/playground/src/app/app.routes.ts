import { Routes } from '@angular/router';
import { ExamplesComponent } from './examples/examples.component';
import { DocsComponent } from './docs/docs.component';
import { FeaturesComponent } from './features/features.component';

export const routes: Routes = [
  { path: '', component: ExamplesComponent, title: 'Examples — FlexibleDatePicker' },
  { path: 'features', component: FeaturesComponent, title: 'Features — FlexibleDatePicker' },
  { path: 'docs', component: DocsComponent, title: 'Documentation — FlexibleDatePicker' },
  { path: '**', redirectTo: '' },
];
