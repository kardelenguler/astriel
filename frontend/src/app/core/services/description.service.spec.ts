import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';

import { DEFAULT_DESCRIPTION, DescriptionService } from './description.service';

@Component({ template: '' })
class EmptyPage {}

describe('DescriptionService', () => {
  let router: Router;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'hakkinda', component: EmptyPage, data: { description: 'Hakkında açıklaması' } },
          { path: 'aciklamasiz', component: EmptyPage },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    meta = TestBed.inject(Meta);
    TestBed.inject(DescriptionService).init();
  });

  const description = () => meta.getTag('name="description"')?.content;

  it('sayfanın kendi açıklamasını yazmalı', async () => {
    await router.navigateByUrl('/hakkinda');

    expect(description()).toBe('Hakkında açıklaması');
  });

  it('açıklaması olmayan sayfada varsayılanı yazmalı', async () => {
    await router.navigateByUrl('/hakkinda');
    await router.navigateByUrl('/aciklamasiz');

    expect(description()).toBe(DEFAULT_DESCRIPTION);
  });
});