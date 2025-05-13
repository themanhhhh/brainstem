import React from "react";

import Style from "./menuSmallCard.module.css";
import Image from "next/image";
import Link from "next/link";

const menuSmallCard = ({id,name, price, description, image}) => {
  return (
    <Link href={`/product/${id}`}>
        <div className={Style.MenuCard}>
        <div className={Style.MenuCard_left}>
        <Image
            src={image}
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
    </Link> 
  )
}
  
export default menuSmallCard;