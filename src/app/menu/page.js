"use client";
import React, { useState, useEffect } from "react";
import { Footer, HeroSection, Navbar, Reserve, Loader } from "../components/componentsindex";
import Style from "../styles/menu.module.css";
import Banner from "./Banner/Banner";
import MenuCategory from "./menuCategory/menuCategory";
import MenuCard from "./menuCard/menuCard";
import { useLanguageService } from "../hooks/useLanguageService";
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const MenuPage = () => {
  const { foodService, categoryService, language } = useLanguageService();
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function để scroll đến category cụ thể
  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      // Tính toán offset để scroll đúng vị trí
      const headerHeight = 80; // Chiều cao header/navbar
      const extraOffset = 20; // Khoảng cách thêm cho đẹp
      const elementPosition = element.offsetTop - headerHeight - extraOffset;
      
      // Smooth scroll
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      
      // Thêm hiệu ứng highlight tạm thời
      element.style.transition = 'box-shadow 0.5s ease';
      element.style.boxShadow = '0 0 20px rgba(170, 169, 123, 0.5)';
      
      // Xóa hiệu ứng sau 2 giây
      setTimeout(() => {
        element.style.boxShadow = 'none';
      }, 2000);
    }
  };
  
  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy danh sách danh mục đang hoạt động
      const categoryResponse = await categoryService.getCategoryView();
      
      // Kiểm tra lỗi từ category response
      if (categoryResponse && (categoryResponse.code >= 400 || categoryResponse.error || categoryResponse.status >= 400)) {
        const errorMessage = getErrorMessage(categoryResponse, "Không thể tải danh sách danh mục");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setCategories([]);
      } else if (categoryResponse && categoryResponse.data) {
        const categoriesData = Array.isArray(categoryResponse.data) ? categoryResponse.data : categoryResponse.data.content;
        setCategories(categoriesData || []);
        console.log("Categories loaded:", categoriesData);
        toast.success(`Đã tải ${categoriesData?.length || 0} danh mục`, {
          duration: 2000,
          position: "top-right"
        });
      }
      
      // Lấy danh sách món ăn
      const foodResponse = await foodService.getFoodView();
      console.log("Food response:", foodResponse);
      
      // Kiểm tra lỗi từ food response
      if (foodResponse && (foodResponse.code >= 400 || foodResponse.error || foodResponse.status >= 400)) {
        const errorMessage = getErrorMessage(foodResponse, "Không thể tải danh sách món ăn");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setFoods([]);
      } else if (foodResponse) {
        // Kiểm tra cấu trúc response - có thể là array trực tiếp hoặc wrapped trong data
        let foodsData;
        if (Array.isArray(foodResponse)) {
          // Response trả về trực tiếp là array
          foodsData = foodResponse;
        } else if (foodResponse.data) {
          // Response có wrapper data
          foodsData = Array.isArray(foodResponse.data) ? foodResponse.data : foodResponse.data.content;
        } else {
          foodsData = [];
        }
        
        setFoods(foodsData || []);
        console.log("Foods loaded:", foodsData);
        toast.success(`Đã tải ${foodsData?.length || 0} món ăn`, {
          duration: 2000,
          position: "top-right"
        });
      }
      setError(null);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [language]); // Thêm language vào dependency để gọi lại API khi đổi ngôn ngữ

  if (loading) return <Loader />;
  if (error) return <div className={Style.error}>{error}</div>;

  return (
    <div className={Style.menu}>
      <Banner />
      <MenuCategory 
        categories={categories} 
        onCategoryClick={scrollToCategory}
      />

      {categories && categories.length > 0 && 
        categories
          .sort((a, b) => a.id - b.id) // Sắp xếp theo ID để có thứ tự nhất quán
          .map((category, idx) => {
            const categoryFoods = (foods && Array.isArray(foods)) ? foods.filter(food => food.categoryId === category.id) : [];
            console.log(`Category ${category.name} (ID: ${category.id}) has ${categoryFoods.length} foods:`, categoryFoods);
            
            return (
              <div 
                key={category.id}
                id={`category-${category.id}`}
                style={{ scrollMarginTop: '100px' }} // Offset để tránh bị che bởi fixed header
              >
                <MenuCard
                  category={category.name}
                  items={categoryFoods}
                  className={idx % 2 === 0 ? Style.menuCardOdd : Style.menuCardEven}
                />
              </div>
            );
          })}

      <Reserve />
      <Footer />
    </div>
  );
};

export default MenuPage;