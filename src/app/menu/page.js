import React from "react";
import { Footer, HeroSection, Navbar } from "../components/componentsindex";
import Style from "../styles/menu.module.css";
import Banner from "./Banner/Banner";
import MenuCategory from "./menuCategory/menuCategory";
import MenuCard from "./menuCard/menuCard";
import { Reserve } from "../components/componentsindex";
import images from "../img/index";
import  menuArray  from "../data/menudata";

const MenuPage = () => {
  // Lấy danh sách category duy nhất
  const categories = Array.from(
    new Set(menuArray.map((item) => item.category))
  );

  return (
    <div className={Style.menu}>
      <Banner />
      <MenuCategory />

      {categories.map((cat, idx) => {
        const items = menuArray.filter((item) => item.category === cat);
        return (
          <MenuCard
            key={cat}
            category={cat}
            items={items}
            className={idx % 2 === 0 ? Style.menuCardOdd : Style.menuCardEven}
          />
        );
      })}

      <Reserve />
      <Footer />
    </div>
  );
};

export default MenuPage;