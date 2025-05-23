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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách danh mục đang hoạt động
        const categoryResponse = await categoryService.getCategoryView();
        if (categoryResponse && categoryResponse.data) {
          // Kiểm tra xem data có phải là array không, nếu có content thì lấy content, nếu không thì lấy data trực tiếp
          const categoriesData = Array.isArray(categoryResponse.data) ? categoryResponse.data : categoryResponse.data.content;
          setCategories(categoriesData || []);
          console.log("Categories loaded:", categoriesData);
        }
        // Lấy danh sách món ăn
        const foodResponse = await foodService.getFoodView();
        if (foodResponse && foodResponse.data) {
          // Kiểm tra xem data có phải là array không, nếu có content thì lấy content, nếu không thì lấy data trực tiếp
          const foodsData = Array.isArray(foodResponse.data) ? foodResponse.data : foodResponse.data.content;
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
      <MenuCategory categories={categories} />

      {categories && categories.length > 0 && 
        categories
          .sort((a, b) => a.id - b.id) // Sắp xếp theo ID để có thứ tự nhất quán
          .map((category, idx) => {
            const categoryFoods = (foods && Array.isArray(foods)) ? foods.filter(food => food.categoryId === category.id) : [];
            console.log(`Category ${category.name} (ID: ${category.id}) has ${categoryFoods.length} foods:`, categoryFoods);
            
            return (
              <MenuCard
                key={category.id}
                category={category.name}
                items={categoryFoods}
                className={idx % 2 === 0 ? Style.menuCardOdd : Style.menuCardEven}
              />
            );
          })}

      <Reserve />
      <Footer />
    </div>
  );
};

export default MenuPage;