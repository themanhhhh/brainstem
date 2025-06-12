"use client";
import React , {useState} from "react";
import Image from "next/image";
import { MdVerified } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { FaPlus } from "react-icons/fa";

import Style from "./MenuCard.module.css";
import images from "../../../img";

const MenuCard = ({ name, price, description, background }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    // Tạm thời log thông tin món ăn - sau này có thể kết nối với context hoặc state management
    console.log("Đã thêm vào giỏ hàng:", { name, price, description });
    // TODO: Thêm logic thêm vào giỏ hàng thực tế
    alert(`Đã thêm ${name} vào giỏ hàng!`);
  };

  return (
    <div 
      className={Style.MenuCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={Style.MenuCard_left}>
        <Image
          src={background}
          alt="abc"
          className={Style.MenuCard_img}
        />
      </div>
      <div className={Style.MenuCard_right}>
        <div className={Style.MenuCard_right_name_price}>
          <h3 className={Style.MenuCard_title}>{name}</h3>
          <div className={Style.MenuCard_price}>
            <div className={Style.MenuCard_right_price_line}>
                <div className={Style.MenuCard_right_price_line_up}></div>
                <div className={Style.MenuCard_right_price_line_down}></div>
              </div>
            <div className={Style.MenuCard_right_price_box}>
              <p>{price}</p>
            </div>
          </div>
        </div>
        <p className={Style.MenuCard_description}>{description}</p>
      </div>
    </div> 
  )
};

export default MenuCard;