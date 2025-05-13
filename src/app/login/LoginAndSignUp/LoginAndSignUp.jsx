"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

//INTERNALIMPORT
import Style from "./LoginAndSignUp.module.css";
import images from "../../img";
import { Button } from "../../components/componentsindex.js";

const LoginAndSignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sử dụng hàm login từ AuthContext
      await login(formData.username, formData.password , formData.rememberMe);
      // Không cần xử lý chuyển hướng ở đây vì đã được xử lý trong AuthContext
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.user}>
      <div className={Style.user_box}>
        {error && (
          <div className={Style.error_message}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={Style.user_box_input}>
            <div className={Style.user_box_input_box}>
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

            <div className={Style.user_box_input_box}>
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
              <p>
                <a href="/forgot-password">Forget password</a>
              </p>
            </div>

            <div className={Style.remember_me}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                id="rememberMe"
                disabled={loading}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
          </div>

          <Button 
            btnName={loading ? "Loading..." : "Continue"} 
            classStyle={Style.button}
            type="submit"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default LoginAndSignUp;