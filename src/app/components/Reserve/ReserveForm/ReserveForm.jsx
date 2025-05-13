"use client";
import React, { use, useCallback } from "react";
import {HiOutlineMail} from "react-icons/hi";
import { MdOutlineHttp, MdOutlineContentCopy } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import { CiTimer } from "react-icons/ci";
import { GoPersonAdd } from "react-icons/go";
import { 
  TiSocialFacebook,
  TiSocialTwitter,
  TiSocialInstagram
 } from "react-icons/ti";
 import { FaPhoneAlt } from "react-icons/fa";

import Style from "./ReserveForm.module.css";
import { Button } from "../../componentsindex";

const Form = () => {


  return (
    <div className={Style.Form}>
      <div className={Style.Form_box}>
        <form>
          <div className={Style.Form_box_input}>
            <label htmlFor="name">Username</label>
            <input 
              type="text" 
              placeholder="e.g John"  
              className={Style.Form_box_input_userName}
            />
          </div>

          <div className={Style.Form_box_contact}>
            <div className={Style.Form_box_contact_input}>
                <label htmlFor="email">Email</label>
                <div className={Style.Form_box_contact_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                    <HiOutlineMail/>
                </div>
                <input type="text" placeholder="e.g.John@example.com" className={Style.Form_box_input_Email}/>
                </div>
            </div>
            <div className={Style.Form_box_contact_input}>
                <label htmlFor="email">Phone Number</label>
                <div className={Style.Form_box_contact_input_box}>
                    <div className={Style.Form_box_input_box_icon}>
                        <FaPhoneAlt/>
                    </div>
                    <input type="text" placeholder="e.g + 123 456 789 2" className={Style.Form_box_input_Email}/>
                </div>
            </div>
          </div>
          <div className={Style.Form_box_input_social}>
            <div className={Style.Form_box_input}> 
              <label htmlFor="date">Date </label>
              <div className={Style.Form_box_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                  <CiCalendarDate/>
                </div>
                <input type="date"  />
              </div>
            </div>
            <div className={Style.Form_box_input}> 
              <label htmlFor="time">Time</label>
              <div className={Style.Form_box_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                  <CiTimer/>
                </div>
                <input type="text" placeholder="" />
              </div>
            </div>
            <div className={Style.Form_box_input}> 
              <label htmlFor="Instagram">Number of person</label>
              <div className={Style.Form_box_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                  <GoPersonAdd/>
                </div>
                <input type="text" placeholder="" />
              </div>
            </div>
          </div>

          <div className={Style.Form_box_btn}>
            <button 
            onClick={()=>{}}
            className={Style.button}
            >
                <span className={Style.btnText}>Reserve Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
};

export default Form;