"use client";
import Image from "next/image";
import Style from "./styles/page.module.css";
import { 
  HeroSection ,
  Service,
  Subscribe,
  Title,
  Category,
  Filter,
  Collection,
  FollowerTab,
  Slider,
  Brand,
  Loader,
  Daily,
  Menu,
  Adv,
  Reserve,
  Navbar,
  Footer,
  Blog,
  FAQ,
} from "./components/componentsindex";
import Banner from "./components/Banner/Banner";

export default function Home() {
  return (
    <div className={Style.homePage}>
        <Banner/>
        <Brand/>
        <Service/>
        <Daily/>
        <Menu/>
        <Adv/>
        <Slider/>
        {/* <Blog/> */}
        <FAQ/>
        <Reserve/>
        <Footer/>
    </div>
  );
}
