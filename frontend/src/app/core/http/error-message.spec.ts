import { HttpErrorResponse } from '@angular/common/http';

import { getErrorMessage } from './error-message';

const DEFAULT_MESSAGE = 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';

describe('getErrorMessage', () => {
  it('backend mesajını olduğu gibi göstermeli', () => {
    const error = new HttpErrorResponse({
      status: 404,
      error: { error: { code: 'not_found', message: 'Harita bulunamadı.' } },
    });

    expect(getErrorMessage(error)).toBe('Harita bulunamadı.');
  });

  it('sunucuya ulaşılamazsa (status 0) bağlantı mesajı göstermeli', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(getErrorMessage(error)).toBe(
      'Sunucuya ulaşılamıyor. İnternet bağlantını kontrol edip tekrar dene.',
    );
  });

  it('hata gövdesi boşsa varsayılan mesajı göstermeli', () => {
    const error = new HttpErrorResponse({ status: 500, error: null });

    expect(getErrorMessage(error)).toBe(DEFAULT_MESSAGE);
  });

  it('hata gövdesi beklenmeyen biçimdeyse varsayılan mesajı göstermeli', () => {
    const error = new HttpErrorResponse({ status: 502, error: '<html>Bad Gateway</html>' });

    expect(getErrorMessage(error)).toBe(DEFAULT_MESSAGE);
  });

  it('HTTP dışı bir hata gelirse teknik mesajı göstermemeli', () => {
    expect(getErrorMessage(new Error('Cannot read properties of undefined'))).toBe(DEFAULT_MESSAGE);
    expect(getErrorMessage(undefined)).toBe(DEFAULT_MESSAGE);
  });
}); 