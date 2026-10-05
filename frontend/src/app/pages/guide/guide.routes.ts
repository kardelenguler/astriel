import { ActivatedRouteSnapshot, Route, Routes, UrlSegment } from '@angular/router';

import { Guide, GuideCollection } from '../../core/models/guide';
import { findGuide } from './find-guide';
import { GuideDetail } from './guide-detail/guide-detail';
import { GuideList } from './guide-list/guide-list';

/**
 * Bir rehber grubu için iki rota üretir:
 *   /evler         -> liste sayfası
 *   /evler/7-ev    -> tek ev sayfası
 * Başlık ve Google açıklaması her sayfa için içerikten alınır.
 */
export function guideRoutes(collection: GuideCollection): Routes {
  const guideOf = (route: ActivatedRouteSnapshot): Guide =>
    findGuide(collection, route.paramMap.get('slug'))!; // canMatch sayesinde her zaman bulunur

  return [
    {
      path: collection.path,
      component: GuideList,
      title: `${collection.title} · Astriel`,
      data: { collection, description: collection.description },
    },
    {
      path: `${collection.path}/:slug`,
      component: GuideDetail,
      // Olmayan bir adres (/evler/99-ev) bu rotaya hiç girmesin, "Sayfa bulunamadı"ya düşsün
      canMatch: [(_route: Route, segments: UrlSegment[]) => !!findGuide(collection, segments[1]?.path)],
      title: (route: ActivatedRouteSnapshot) => `${guideOf(route).title} · Astriel`,
      data: { collection },
      // resolve sonucu route.data'ya eklenir; DescriptionService oradan okur
      resolve: { description: (route: ActivatedRouteSnapshot) => guideOf(route).description },
    },
  ];
}