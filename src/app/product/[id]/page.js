"use client"

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../../styles/product.module.css";
import Price from "../productprice/productprice";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Banner from '../banner/Banner';
import { Footer, Button } from '../../components/componentsindex';
import Image from "next/image";
import images from "../../img/index";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/product/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        data.price = parseFloat(data.price.replace('$', ''));
        setProduct(data);
        setTotalPrice(data.price);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Cập nhật tổng giá khi thay đổi số lượng hoặc tùy chọn
  useEffect(() => {
    if (product) {
      const optionPrice = product.options 
        ? product.options[selectedOption].additionalPrice 
        : 0;
      setTotalPrice(quantity * (product.price + optionPrice));
    }
  }, [quantity, selectedOption, product]);

  // Hàm xử lý khi số lượng thay đổi
  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  // Hàm xử lý khi tùy chọn thay đổi
  const handleOptionChange = (newSelectedOption) => {
    setSelectedOption(newSelectedOption);
  };

  function handleAddToCart() {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng", {
        duration: 2000,
        position: "top-center"
      });
      
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      return;
    }
    
    if (product) {
      const option = product.options ? product.options[selectedOption] : null;
      
      const success = addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        option: option?.title,
        additionalPrice: option?.additionalPrice
      });
      
      if (success) {
        toast.success("Đã thêm vào giỏ hàng!", {
          duration: 2000,
          position: "top-center"
        });

        setTimeout(() => {
          window.location.href = '/menu';
        }, 1000);
      }
    }
  }

  function handleLoginRedirect() {
    router.push('/login');
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const productImage = images[product.image];

  return (
    <div className={styles.product}>
      <Banner
        Name={product.name}
      />
      <div className={styles.product_box}>
        <div className={styles.product_box_content}>
          <div className={styles.product_box_content_left}>
            {productImage ? (
              <Image 
                src={productImage}
                alt={product.name}
                width={500}
                height={300}
                priority
                className={styles.product_image}
              />
            ) : (
              <div>No image available</div>
            )}
          </div>
          <div className={styles.product_box_content_right}>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <Price 
              price={product.price} 
              id={product.id} 
              name={product.name}
              options={product.options}
              onQuantityChange={handleQuantityChange}
              onOptionChange={handleOptionChange}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
