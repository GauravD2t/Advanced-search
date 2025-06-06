import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  BrowserModule,
  By,
} from '@angular/platform-browser';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { Operation } from 'fast-json-patch';
import {
  Observable,
  of,
} from 'rxjs';

import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { RemoteDataBuildService } from '../../../core/cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../../core/cache/object-cache.service';
import { DSOChangeAnalyzer } from '../../../core/data/dso-change-analyzer.service';
import { DSpaceObjectDataService } from '../../../core/data/dspace-object-data.service';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import {
  buildPaginatedList,
  PaginatedList,
} from '../../../core/data/paginated-list.model';
import { RemoteData } from '../../../core/data/remote-data';
import { EPersonDataService } from '../../../core/eperson/eperson-data.service';
import { GroupDataService } from '../../../core/eperson/group-data.service';
import { Group } from '../../../core/eperson/models/group.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { HALEndpointService } from '../../../core/shared/hal-endpoint.service';
import { NoContent } from '../../../core/shared/NoContent.model';
import { PageInfo } from '../../../core/shared/page-info.model';
import { UUIDService } from '../../../core/shared/uuid.service';
import { XSRFService } from '../../../core/xsrf/xsrf.service';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { ContextHelpDirective } from '../../../shared/context-help.directive';
import { FormBuilderService } from '../../../shared/form/builder/form-builder.service';
import { FormComponent } from '../../../shared/form/form.component';
import { DSONameServiceMock } from '../../../shared/mocks/dso-name.service.mock';
import { getMockFormBuilderService } from '../../../shared/mocks/form-builder-service.mock';
import { RouterMock } from '../../../shared/mocks/router.mock';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from '../../../shared/remote-data.utils';
import { ActivatedRouteStub } from '../../../shared/testing/active-router.stub';
import {
  GroupMock,
  GroupMock2,
} from '../../../shared/testing/group-mock';
import { NotificationsServiceStub } from '../../../shared/testing/notifications-service.stub';
import { GroupFormComponent } from './group-form.component';
import { MembersListComponent } from './members-list/members-list.component';
import { SubgroupsListComponent } from './subgroup-list/subgroups-list.component';
import { ValidateGroupExists } from './validators/group-exists.validator';

