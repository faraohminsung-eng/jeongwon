import SiteNav from "@/components/SiteNav";
import MobileBar from "@/components/MobileBar";
import SiteFooter from "@/components/SiteFooter";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import TheHanok from "@/components/sections/TheHanok";
import TheGarden from "@/components/sections/TheGarden";
import Space from "@/components/sections/Space";
import Experience from "@/components/sections/Experience";
import Gallery from "@/components/sections/Gallery";
import Travel from "@/components/sections/Travel";
import Review from "@/components/sections/Review";
import ReservationTeaser from "@/components/sections/ReservationTeaser";
import Location from "@/components/sections/Location";
import { getHomeData } from "@/lib/homeData";
import { pickByCategory } from "@/lib/galleryHelpers";

// DB(사진/설정)를 조회하므로 빌드 시점이 아니라 요청 시점에 렌더링합니다.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { settings, images } = await getHomeData();

  // 메인(히어로) 사진: 야경 사진을 우선 사용 (요청에 따라 교체)
  const mainCover =
    pickByCategory(images, "NIGHT", 0) ??
    pickByCategory(images, "MAIN", 0) ??
    pickByCategory(images, "GARDEN", 0);
  const galleryImages = images.filter((i) => i.category !== "MAIN");

  // 업로드된 실제 사진을 각 섹션의 실제 내용과 맞는 자리에 배치합니다.
  // (관련 없는 카테고리 사진을 억지로 채워 넣지 않고, 실제로 어울리는 사진이 있을 때만 사용)
  const hanokPhotoUrls = [
    pickByCategory(images, "GARDEN", 2), // 한옥 외관
    pickByCategory(images, "GARDEN", 1), // 처마
    pickByCategory(images, "EXTERIOR", 0), // 대문
    pickByCategory(images, "GARDEN", 3), // 마당
    pickByCategory(images, "ROOM", 2), // 대청
    pickByCategory(images, "NIGHT", 0), // 야간 모습
  ];

  const spacePhotos = {
    living: pickByCategory(images, "ROOM", 2),
    bed1: pickByCategory(images, "ROOM", 0),
    garden: pickByCategory(images, "GARDEN", 0),
    bbq: pickByCategory(images, "BBQ", 1) ?? pickByCategory(images, "BBQ", 0),
  };

  return (
    <>
      <a className="skip-link" href="#main">
        본문 바로가기
      </a>
      <SiteNav />
      <main id="main">
        <Hero coverUrl={mainCover} />
        <About photoUrl={pickByCategory(images, "GARDEN", 3)} />
        <TheHanok photoUrls={hanokPhotoUrls} />
        <TheGarden photoUrl={pickByCategory(images, "GARDEN", 1)} />
        <Space photos={spacePhotos} />
        <Experience />
        <Gallery images={galleryImages} />
        <Travel naganeupseongPhotoUrl={pickByCategory(images, "TRAVEL", 0)} />
        <Review />
        <ReservationTeaser />
        <Location settings={settings} />
      </main>
      <SiteFooter settings={settings} />
      <MobileBar settings={settings} />
    </>
  );
}
