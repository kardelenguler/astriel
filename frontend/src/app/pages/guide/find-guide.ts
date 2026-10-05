import { Guide, GuideCollection } from '../../core/models/guide';

/** Adresteki parçaya (slug) göre rehberi bulur; yoksa undefined */
export function findGuide(
  collection: GuideCollection,
  slug: string | null | undefined,
): Guide | undefined {
  return collection.items.find((item) => item.slug === slug);
}