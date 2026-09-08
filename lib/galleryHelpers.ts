export type GalleryImage = {
  id: string;
  category: string;
  url: string;
  isCover?: boolean;
  isConcept?: boolean;
};

/**
 * 카테고리별로 정렬된 사진 목록에서 index번째 사진의 URL을 가져옵니다. 없으면 undefined.
 * "조성 예정" 컨셉 이미지는 현재 실재하는 시설을 나타내는 자리(히어로, 한옥/정원 소개, 공간 카드 등)에는
 * 절대 자동으로 채우지 않습니다 — 갤러리 섹션에서만 배지와 함께 노출됩니다.
 */
export function pickByCategory(images: GalleryImage[], category: string, index = 0): string | undefined {
  const matches = images.filter((i) => i.category === category && !i.isConcept);
  return matches[index]?.url;
}

export function countByCategory(images: GalleryImage[], category: string): number {
  return images.filter((i) => i.category === category && !i.isConcept).length;
}
