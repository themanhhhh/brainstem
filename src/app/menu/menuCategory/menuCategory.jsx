import React from "react";
import images from "../../img/index";

import Style from "./menuCategory.module.css";
import Image from "next/image";

const MenuCategory = () => {
  const categories = [
    { id: 1, category: "Starters", image: images.specialmenu1 },
    { id: 2, category: "Vegetables", image: images.specialmenu2 },
    { id: 3, category: "Seafood", image: images.specialmenu3 },
    { id: 4, category: "Desserts", image: images.specialmenu4 },
    { id: 5, category: "Beverages", image: images.specialmenu5 },
    { id: 6, category: "Salads & Soups", image: images.specialmenu6 },
  ];

  return (
    <div className={Style.container}>
      <p>• TASTE THE BEST THAT SURPRISE YOU</p>
      <h2 className={Style.title}>
        OUR SPECIAL <span>MENU</span>
      </h2>
      <p className={Style.subtitle}>
        Enjoy the unique dishes from the basilico restaurant that only our restaurant has, Fusce malesuada, lorem vitae euismod lobortis.
      </p>
      <div className={Style.categoryList}>
        {categories.map((item) => (
          <div key={item.id} className={Style.categoryItem}>
            <Image src={item.image} alt={item.category} />
            <span>{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuCategory;