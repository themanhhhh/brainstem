"use client";
import React from "react";

//INTERNAL IMPORT
import Style from "../styles/login.module.css";
import Register from "../login/Register/Register";

const RegisterPage = () => {
  return (
    <div className={Style.login}>
      <div className={Style.login_box}>
        <h1>Register</h1>
        <Register />
        <p className={Style.login_box_para}>
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 