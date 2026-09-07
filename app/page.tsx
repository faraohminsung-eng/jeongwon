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

// DB(사진/설정)를 조회하므로 빌드 시점이 아니라 요청 시점에 렌더링합니다.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { settings, images } = await getHomeData();
  const mainCover = images.find((i) => i.category === "MAIN" && i.isCover) ?? images.find((i) => i.category === "MAIN");
  const galleryImages = images.filter((i) => i.category !== "MAIN");

  return (
    <>
      <a className="skip-link" href="#main">
        본문 바로가기
      </a>
      <SiteNav />
      <main id="main">
        <Hero coverUrl={mainCover?.url} />
        <About />
        <TheHanok />
        <TheGarden />
        <Space />
        <Experience />
        <Gallery images={galleryImages} />
        <Travel />
        <Review />
        <ReservationTeaser />
        <Location settings={settings} />
      </main>
      <SiteFooter settings={settings} />
      <MobileBar settings={settings} />
    </>
  );
}
