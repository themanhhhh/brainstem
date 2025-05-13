"use client";
import React from "react";
import { TiArrowRightThick } from "react-icons/ti";
//Internal import

import Style from "./Button.module.css";

const Button = ({btnName, classStyle, type, disabled}) => {
  return (
    <div className={Style.box}>
        <button 
          className={`${Style.button} ${classStyle}`}
          type={type}
          disabled={disabled}
        >
          <span className={Style.btnText}>{btnName} </span>
        </button>
    </div>
  )
};

export default Button;