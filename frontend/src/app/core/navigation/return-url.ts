import { ActivatedRoute } from '@angular/router';

/**
 * Giriş/kayıttan sonra dönülecek adres (?donus=/haritalarim).
 * Sadece site içi adreslere izin verilir: "//kotu-site.com" veya "/\kotu-site.com"
 * gibi adreslerle kullanıcı başka bir siteye yönlendirilemez.
 */
export function safeReturnUrl(route: ActivatedRoute): string {
  const url = route.snapshot.queryParamMap.get('donus');
  const isInternal = !!url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
  return isInternal ? url : '/';
}