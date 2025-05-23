import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  DynamicFormControlModel,
  DynamicFormService,
} from '@ng-dynamic-forms/core';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { CollectionDataService } from '../../../core/data/collection-data.service';
import { FieldUpdate } from '../../../core/data/object-updates/field-update.model';
import { ObjectUpdatesService } from '../../../core/data/object-updates/object-updates.service';
import { RequestService } from '../../../core/data/request.service';
import { Collection } from '../../../core/shared/collection.model';
import {
  ContentSource,
  ContentSourceHarvestType,
} from '../../../core/shared/content-source.model';
import { hasValue } from '../../../shared/empty.util';
import { FormComponent } from '../../../shared/form/form.component';
import { ThemedLoadingComponent } from '../../../shared/loading/themed-loading.component';
import {
  INotification,
  Notification,
} from '../../../shared/notifications/models/notification.model';
import { NotificationType } from '../../../shared/notifications/models/notification-type';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import {
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '../../../shared/remote-data.utils';
import { RouterStub } from '../../../shared/testing/router.stub';
import { CollectionSourceComponent } from './collection-source.component';
import { CollectionSourceControlsComponent } from './collection-source-controls/collection-source-controls.component';

const infoNotification: INotification = new Notification('id', NotificationType.Info, 'info');
const warningNotification: INotification = new Notification('id', NotificationType.Warning, 'warning');
const successNotification: INotification = new Notification('id', NotificationType.Success, 'success');

const uuid = '29481ed7-ae6b-409a-8c51-34dd347a0ce4';
let date: Date;
let contentSource: ContentSource;
let fieldUpdate: FieldUpdate;
let objectUpdatesService: ObjectUpdatesService;
let notificationsService: NotificationsService;
let location: Location;
let formService: DynamicFormService;
let router: any;
let collection: Collection;
let collectionService: CollectionDataService;
let requestService: RequestService;

describe('CollectionSourceComponent', () => {
  let comp: CollectionSourceComponent;
  let fixture: ComponentFixture<CollectionSourceComponent>;

  beforeEach(waitForAsync(() => {
    date = new Date();
    contentSource = Object.assign(new ContentSource(), {
      uuid: uuid,
      metadataConfigs: [
        {
          id: 'dc',
          label: 'Simple Dublin Core',
          nameSpace: 'http://www.openarchives.org/OAI/2.0/oai_dc/',
        },
        {
          id: 'qdc',
          label: 'Qualified Dublin Core',
          nameSpace: 'http://purl.org/dc/terms/',
        },
        {
          id: 'dim',
          label: 'DSpace Intermediate Metadata',
          nameSpace: 'http://www.dspace.org/xmlns/dspace/dim',
        },
      ],
      _links: { self: { href: 'contentsource-selflink' } },
    });
    fieldUpdate = {
      field: contentSource,
      changeType: undefined,
    };
    objectUpdatesService = jasmine.createSpyObj('objectUpdatesService',
      {
        getFieldUpdates: of({
          [contentSource.uuid]: fieldUpdate,
        }),
        saveAddFieldUpdate: {},
        discardFieldUpdates: {},
        reinstateFieldUpdates: of(true),
        initialize: {},
        getUpdatedFields: of([contentSource]),
        getLastModified: of(date),
        hasUpdates: of(true),
        isReinstatable: of(false),
        isValidPage: of(true),
      },
    );
    notificationsService = jasmine.createSpyObj('notificationsService',
      {
        info: infoNotification,
        warning: warningNotification,
        success: successNotification,
      },
    );
    location = jasmine.createSpyObj('location', ['back']);
    formService = Object.assign({
      createFormGroup: (fModel: DynamicFormControlModel[]) => {
        const controls = {};
        if (hasValue(fModel)) {
          fModel.forEach((controlModel) => {
            controls[controlModel.id] = new UntypedFormControl((controlModel as any).value);
          });
          return new UntypedFormGroup(controls);
        }
        return undefined;
      },
    });
    router = Object.assign(new RouterStub(), {
      url: 'http://test-url.com/test-url',
    });
    collection = Object.assign(new Collection(), {
      uuid: 'fake-collection-id',
    });
    collectionService = jasmine.createSpyObj('collectionService', {
      getContentSource: createSuccessfulRemoteDataObject$(contentSource),
      updateContentSource: of(contentSource),
      getHarvesterEndpoint: of('harvester-endpoint'),
    });
    requestService = jasmine.createSpyObj('requestService', ['removeByHrefSubstring', 'setStaleByHrefSubstring']);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule, CollectionSourceComponent],
      providers: [
        { provide: ObjectUpdatesService, useValue: objectUpdatesService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: Location, useValue: location },
        { provide: DynamicFormService, useValue: formService },
        { provide: ActivatedRoute, useValue: { parent: { data: of({ dso: createSuccessfulRemoteDataObject(collection) }) } } },
        { provide: Router, useValue: router },
        { provide: CollectionDataService, useValue: collectionService },
        { provide: RequestService, useValue: requestService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CollectionSourceComponent, {
        remove: { imports: [
          ThemedLoadingComponent,
          FormComponent,
          CollectionSourceControlsComponent,
        ] },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionSourceComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('on startup', () => {
    let form;

    beforeEach(() => {
      form = fixture.debugElement.query(By.css('ds-form'));
    });

    it('ContentSource should be disabled', () => {
      expect(comp.contentSource.harvestType).toEqual(ContentSourceHarvestType.None);
    });

    it('the input-form should be hidden', () => {
      expect(form).toBeNull();
    });
  });

  describe('when selecting the checkbox', () => {
    let input;
    let form;

    beforeEach(() => {
      input = fixture.debugElement.query(By.css('#externalSourceCheck')).nativeElement;
      input.click();
      fixture.detectChanges();
      form = fixture.debugElement.query(By.css('ds-form'));
    });

    it('should enable ContentSource', () => {
      expect(comp.contentSource.harvestType).not.toEqual(ContentSourceHarvestType.None);
    });

    it('should send a field update', () => {
      expect(objectUpdatesService.saveAddFieldUpdate).toHaveBeenCalledWith(router.url, comp.contentSource);
    });

    it('should display the form', () => {
      expect(form).not.toBeNull();
    });
  });

  describe('isValid', () => {
    it('should return true when ContentSource is disabled but the form invalid', () => {
      spyOnProperty(comp.formGroup, 'valid').and.returnValue(false);
      comp.contentSource.harvestType = ContentSourceHarvestType.None;
      expect(comp.isValid()).toBe(true);
    });

    it('should return false when ContentSource is enabled but the form is invalid', () => {
      spyOnProperty(comp.formGroup, 'valid').and.returnValue(false);
      comp.contentSource.harvestType = ContentSourceHarvestType.Metadata;
      expect(comp.isValid()).toBe(false);
    });

    it('should return true when ContentSource is enabled and the form is valid', () => {
      spyOnProperty(comp.formGroup, 'valid').and.returnValue(true);
      comp.contentSource.harvestType = ContentSourceHarvestType.Metadata;
      expect(comp.isValid()).toBe(true);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      comp.onSubmit();
    });

    it('should re-initialize the field updates', () => {
      expect(objectUpdatesService.initialize).toHaveBeenCalled();
    });

    it('should display a success notification', () => {
      expect(notificationsService.success).toHaveBeenCalled();
    });

    it('should call updateContentSource on the collectionService', () => {
      expect(collectionService.updateContentSource).toHaveBeenCalled();
    });
  });
});
