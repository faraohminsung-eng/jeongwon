export type GalleryImage = { id: string; category: string; url: string; isCover?: boolean };

/** 카테고리별로 정렬된 사진 목록에서 index번째 사진의 URL을 가져옵니다. 없으면 undefined. */
export function pickByCategory(images: GalleryImage[], category: string, index = 0): string | undefined {
  const matches = images.filter((i) => i.category === category);
  return matches[index]?.url;
}

export function countByCategory(images: GalleryImage[], category: string): number {
  return images.filter((i) => i.category === category).length;
}
