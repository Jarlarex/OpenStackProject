import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SubmodelService } from './submodel.service';
import { AuthCustomService } from './auth-custom.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('SubmodelService', () => {
  let service: SubmodelService;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthCustomService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthCustomService', ['isAuthenticated', 'currentUser', 'token']);
    
    // Mock the signal functions
    authSpy.isAuthenticated.and.returnValue(true);
    authSpy.currentUser.and.returnValue({ id: 'user123', email: 'test@example.com', role: 'user' });
    authSpy.token.and.returnValue('fake-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SubmodelService,
        { provide: AuthCustomService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(SubmodelService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceMock = TestBed.inject(AuthCustomService) as jasmine.SpyObj<AuthCustomService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('likeSubmodel', () => {
    it('should send a POST request to like a submodel', () => {
      const modelId = 'model123';
      const submodelId = 'submodel456';
      const userId = 'user123';
      
      service.likeSubmodel(modelId, submodelId).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`http://localhost:3000/api/v1/users/${userId}/like`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ modelId, submodelId });
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      
      req.flush({ message: 'Submodel liked successfully' });
    });

    it('should return an error observable when user is not authenticated', () => {
      authServiceMock.isAuthenticated.and.returnValue(false);
      
      service.likeSubmodel('model123', 'submodel456').subscribe({
        error: (error) => {
          expect(error.message).toBe('User must be authenticated to like a submodel');
        }
      });

      httpMock.expectNone(`http://localhost:3000/api/v1/users/user123/like`);
    });
  });

  describe('unlikeSubmodel', () => {
    it('should send a POST request to unlike a submodel', () => {
      const modelId = 'model123';
      const submodelId = 'submodel456';
      const userId = 'user123';
      
      service.unlikeSubmodel(modelId, submodelId).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`http://localhost:3000/api/v1/users/${userId}/unlike`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ modelId, submodelId });
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      
      req.flush({ message: 'Submodel unliked successfully' });
    });
  });

  describe('getLikedSubmodels', () => {
    it('should return liked submodels for authenticated user', () => {
      const userId = 'user123';
      const mockResponse = {
        likedSubmodels: [
          {
            modelId: 'model123',
            modelName: 'BMW M3',
            submodelId: 'submodel456',
            submodel: {
              name: 'Competition',
              engineType: 'V6',
              horsepower: 503,
              torque: 479,
              transmission: 'Automatic',
              year: 2023
            }
          }
        ]
      };
      
      service.getLikedSubmodels().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:3000/api/v1/users/${userId}/liked`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      
      req.flush(mockResponse);
    });

    it('should return empty array when user is not authenticated', () => {
      authServiceMock.isAuthenticated.and.returnValue(false);
      
      service.getLikedSubmodels().subscribe(response => {
        expect(response).toEqual({ likedSubmodels: [] });
      });

      httpMock.expectNone(`http://localhost:3000/api/v1/users/user123/liked`);
    });
  });
});
