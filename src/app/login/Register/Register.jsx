"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Style from "./Register.module.css";
import { Button } from "../../components/componentsindex.js";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Helper function to handle server errors
const handleServerError = (error) => {
  console.error('Registration error:', error);
  
  // Handle different types of server errors
  if (error.message?.includes('409') || error.message?.includes('already exists')) {
    return 'Username or email already exists. Please try with different credentials.';
  } else if (error.message?.includes('400') || error.message?.includes('invalid')) {
    return 'Invalid data provided. Please check your information.';
  } else if (error.message?.includes('422')) {
    return 'Email format is invalid. Please enter a valid email address.';
  } else if (error.message?.includes('500')) {
    return 'Server error. Please try again later.';
  } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  } else if (error.message?.includes('timeout')) {
    return 'Registration timeout. Please try again.';
  } else if (error.message) {
    // Return the actual error message from server if it's meaningful
    return error.message;
  } else {
    return 'Registration failed. Please try again.';
  }
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: ""
  });
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
    // Check required fields
    if (!formData.username.trim()) {
      toast.error('Username is required', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    
    if (!formData.fullName.trim()) {
      toast.error('Full name is required', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    
    if (!formData.phoneNumber.trim()) {
      toast.error('Phone number is required', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    
    // Validate username length
    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters long', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    
    // Validate password
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    
    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password confirmation does not match', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    
    // Validate phone number format (basic)
    const phoneRegex = /^[+]?[(]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error('Please enter a valid phone number', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      toast.loading('Creating your account...', { id: 'register' });
      
      await register(
        formData.fullName,
        formData.username,
        formData.password,
        formData.phoneNumber,
        formData.email
      );
      
      toast.success('Account created successfully! Please login to continue.', {
        id: 'register',
        duration: 4000,
        position: 'top-center'
      });
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err) {
      const errorMessage = handleServerError(err);
      toast.error(errorMessage, {
        id: 'register',
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.user}>
      <div className={Style.user_box}>
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

            <div className={Style.user_box_input_box}>
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

            <div className={Style.user_box_input_box}>
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
            </div>

            <div className={Style.user_box_input_box}>
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
            onClick={handleSubmit}
            btnName={loading ? "Creating Account..." : "Register"} 
            classStyle={Style.button}
            type="submit"
            disabled={loading}
          />
        </form>
        
        <div className={Style.user_box_back}>
          <a href="/">Back to home</a>
        </div>
      </div>
    </div>
  );
};

export default Register; 