"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsCheckCircle , BsCheckCircleFill } from "react-icons/bs";
import { StarBadge } from "../Icon/Star";
import { ChefHat } from "../Icon/Chef";
import Style from "./Adv.module.css";
import images from "../../img";
import { Button } from "../componentsindex";
import { Router } from "next/router";


const Adv = () => {
    const router = useRouter();
  return (
    <div className={Style.Adv}>
        <div className={Style.Adv_box}>
            <div className={Style.Adv_box_right}>
                <div className={Style.Adv_box_right_ellipse}>
                    <Image
                    className={Style.Adv_box_right_ellipse_image}
                    src={images.ouringredientsimg}
                    alt="brand logo"
                    />
                </div>
            </div>
            <div className={Style.Adv_box_left}>
                <span className={Style.Adv_box_left_span}> • OUR INGREDIENTS</span>
                <h1>CRAFTING DISHES WITH  <span className={Style.Adv_box_left_hightlight}>FRESHEST FLAVORS</span><br/></h1>
                <p>We take pride in using only the freshest, hand-picked ingredients that are free from preservatives and artificial additives. Taste the difference with every bite as we serve dishes made from nature’s finest.</p>
                <div className={Style.Adv_box_left_information}>
                    <div className={Style.Adv_box_left_information_box}>
                        <Image 
                            src={images.ing1}
                            width={50}
                            height={50}
                            alt="ing1"
                            className={Style.Adv_box_left_information_box_img1}
                        />
                        <h4>Best Qualities</h4>
                    </div>
                    <div className={Style.Adv_box_left_information_box}>
                    <Image 
                            src={images.ing2}
                            width={50}
                            height={50}
                            alt="ing2"
                            className={Style.Adv_box_left_information_box_img2}
                        />
                        <h4>Discount System</h4>
                    </div>
                    <div className={Style.Adv_box_left_information_box}>
                    <Image 
                            src={images.ing3}
                            width={50}
                            height={50}
                            alt="ing3"
                            className={Style.Adv_box_left_information_box_img3}
                        />
                        <h4>First Delivery</h4>
                    </div>
                </div>
                <div className={Style.Adv_box_left_btn}>
                    <Button btnName="Book Table" onClick={()=>router.push("/upload-nft")}/>               
                </div>
            </div>
        </div>
        <div className={Style.Adv_achiv}>
            <div className={Style.Adv_achiv_box}>
                <div className={Style.Adv_achiv_box_left}>
                    <ChefHat className={Style.Adv_achiv_box_left_icon}/>
                </div>
                <div className={Style.Adv_achiv_box_right}>
                    <h1>309</h1>
                    <p>Professional Chefs</p>
                </div>
            </div>
            <div className={Style.Adv_achiv_box}>
                <div className={Style.Adv_achiv_box_left}>
                    <ChefHat className={Style.Adv_achiv_box_left_icon}/>
                </div>
                <div className={Style.Adv_achiv_box_right}>
                    <h1>1000 +</h1>
                    <p>Delicious Dishes</p>
                </div>
            </div>
            <div className={Style.Adv_achiv_box}>
                <div className={Style.Adv_achiv_box_left}>
                    <ChefHat className={Style.Adv_achiv_box_left_icon}/>
                </div>
                <div className={Style.Adv_achiv_box_right}>
                    <h1>25 +</h1>
                    <p>Years Of Experience</p>
                </div>
            </div>
            <div className={Style.Adv_achiv_box}>
                <div className={Style.Adv_achiv_box_left}>
                    <ChefHat className={Style.Adv_achiv_box_left_icon}/>
                </div>
                <div className={Style.Adv_achiv_box_right}>
                    <h1>300 +</h1>
                    <p>Satisfied Clients</p>
                </div>
            </div>
        </div>
    </div>
  )
};

export default Adv;