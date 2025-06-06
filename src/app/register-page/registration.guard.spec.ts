import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../core/auth/auth.service';
import { EpersonRegistrationService } from '../core/data/eperson-registration.service';
import { RemoteData } from '../core/data/remote-data';
import { Registration } from '../core/shared/registration.model';
import {
  createFailedRemoteDataObject$,
  createSuccessfulRemoteDataObject,
} from '../shared/remote-data.utils';
import { registrationGuard } from './registration.guard';

describe('registrationGuard', () => {
  let guard: any;

  let epersonRegistrationService: EpersonRegistrationService;
  let router: Router;
  let authService: AuthService;

  let registration: Registration;
  let registrationRD: RemoteData<Registration>;
  let currentUrl: string;

  let startingRouteData: any;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    registration = Object.assign(new Registration(), {
      email: 'test@email.com',
      token: 'testToken',
      user: 'testUser',
    });
    registrationRD = createSuccessfulRemoteDataObject(registration);
    currentUrl = 'test-current-url';

    startingRouteData = {
      existingData: 'some-existing-data',
    };
    route = Object.assign(new ActivatedRouteSnapshot(), {
      data: Object.assign({}, startingRouteData),
      params: {
        token: 'testToken',
      },
    });
    state = Object.assign({
      url: currentUrl,
    });

    epersonRegistrationService = jasmine.createSpyObj('epersonRegistrationService', {
      searchByTokenAndUpdateData: of(registrationRD),
    });
    router = jasmine.createSpyObj('router', {
      navigateByUrl: Promise.resolve(),
    }, {
      url: currentUrl,
    });
    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: of(false),
      setRedirectUrl: {},
    });

    guard = registrationGuard;
  });

  describe('canActivate', () => {
    describe('when searchByToken returns a successful response', () => {
      beforeEach(() => {
        (epersonRegistrationService.searchByTokenAndUpdateData as jasmine.Spy).and.returnValue(of(registrationRD));
      });

      it('should return true', (done) => {
        guard(route, state, authService, epersonRegistrationService, router).subscribe((result) => {
          expect(result).toEqual(true);
          done();
        });
      });

      it('should add the response to the route\'s data', (done) => {
        guard(route, state, authService, epersonRegistrationService, router).subscribe(() => {
          expect(route.data).toEqual({ ...startingRouteData, registration: registrationRD });
          done();
        });
      });

      it('should not redirect', (done) => {
        guard(route, state, authService, epersonRegistrationService, router).subscribe(() => {
          expect(router.navigateByUrl).not.toHaveBeenCalled();
          done();
        });
      });
    });

    describe('when searchByToken returns a 404 response', () => {
      beforeEach(() => {
        (epersonRegistrationService.searchByTokenAndUpdateData as jasmine.Spy).and.returnValue(createFailedRemoteDataObject$('Not Found', 404));
      });

      it('should redirect', () => {
        guard(route, state, authService, epersonRegistrationService, router).subscribe();
        expect(router.navigateByUrl).toHaveBeenCalled();
      });
    });
  });
});
