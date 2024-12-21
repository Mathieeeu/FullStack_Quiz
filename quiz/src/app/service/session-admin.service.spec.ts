import { TestBed } from '@angular/core/testing';

import { SessionAdminService } from './session-admin.service';

describe('SessionAdminService', () => {
  let service: SessionAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
