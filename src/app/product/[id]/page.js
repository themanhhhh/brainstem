"use client"

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../styles/product.module.css";
import Price from "../productprice/productprice";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import Banner from '../banner/Banner';
import { Footer } from '../../components/componentsindex';
import Image from "next/image";
import images from "../../img/index";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

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
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  function handleAddToCart() {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
      
      toast.success("Added to cart!", {
        duration: 2000,
        position: "top-center"
      });

      setTimeout(() => {
        window.location.href = '/menu';
      }, 1000);
    }
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
            />
            <button 
              className={styles.addToCartButton}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
