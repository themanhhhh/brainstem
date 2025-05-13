"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsCheckCircle , BsCheckCircleFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa6";
import classNames from "classnames";
import { GiRibbonMedal } from "react-icons/gi";
import { PiMedalLight } from "react-icons/pi";


import Style from "./Brand.module.css";
import images from "../../img";
import { Button } from "../componentsindex";
import { Router } from "next/router";
import { motion } from "framer-motion";



const Brand = () => {
    const router = useRouter();
  return (
    <div className={Style.Brand}>
        <div className={Style.Brand_box}>
            <div className={Style.Brand_box_right}>
                <div className={Style.Brand_box_right_ellipse}>
                    <Image
                    className={Style.Brand_box_right_ellipse_image}
                    src={images.aboutusimg1}
                    alt="brand logo"
                    />
                </div>
                {/* <div className={classNames(Style.Brand_box_right_circle, page)}>
                    <Image 
                        src={images.aboutusimg2}
                        alt="About us 2" 
                        className={Style.Brand_box_right_small_image}
                    />
                </div> */}
            </div>
            <div className={Style.Brand_box_left}>
                <span className={Style.Brand_box_left_span}> • ART OF FINE DINING</span>
                <h1>OUR COMMITMENT TO AUTHENTICITY & <span className={Style.Brand_box_left_hightlight}>EXCELLENCE</span></h1>
                <br></br>
                <p>Every dish we create is a celebration of connection, crafted with passion and inspired by diverse flavors. Join us in an inviting space where every bite sparks joy and every moment becomes a cherished memory.</p>
                <br></br>
                <p><BsCheckCircleFill className={Style.Brand_box_left_icon}/>  Seasonal & Locally Sourced Ingredients</p>
                <p><BsCheckCircleFill className={Style.Brand_box_left_icon}/>  Vegetarian & Dietary-Friendly Options</p>
                <p><BsCheckCircleFill className={Style.Brand_box_left_icon}/>  Exquisite Pairings & Unique Flavors</p>
                <div className={Style.Brand_box_left_btn}>
                    <Button btnName="Order now" onClick={()=>router.push("/upload-nft")}/>
                    <Button btnName="Read more" onClick={()=>{}}/>
                </div>
            </div>
        </div>
        <motion.div
                    className={Style.Daily_box_right_description}
                    animate={{ x: [500, 700, 0] }}
                    transition={{
                        duration: 5.0,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                >
                <p className={Style.icon}><PiMedalLight/></p>
                <span>30 years of experience</span>
        </motion.div>
    </div>
  )
};

export default Brand; 