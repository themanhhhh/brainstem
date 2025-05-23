"use client";
import React, { useState, useEffect } from "react";
import { Footer, HeroSection, Navbar, Reserve } from "../components/componentsindex";
import Style from "../styles/menu.module.css";
import Banner from "./Banner/Banner";
import MenuCategory from "./menuCategory/menuCategory";
import MenuCard from "./menuCard/menuCard";
import { foodService } from "../api/food/foodService";
import { categoryService } from "../api/category/categoryService";

const MenuPage = () => {
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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách danh mục đang hoạt động
        const categoryResponse = await categoryService.getCategoryView();
        if (categoryResponse && categoryResponse.data) {
         
          const categoriesData = Array.isArray(categoryResponse.data) ? categoryResponse.data : categoryResponse.data.content;
          setCategories(categoriesData || []);
          console.log("Categories loaded:", categoriesData);
        }
        // Lấy danh sách món ăn
        const foodResponse = await foodService.getFoodView();
        console.log("Food response:", foodResponse);
        
        if (foodResponse) {
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
        }
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className={Style.loading}>Đang tải...</div>;
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