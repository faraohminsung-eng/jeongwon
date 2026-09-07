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

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">
        본문 바로가기
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <About />
        <TheHanok />
        <TheGarden />
        <Space />
        <Experience />
        <Gallery />
        <Travel />
        <Review />
        <ReservationTeaser />
        <Location />
      </main>
      <SiteFooter />
      <MobileBar />
    </>
  );
}
