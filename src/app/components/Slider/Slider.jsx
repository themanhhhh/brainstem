"use client";
import React, { useState } from "react";
import Style from "./Slider.module.css";
import { TiArrowLeftThick, TiArrowRightThick } from "react-icons/ti";

// Ví dụ import SliderCard và ảnh
import SliderCard from "./SliderCard/SliderCard";
import images from "../../img";

const Slider = () => {
  // Mảng dữ liệu demo
  const sliderArray = [
    {
      id: 1,
      background: images.author1,
      user: "Manh",
      description:
        "From the moment we walked in, the ambiance was welcoming, and the service was top-notch. The dish was absolutely delicious, full of fresh flavors , and perfectly cooked . I especially loved how the staff took the time to explain the menu and suggest pairings for our meal.",
    },
    {
      id: 2,
      background: images.author2,
      user: "Quy",
      description:
        "From the moment we walked in, the ambiance was welcoming, and the service was top-notch. The dish was absolutely delicious",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < sliderArray.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Chuyển về slide trước
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // Nếu muốn quay vòng về slide cuối
      setCurrentIndex(sliderArray.length - 1);
    }
  };

  return (
    <div className={Style.slider}>
      <div className={Style.slider_box}>
        {/* Phần tiêu đề */}
        <div className={Style.Story_box_title}>
          <p className={Style.hightlight}>• OUR TESTIMONIALS</p>
          <h1>REAL STORIES OF MEMORABLE<br/><span className={Style.hightlight}>MEALS AND EXPERIENCE</span> </h1>
        </div>

        {/* Vùng bao tất cả slide */}
        <div className={Style.slider_container}>
          <div
            className={Style.slider_track}
           
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {sliderArray.map((el) => (
              <div className={Style.slider_item} key={el.id}>
                <SliderCard
                  user={el.user}
                  image={el.background}
                  description={el.description}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hai nút điều hướng */}
        <div className={Style.navigation}>
          <TiArrowLeftThick onClick={handlePrev} />
          <TiArrowRightThick onClick={handleNext} />
        </div>
      </div>
    </div>
  );
};

export default Slider;
