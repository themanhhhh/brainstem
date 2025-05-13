"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsCheckCircle , BsCheckCircleFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa6";
import { motion } from "framer-motion";


import Style from "./Daily.module.css";
import images from "../../img";
import { Button } from "../componentsindex";
import { Router } from "next/router";


const Daily = () => {
    const router = useRouter();
  return (
    <div className={Style.Daily}>
        <div className={Style.Daily_box}>
            <div className={Style.Daily_box_right}>
                <Image
                className={Style.Daily_box_right_image}
                src={images.dailyoffer}
                alt="daily offer"
                />
            </div>
            <div className={Style.Daily_box_left}>
                <span className={Style.Daily_box_left_span}> • OUR DAILY OFFERS</span>
                <h1>TASTE THE SAVINGS WITH OUR <span className={Style.Daily_box_left_hightlight}>DAILY SPECIALS</span></h1>
                <br></br>
                <p>Every day is an opportunity to enjoy your favorites at a discounted price. Explore our daily rotating specials and indulge in flavorful meals at a fraction of the cost.</p>
                <br></br>
                <p><BsCheckCircleFill className={Style.Daily_box_left_icon}/>  Seasonal & Locally Sourced Ingredients</p>
                <p><BsCheckCircleFill className={Style.Daily_box_left_icon}/>  Vegetarian & Dietary-Friendly Options</p>
                <p><BsCheckCircleFill className={Style.Daily_box_left_icon}/>  Exquisite Pairings & Unique Flavors</p>
                <div className={Style.Daily_box_left_btn}>
                    <Button btnName="Book Table" onClick={()=>router.push("/upload-nft")}/>
                    <Button btnName="Explore Menu" onClick={()=>{}}/>
                </div>
            </div>
        </div>
        <motion.div
                    className={Style.Daily_box_right_description}
                    animate={{ x: [350, 500, 0] }}
                    transition={{
                        duration: 3.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                >
                <span className={Style.Daily_box_right_description_span}>Delicious Burger</span>
                <p>
                    <FaStar className={Style.star}/>
                    <FaStar className={Style.star}/>
                    <FaStar className={Style.star}/>
                    <FaStar className={Style.star}/>
                    <FaStar className={Style.star}/>
                </p>
                <p><BsCheckCircleFill/> Tomato Sauces</p>
                <p><BsCheckCircleFill/> Vegitables</p>
                <p><BsCheckCircleFill/> Lettuce</p>
                <p><BsCheckCircleFill/> Cheese slice</p>
        </motion.div>
    </div>
  )
};

export default Daily;