import { MenuItemType } from '../../menu-item-type.model';
import { MenuItemModel } from './menu-item.model';

/**
 * Model representing an Search Bar Menu Section
 */
export class SearchMenuItemModel implements MenuItemModel {
  type = MenuItemType.SEARCH;
  disabled?: boolean;
  placeholder: string;
  action: string;
}
