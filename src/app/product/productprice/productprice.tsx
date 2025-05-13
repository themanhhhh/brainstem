"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../components/componentsindex";
import styles from "./productprice.module.css";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Props = {
  price: number;
  id: number;
  name: string;
  options?: { title: string; additionalPrice: number }[];
};

const Price = ({ price, id, name, options }: Props) => {
  const [total, setTotal] = useState(price);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState(0);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    setTotal(
      quantity * (options ? price + options[selected].additionalPrice : price)
    );
  }, [quantity, selected, options, price]);

  const handleAddToCart = () => {
    const selectedOption = options ? options[selected] : null;
    
    addToCart({
      id,
      name,
      price,
      quantity,
      option: selectedOption?.title,
      additionalPrice: selectedOption?.additionalPrice
    });
    
    toast.success("Added to cart!");
  };

  return (
    <div className={styles.Price_container}>
      <h2 className={styles.Price_totalPrice}>${total.toFixed(2)}</h2>

      {/* OPTIONS CONTAINER */}
      <div className={styles.Price_optionsContainer}>
        {options?.map((option, index) => (
          <button
            key={option.title}
            className={`${styles.Price_optionButton} ${
              selected === index ? styles.Price_optionButtonSelected : ""
            }`}
            onClick={() => setSelected(index)}
          >
            {option.title}
          </button>
        ))}
      </div>

      {/* QUANTITY AND ADD BUTTON CONTAINER */}
      <div className={styles.Price_actionsContainer}>
        {/* QUANTITY */}
        <div className={styles.Price_quantityContainer}>
          <span>Quantity</span>
          <div className={styles.Price_quantityControls}>
            <button className={styles.Price_setquantity}
              onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
            >
              {"<"}
            </button>
            <span>{quantity}</span>
            <button className={styles.Price_setquantity}
              onClick={() => setQuantity((prev) => (prev < 9 ? prev + 1 : 9))}
            >
              {">"}
            </button>
          </div>
        </div>
        {/* CART BUTTON */}
        <button 
          className={styles.Price_cartButton}
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Price;
