import React from "react";

import Style from "./menuSmallCard.module.css";
import Image from "next/image";
import Link from "next/link";

const MenuSmallCard = ({ id, name, price, description, image = null, imgUrl = null }) => {
  // Sử dụng imgUrl từ API nếu có, ngược lại dùng image từ prop
  const imageSource = imgUrl || image || "/placeholder-image.jpg";
  
  // Chuyển đổi price thành số nếu là chuỗi
  const displayPrice = typeof price === 'number' 
    ? price.toLocaleString('vi-VN') 
    : price;
  
  return (
    <Link href={`/product/${id}`}>
        <div className={Style.MenuCard}>
        <div className={Style.MenuCard_left}>
        <Image
            src={imageSource}
            alt={name}
            width={100}
            height={100}
            className={Style.MenuCard_img}
        />
        </div>
        <div className={Style.MenuCard_right}>
        <div className={Style.MenuCard_right_name_price}>
            <h3 className={Style.MenuCard_title}><p>{name}</p></h3>
            <div className={Style.MenuCard_price}>
              
              <div className={Style.MenuCard_right_price_box}>
                  <p>{displayPrice} $</p>
              </div>
            </div>
        </div>
        <p className={Style.MenuCard_description}>{description}</p>
        </div>
    </div>
    </Link> 
  )
}
  
export default MenuSmallCard;