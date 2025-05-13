import React from "react";
import Style from "./menuCard.module.css";
import MenuSmallCard from "../menuSmallCard/menuSmallCard";

const MenuCard = ({ category, items, className }) => {
  return (
    <div className={`${Style.menuCard} ${className}`}>  
      <div className={Style.menuCard_content}>
        <p>• MENU & PRICING</p>
        <h1>{category}</h1>
      </div>
      <div className={Style.menuCard_box}>
        {items.map((el) => (
          <MenuSmallCard
            key={el.id}
            id={el.id}
            name={el.name}
            price={el.price}
            image={el.image}
            description={el.description}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuCard;