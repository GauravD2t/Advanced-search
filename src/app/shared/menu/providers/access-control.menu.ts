/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  combineLatest as observableCombineLatest,
  map,
  Observable,
  of as observableOf,
} from 'rxjs';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { ScriptDataService } from '../../../core/data/processes/script-data.service';
import { MenuItemType } from '../menu-item-type.model';
import {
  AbstractExpandableMenuProvider,
  MenuSubSection,
  MenuTopSection,
} from './expandable-menu-provider';

@Injectable()
export class AccessControlMenuProvider extends AbstractExpandableMenuProvider {
  constructor(
    protected authorizationService: AuthorizationDataService,
    protected scriptDataService: ScriptDataService,
    protected modalService: NgbModal,
  ) {
    super();
  }

  public getTopSection(): Observable<MenuTopSection> {
    return observableOf({
        model: {
          type: MenuItemType.TEXT,
          text: 'menu.section.access_control',
        },
        icon: 'key'
    });
  }

  public getSubSections(): Observable<MenuSubSection[]> {
    return observableCombineLatest([
      this.authorizationService.isAuthorized(FeatureID.AdministratorOf),
      this.authorizationService.isAuthorized(FeatureID.CanManageGroups),
    ]).pipe(
      map(([isSiteAdmin, canManageGroups]) => {
        return [
          {
            visible: isSiteAdmin,
            model: {
              type: MenuItemType.LINK,
              text: 'menu.section.access_control_people',
              link: '/access-control/epeople',
            },
          },
          {
            visible: canManageGroups,
            model: {
              type: MenuItemType.LINK,
              text: 'menu.section.access_control_groups',
              link: '/access-control/groups',
            },
          },
          {
            visible: isSiteAdmin,
            model: {
              type: MenuItemType.LINK,
              text: 'menu.section.access_control_bulk',
              link: '/access-control/bulk-access',
            },
          },
          // TODO: enable this menu item once the feature has been implemented
          // {
          //   id: 'access_control_authorizations',
          //   parentID: 'access_control',
          //   active: false,
          //   visible: authorized,
          //   model: {
          //     type: MenuItemType.LINK,
          //     text: 'menu.section.access_control_authorizations',
          //     link: ''
          //   } as LinkMenuItemModel,
          // },
        ] as MenuSubSection[];
      }),
    );
  }
}
