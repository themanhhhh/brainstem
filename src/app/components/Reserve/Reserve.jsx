import React from "react";
import Image from "next/image";
import Style from "./Reserve.module.css";
import images from "../../img";
import Form from "./ReserveForm/ReserveForm";

const Reserve = () => {
  return (
    <div className={Style.Reserve}>
        <div className={Style.Reserve_box}>
            <div className={Style.Reserve_box_left}>
                <div className={Style.Reserve_box_left_title}>
                    <span> • RESERVE A TABLE</span>
                </div>
                <div className={Style.Reserve_box_left_maintain}>
                    <h1>RESERVE NOW YOUR TABLE AND <span className={Style.Reserve_box_left_maintain_hightlight}> ENJOY DINING EXPERIENCE</span></h1>
                </div>
                <div className={Style.Reserve_box_left_information}>
                    <h3>Open Hours</h3>
                    <div className={Style.Reserve_box_left_information_time}>
                        <p>Mon - Thu </p>
                        <p >10:00 AM - 8:00 PM</p>
                    </div>
                    <div className={Style.Reserve_box_left_information_time}>
                        <p>Fri - Sat </p>
                        <p>  09:00 AM - 10:00PM</p>
                    </div>
                    <div className={Style.Reserve_box_left_information_time}>
                        <p>Sun </p>
                        <p>Close</p>
                    </div>
                </div>
            </div>
            <div className={Style.Reserve_box_right}>
                <div className={Style.Reserve_box_right_table}>
                    <Form/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Reserve