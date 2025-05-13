import React from "react";
import { Navbar } from "../../components/componentsindex";
import Style from "./Banner.module.css";

const Banner = () => {
  return (
    <div className={Style.Banner}>
        <div className={Style.Banner_img}></div>
        <Navbar/>
        <div className={Style.content}>
          <h1 className={Style.title}>ABOUT US</h1>
          <p>Home / About us</p>
        </div>
    </div>
    
  )
}

export default Banner