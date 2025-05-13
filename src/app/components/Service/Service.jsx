import React from "react";
import Image from "next/image";
import Style from "./Service.module.css";
import images from "../../img";

const Service = () => {
  return (
    <div className={Style.service}>
        <div className={Style.service_box_text_center}>
            <h2 className={Style.service_box_text_center_small}>• Our Main Dishes</h2>
            <h1 className={Style.service_box_text_center_large}>
            SATISFY YOUR CRAVINGS WITH <br /> OUR <span className={Style.service_box_text_center_large_hightlight}>SIGNATURE MAINS</span>
            </h1>
        </div>
        <div className={Style.service_box}>
            <div className={Style.service_box_item}>
                <Image 
                src={images.ourmaindishesimg1}
                alt="Filter & Discover"
                className={Style.service_box_item_img}
                />
                <h3>Soups</h3>
                <p>Warm, comforting, and full of flavor, our soups avre the perfect start to any meal.</p>
            </div>

            <div className={Style.service_box_item}>
                <Image 
                src={images.ourmaindishesimg2}
                alt="Filter & Discover"
                className={Style.service_box_item_img}
                />
                <h3>Salads</h3>
                <p>Refreshing, vibrant, and full of fresh flavors, our salads are crafted to senses.</p>
            </div>
            <div className={Style.service_box_item}>
                <Image 
                src={images.ourmaindishesimg3}
                alt="Connect Wallet"
                className={Style.service_box_item_img}
                />
                <h3>Main Dishes</h3>
                <p>Offering bold flavors and expertly crafted recipes that cater to every taste.</p>
            </div>
            <div className={Style.service_box_item}>
                <Image 
                src={images.ourmaindishesimg4}
                alt="Filter & Discover"
                className={Style.service_box_item_img}
                />
                <h3>Appetizers</h3>
                <p>Our appetizers are the perfect way to begin your dining experience flavors.</p>
            </div>
        </div>
    </div>
  )
}

export default Service