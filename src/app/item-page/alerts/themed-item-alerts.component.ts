import {
  Component,
  Input,
} from '@angular/core';

import { Item } from '../../core/shared/item.model';
import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { ItemAlertsComponent } from './item-alerts.component';

/**
 * Themed wrapper for {@link ItemAlertsComponent}
 */
@Component({
  selector: 'ds-item-alerts',
  styleUrls: [],
  templateUrl: '../../shared/theme-support/themed.component.html',
  standalone: true,
  imports: [
    ItemAlertsComponent,
  ],
})
export class ThemedItemAlertsComponent extends ThemedComponent<ItemAlertsComponent> {
  protected inAndOutputNames: (keyof ItemAlertsComponent & keyof this)[] = ['item'];

  @Input() item: Item;

  protected getComponentName(): string {
    return 'ItemAlertsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/item-page/alerts/item-alerts.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import('./item-alerts.component');
  }
}
