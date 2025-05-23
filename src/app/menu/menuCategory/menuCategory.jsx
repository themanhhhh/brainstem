"use client";
import React, { useState, useEffect, useRef } from "react";
import Style from "./menuCategory.module.css";
import Image from "next/image";
import images from "../../img/index";

const MenuCategory = ({ categories = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideRef = useRef(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Danh sách hình ảnh mặc định cho các danh mục
  const defaultImages = [
    images.specialmenu1,
    images.specialmenu2,
    images.specialmenu3,
    images.specialmenu4,
    images.specialmenu5,
    images.specialmenu6,
  ];

  // Số lượng item hiển thị trên màn hình
  const [itemsToShow, setItemsToShow] = useState(4);

  // Cập nhật số lượng items hiển thị khi resize window
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(1);
      } else if (window.innerWidth < 768) {
        setItemsToShow(2);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(3);
      } else {
        setItemsToShow(4);
      }
    };

    handleResize(); // Gọi ngay khi component mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tự động chuyển slide sau mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, categories.length]);

  // Xử lý chuyển slide
  const nextSlide = () => {
    if (categories.length <= itemsToShow) return;
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= categories.length ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    if (categories.length <= itemsToShow) return;
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? categories.length - 1 : prevIndex - 1
    );
  };

  // Xử lý sự kiện touch cho mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 150) {
      nextSlide();
    }

    if (touchStart - touchEnd < -150) {
      prevSlide();
    }
  };

  return (
    <div className={Style.container}>
      <p>• TASTE THE BEST THAT SURPRISE YOU</p>
      <h2 className={Style.title}>
        OUR SPECIAL <span>MENU</span>
      </h2>
      <p className={Style.subtitle}>
        Enjoy the unique dishes from the basilico restaurant that only our restaurant has, Fusce malesuada, lorem vitae euismod lobortis.
      </p>
      
      <div className={Style.sliderContainer}>
        {categories.length > itemsToShow && (
          <button className={`${Style.sliderButton} ${Style.prevButton}`} onClick={prevSlide}>
            &lt;
          </button>
        )}
        
        <div 
          className={Style.categoryList}
          ref={slideRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
            transition: 'transform 0.5s ease-in-out',
            display: 'flex',
          }}
        >
          {categories.map((category, index) => (
            <div 
              key={category.id} 
              className={Style.categoryItem}
              style={{ flex: `0 0 ${100 / itemsToShow}%` }}
            >
              {/* Sử dụng ảnh từ API nếu có, nếu không thì dùng ảnh mặc định */}
              <Image 
                src={category.imgUrl || defaultImages[index % defaultImages.length]} 
                alt={category.name} 
                width={100}
                height={100}
              />
              <span>{category.name}</span>
            </div>
          ))}
        </div>
        
        {categories.length > itemsToShow && (
          <button className={`${Style.sliderButton} ${Style.nextButton}`} onClick={nextSlide}>
            &gt;
          </button>
        )}
      </div>
      
      {/* Chỉ số trang */}
      {categories.length > itemsToShow && (
        <div className={Style.pagination}>
          {Array.from({ length: Math.ceil(categories.length / itemsToShow) }).map((_, index) => (
            <span 
              key={index} 
              className={`${Style.dot} ${Math.floor(currentIndex / itemsToShow) === index ? Style.activeDot : ''}`}
              onClick={() => setCurrentIndex(index * itemsToShow)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuCategory;