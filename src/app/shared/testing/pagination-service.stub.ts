import { of } from 'rxjs';

import {
  SortDirection,
  SortOptions,
} from '../../core/cache/models/sort-options.model';
import { FindListOptions } from '../../core/data/find-list-options.model';
import { PaginationComponentOptions } from '../pagination/pagination-component-options.model';

export class PaginationServiceStub {

  constructor(
    public pagination = Object.assign(new PaginationComponentOptions(), { currentPage: 1, pageSize: 20 }),
    public sort = new SortOptions('score', SortDirection.DESC),
    public findlistOptions = Object.assign(new FindListOptions(), { currentPage: 1, elementsPerPage: 20 }),
  ) {
  }

  getCurrentPagination = jasmine.createSpy('getCurrentPagination').and.returnValue(of(this.pagination));
  getCurrentSort = jasmine.createSpy('getCurrentSort').and.returnValue(of(this.sort));
  getFindListOptions = jasmine.createSpy('getFindListOptions').and.returnValue(of(this.findlistOptions));
  resetPage = jasmine.createSpy('resetPage');
  updateRoute = jasmine.createSpy('updateRoute');
  updateRouteWithUrl = jasmine.createSpy('updateRouteWithUrl');
  clearPagination = jasmine.createSpy('clearPagination');
  getRouteParameterValue = jasmine.createSpy('getRouteParameterValue').and.returnValue(of(''));
  getPageParam = jasmine.createSpy('getPageParam').and.returnValue(`${this.pagination.id}.page`);

}