describe('GroupFormComponent', () => {
  let component: GroupFormComponent;
  let fixture: ComponentFixture<GroupFormComponent>;
  let builderService: FormBuilderService;
  let ePersonDataServiceStub: any;
  let groupsDataServiceStub: any;
  let dsoDataServiceStub: any;
  let authorizationService: AuthorizationDataService;
  let notificationService: NotificationsServiceStub;
  let router: RouterMock;
  let route: ActivatedRouteStub;

  let groups: Group[];
  let groupName: string;
  let groupDescription: string;
  let expected: Group;

  beforeEach(waitForAsync(() => {
    groups = [GroupMock, GroupMock2];
    groupName = 'testGroupName';
    groupDescription = 'testDescription';
    expected = Object.assign(new Group(), {
      name: groupName,
      metadata: {
        'dc.description': [
          {
            value: groupDescription,
          },
        ],
      },
      object: createSuccessfulRemoteDataObject$(undefined),
      _links: {
        self: {
          href: 'group-selflink',
        },
        object: {
          href: 'group-objectlink',
        },
      },
    });
    ePersonDataServiceStub = {};
    groupsDataServiceStub = {
      allGroups: groups,
      activeGroup: null,
      createdGroup: null,
      getActiveGroup(): Observable<Group> {
        return of(this.activeGroup);
      },
      getGroupRegistryRouterLink(): string {
        return '/access-control/groups';
      },
      editGroup(group: Group) {
        this.activeGroup = group;
      },
      clearGroupsRequests() {
        return null;
      },
      patch(group: Group, operations: Operation[]) {
        return null;
      },
      delete(objectId: string, copyVirtualMetadata?: string[]): Observable<RemoteData<NoContent>> {
        return createSuccessfulRemoteDataObject$({});
      },
      cancelEditGroup(): void {
        this.activeGroup = null;
      },
      findById(id: string) {
        return of({ payload: null, hasSucceeded: true });
      },
      findByHref(href: string) {
        return createSuccessfulRemoteDataObject$(this.createdGroup);
      },
      create(group: Group): Observable<RemoteData<Group>> {
        this.allGroups = [...this.allGroups, group];
        this.createdGroup = Object.assign({}, group, {
          _links: {
            self: {
              href: 'group-selflink',
            },
            object: {
              href: 'group-objectlink',
            },
          },
        });
        return createSuccessfulRemoteDataObject$(this.createdGroup);
      },
      searchGroups(query: string): Observable<RemoteData<PaginatedList<Group>>> {
        return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), []));
      },
      getGroupEditPageRouterLinkWithID(id: string) {
        return `group-edit-page-for-${id}`;
      },
    };
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: of(true),
    });
    dsoDataServiceStub = {
      findByHref(href: string): Observable<RemoteData<DSpaceObject>> {
        return null;
      },
    };
    builderService = Object.assign(getMockFormBuilderService(),{
      createFormGroup(formModel, options = null) {
        const controls = {};
        formModel.forEach( model => {
          model.parent = parent;
          const controlModel = model;
          const controlState = { value: controlModel.value, disabled: controlModel.disabled };
          const controlOptions = this.createAbstractControlOptions(controlModel.validators, controlModel.asyncValidators, controlModel.updateOn);
          controls[model.id] = new UntypedFormControl(controlState, controlOptions);
        });
        return new UntypedFormGroup(controls, options);
      },
      createAbstractControlOptions(validatorsConfig = null, asyncValidatorsConfig = null, updateOn = null) {
        return {
          validators: validatorsConfig !== null ? this.getValidators(validatorsConfig) : null,
        };
      },
      getValidators(validatorsConfig) {
        return this.getValidatorFns(validatorsConfig);
      },
      getValidatorFns(validatorsConfig, validatorsToken = this._NG_VALIDATORS) {
        let validatorFns = [];
        if (this.isObject(validatorsConfig)) {
          validatorFns = Object.keys(validatorsConfig).map(validatorConfigKey => {
            const validatorConfigValue = validatorsConfig[validatorConfigKey];
            if (this.isValidatorDescriptor(validatorConfigValue)) {
              const descriptor = validatorConfigValue;
              return this.getValidatorFn(descriptor.name, descriptor.args, validatorsToken);
            }
            return this.getValidatorFn(validatorConfigKey, validatorConfigValue, validatorsToken);
          });
        }
        return validatorFns;
      },
      getValidatorFn(validatorName, validatorArgs = null, validatorsToken = this._NG_VALIDATORS) {
        let validatorFn;
        if (Validators.hasOwnProperty(validatorName)) { // Built-in Angular Validators
          validatorFn = Validators[validatorName];
        } else { // Custom Validators
          if (this._DYNAMIC_VALIDATORS && this._DYNAMIC_VALIDATORS.has(validatorName)) {
            validatorFn = this._DYNAMIC_VALIDATORS.get(validatorName);
          } else if (validatorsToken) {
            validatorFn = validatorsToken.find(validator => validator.name === validatorName);
          }
        }
        if (validatorFn === undefined) { // throw when no validator could be resolved
          throw new Error(`validator '${validatorName}' is not provided via NG_VALIDATORS, NG_ASYNC_VALIDATORS or DYNAMIC_FORM_VALIDATORS`);
        }
        if (validatorArgs !== null) {
          return validatorFn(validatorArgs);
        }
        return validatorFn;
      },
      isValidatorDescriptor(value) {
        if (this.isObject(value)) {
          return value.hasOwnProperty('name') && value.hasOwnProperty('args');
        }
        return false;
      },
      isObject(value) {
        return typeof value === 'object' && value !== null;
      },
    });
    router = new RouterMock();
    route = new ActivatedRouteStub();
    notificationService = new NotificationsServiceStub();

    return TestBed.configureTestingModule({
      imports: [CommonModule, NgbModule, FormsModule, ReactiveFormsModule, BrowserModule,
        TranslateModule.forRoot(),
        GroupFormComponent,
      ],
      providers: [
        { provide: DSONameService, useValue: new DSONameServiceMock() },
        { provide: EPersonDataService, useValue: ePersonDataServiceStub },
        { provide: GroupDataService, useValue: groupsDataServiceStub },
        { provide: DSpaceObjectDataService, useValue: dsoDataServiceStub },
        { provide: NotificationsService, useValue: notificationService },
        { provide: FormBuilderService, useValue: builderService },
        { provide: DSOChangeAnalyzer, useValue: {} },
        { provide: HttpClient, useValue: {} },
        { provide: ObjectCacheService, useValue: {} },
        { provide: UUIDService, useValue: {} },
        { provide: XSRFService, useValue: {} },
        { provide: Store, useValue: {} },
        { provide: RemoteDataBuildService, useValue: {} },
        { provide: HALEndpointService, useValue: {} },
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: AuthorizationDataService, useValue: authorizationService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(GroupFormComponent, {
        remove: { imports: [
          FormComponent,
          AlertComponent,
          ContextHelpDirective,
          MembersListComponent,
          SubgroupsListComponent,
        ] },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when submitting the form', () => {
    beforeEach(() => {
      spyOn(component.submitForm, 'emit');
      component.groupName.setValue(groupName);
      component.groupDescription.setValue(groupDescription);
    });
    describe('without active Group', () => {
      beforeEach(() => {
        component.onSubmit();
        fixture.detectChanges();
      });

      it('should emit a new group using the correct values', (() => {
        expect(component.submitForm.emit).toHaveBeenCalledWith(jasmine.objectContaining({
          name: groupName,
          metadata: {
            'dc.description': [
              {
                value: groupDescription,
              },
            ],
          },
        }));
      }));
    });

    describe('with active Group', () => {
      let expected2: Group;
      beforeEach(() => {
        expected2 = Object.assign(new Group(), {
          name: 'newGroupName',
          metadata: {
            'dc.description': [
              {
                value: groupDescription,
              },
            ],
          },
          object: createSuccessfulRemoteDataObject$(undefined),
          _links: {
            self: {
              href: 'group-selflink',
            },
            object: {
              href: 'group-objectlink',
            },
          },
        });
        spyOn(groupsDataServiceStub, 'getActiveGroup').and.returnValue(of(expected));
        spyOn(groupsDataServiceStub, 'patch').and.returnValue(createSuccessfulRemoteDataObject$(expected2));
        component.ngOnInit();
      });

      it('should edit with name and description operations', () => {
        component.groupName.setValue('newGroupName');
        component.onSubmit();
        const operations = [{
          op: 'add',
          path: '/metadata/dc.description',
          value: 'testDescription',
        }, {
          op: 'replace',
          path: '/name',
          value: 'newGroupName',
        }];
        expect(groupsDataServiceStub.patch).toHaveBeenCalledWith(expected, operations);
      });

      it('should edit with description operations', () => {
        component.groupName.setValue(null);
        component.onSubmit();
        const operations = [{
          op: 'add',
          path: '/metadata/dc.description',
          value: 'testDescription',
        }];
        expect(groupsDataServiceStub.patch).toHaveBeenCalledWith(expected, operations);
      });

      it('should edit with name operations', () => {
        component.groupName.setValue('newGroupName');
        component.groupDescription.setValue(null);
        component.onSubmit();
        const operations = [{
          op: 'replace',
          path: '/name',
          value: 'newGroupName',
        }];
        expect(groupsDataServiceStub.patch).toHaveBeenCalledWith(expected, operations);
      });

      it('should emit the existing group using the correct new values', () => {
        component.onSubmit();
        expect(component.submitForm.emit).toHaveBeenCalledWith(expected2);
      });

      it('should emit success notification', () => {
        component.onSubmit();
        expect(notificationService.success).toHaveBeenCalled();
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('does NOT call router.navigate', () => {
      component.ngOnDestroy();
      expect(router.navigate).toHaveBeenCalledTimes(0);
    });
  });


  describe('check form validation', () => {
    beforeEach(() => {
      groupName = 'testName';
      groupDescription = 'testgroupDescription';

      expected = Object.assign(new Group(), {
        name: groupName,
        metadata: {
          'dc.description': [
            {
              value: groupDescription,
            },
          ],
        },
        _links: {
          self: {
            href: 'group-selflink',
          },
          object: {
            href: 'group-objectlink',
          },
        },
      });
      spyOn(component.submitForm, 'emit');
      spyOn(dsoDataServiceStub, 'findByHref').and.returnValue(of(expected));

      fixture.detectChanges();
      component.initialisePage();
      fixture.detectChanges();
    });
    describe('groupName, groupCommunity and groupDescription should be required', () => {
      it('form should be invalid because the groupName is required', waitForAsync(() => {
        fixture.whenStable().then(() => {
          expect(component.formGroup.controls.groupName.valid).toBeFalse();
          expect(component.formGroup.controls.groupName.errors.required).toBeTrue();
        });
      }));
    });

    describe('after inserting information groupName,groupCommunity and groupDescription not required', () => {
      beforeEach(() => {
        component.formGroup.controls.groupName.setValue('test');
        fixture.detectChanges();
      });
      it('groupName should be valid because the groupName is set', waitForAsync(() => {
        fixture.whenStable().then(() => {
          expect(component.formGroup.controls.groupName.valid).toBeTrue();
          expect(component.formGroup.controls.groupName.errors).toBeNull();
        });
      }));
    });

    describe('after already utilized groupName', () => {
      beforeEach(() => {
        const groupsDataServiceStubWithGroup = Object.assign(groupsDataServiceStub,{
          searchGroups(query: string): Observable<RemoteData<PaginatedList<Group>>> {
            return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [expected]));
          },
        });
        component.formGroup.controls.groupName.setValue('testName');
        component.formGroup.controls.groupName.setAsyncValidators(ValidateGroupExists.createValidator(groupsDataServiceStubWithGroup));
        fixture.detectChanges();
      });

      it('groupName should not be valid because groupName is already taken', waitForAsync(() => {
        fixture.whenStable().then(() => {
          expect(component.formGroup.controls.groupName.valid).toBeFalse();
          expect(component.formGroup.controls.groupName.errors.groupExists).toBeTruthy();
        });
      }));
    });
  });

  describe('delete', () => {
    let deleteButton: HTMLButtonElement;

    beforeEach(async () => {
      spyOn(groupsDataServiceStub, 'delete').and.callThrough();
      component.activeGroup$ = of({
        id: 'active-group',
        permanent: false,
      } as Group);
      component.canEdit$ = of(true);

      component.initialisePage();

      fixture.detectChanges();
      deleteButton = fixture.debugElement.query(By.css('.delete-button')).nativeElement;
    });

    describe('if confirmed via modal', () => {
      beforeEach(waitForAsync(() => {
        deleteButton.click();
        fixture.detectChanges();
        (document as any).querySelector('.modal-footer .confirm').click();
      }));

      it('should call GroupDataService.delete', () => {
        expect(groupsDataServiceStub.delete).toHaveBeenCalledWith('active-group');
      });
    });

    describe('if canceled via modal', () => {
      beforeEach(waitForAsync(() => {
        deleteButton.click();
        fixture.detectChanges();
        (document as any).querySelector('.modal-footer .cancel').click();
      }));

      it('should not call GroupDataService.delete', () => {
        expect(groupsDataServiceStub.delete).not.toHaveBeenCalled();
      });
    });
  });
});
