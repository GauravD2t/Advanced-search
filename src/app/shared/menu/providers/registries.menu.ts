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
  combineLatest,
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
export class RegistriesMenuProvider extends AbstractExpandableMenuProvider {
  constructor(
    protected authorizationService: AuthorizationDataService,
    protected scriptDataService: ScriptDataService,
    protected modalService: NgbModal,
  ) {
    super();
  }

  public getTopSection(): Observable<MenuTopSection> {
    return observableOf(
      {
        model: {
          type: MenuItemType.TEXT,
          text: 'menu.section.registries',
        },
        icon: 'list',
      },
    );
  }

  public getSubSections(): Observable<MenuSubSection[]> {
    return combineLatest([
      this.authorizationService.isAuthorized(FeatureID.AdministratorOf),
    ]).pipe(
      map(([authorized]) => {
        return [
          {
            visible: authorized,
            model: {
              type: MenuItemType.LINK,
              text: 'menu.section.registries_metadata',
              link: 'admin/registries/metadata',
            },
          },
          {
            visible: authorized,
            model: {
              type: MenuItemType.LINK,
              text: 'menu.section.registries_format',
              link: 'admin/registries/bitstream-formats',
            },
          },
        ] as MenuSubSection[];
      }),
    );
  }
}
