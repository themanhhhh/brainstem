import React from "react";
import { Navbar } from "../../components/componentsindex";
import Style from "./Banner.module.css";


import Image from "next/image";
import images from "../../img/index";

const Banner = () => {
  return (
    <div className={Style.Banner}>
      <div className={Style.background}>
        <Image
          src={images.background}
          alt="Background"
          fill
          priority
          style={{
            objectFit: 'cover',
            opacity: 0.3
          }}
        />
      </div>
      <div className={Style.content}>
        <Navbar/>
        <div className={Style.content}>
            <h1 className={Style.title}>OUR MENU</h1>
            <p>Home / Menu</p>
          </div>
      </div>
    </div>
  )
}

export default Banner