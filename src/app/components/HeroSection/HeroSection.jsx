"use client";
import React , {useState , useEffect, useContext} from "react";
import Image from "next/image";

import Style from "./HeroSection.module.css";
import { Button } from "../componentsindex";
import images from "../../img";


 const HeroSection = () => {
    
  return (
    <div className={Style.heroSection}>
        <div className={Style.heroSection_box}>
            <div className={Style.heroSection_box_left}>
                <span > • </span>
                ART OF FINE DINING
                <h1>DINING REDEFINED WITH <span className={Style.heroSection_box_left_hightlight}>  EVERY BITE
                    </span>
                </h1>
                <p>
                Immerse yourself in a dining experience like no other, where every dish is a masterpiece of flavor, crafted with care and precision. From the freshest ingredients.
                </p>
                <Button btnName="Book a table" handleClick={()=>{}}/>
            </div>
            <div className={Style.heroSection_box_right}>
                <div className={Style.heroSection_box_right_ellipse}>
                    <Image  
                        src={images.heroimg} 
                        alt="Main Interior" 
                        className={Style.heroSection_box_right_ellipse_main_image} 
                    />
                </div>
                <div className={Style.heroSection_box_right_ellipse_circle1}>
                    <Image 
                        src={images.heroimg2}
                        alt="Food 1" 
                        className={Style.heroSection_box_right_ellipse_small_image}
                    />
                </div>
                <div className={Style.heroSection_box_right_ellipse_circle2}>
                    <Image
                        src={images.heroimg3} 
                        alt="Food 2" 
                        className={Style.heroSection_box_right_ellipse_small_image} 
                    />
                </div>
            </div>
        </div>
    </div>
  )
};

export default HeroSection;