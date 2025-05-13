"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Style from "./Register.module.css";
import { Button } from "../../components/componentsindex.js";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.fullName,
        formData.username,
        formData.password,
        formData.phoneNumber,
        formData.email
      );
      
      // Chuyển hướng về trang login sau khi đăng ký thành công
      router.push('/login');
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.register}>
      <div className={Style.register_box}>
        <h2>Đăng ký tài khoản</h2>
        {error && (
          <div className={Style.error_message}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={Style.register_box_input}>
            <div className={Style.register_box_input_box}>
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username" 
                required
                disabled={loading}
              />
            </div>

            <div className={Style.register_box_input_box}>
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className={Style.register_box_input_box}>
              <label htmlFor="fullName">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>

            <div className={Style.register_box_input_box}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
                disabled={loading}
              />
            </div>

            <div className={Style.register_box_input_box}>
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <div className={Style.register_box_input_box}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Enter your password again"
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button 
            btnName={loading ? "Processing..." : "Register"} 
            classStyle={Style.button}
            type="submit"
            disabled={loading}
          />
  
          <p className={Style.login_link}>
            Đã có tài khoản? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register; 