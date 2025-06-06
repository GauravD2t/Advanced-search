import { Component } from '@angular/core';

import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { SubmissionImportExternalComponent } from './submission-import-external.component';

/**
 * Themed wrapper for SubmissionImportExternalComponent
 */
@Component({
  selector: 'ds-submission-import-external',
  styleUrls: [],
  templateUrl: './../../shared/theme-support/themed.component.html',
  standalone: true,
  imports: [
    SubmissionImportExternalComponent,
  ],
})
export class ThemedSubmissionImportExternalComponent extends ThemedComponent<SubmissionImportExternalComponent> {
  protected getComponentName(): string {
    return 'SubmissionImportExternalComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/submission/import-external/submission-import-external.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./submission-import-external.component`);
  }
}
