"use client";
import React from "react";
import Style from "./FAQ.module.css";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../componentsindex";
const faqData = [
  {
    question: "What are your restaurant's opening hours?",
    answer:
      "Our restaurant is open daily from 10:00 AM to 10:00 PM, ensuring you can enjoy delicious meals at your convenience. For special events or holiday hours, please check our website or contact us directly.",
  },
  {
    question: "Do you offer vegetarian or vegan options",
    answer:
      "Our restaurant is open daily from 10:00 AM to 10:00 PM, ensuring you can enjoy delicious meals at your convenience. For special events or holiday hours, please check our website or contact us directly.",
  },
  {
    question: "Can I make a reservation online ?",
    answer:
      "Our restaurant is open daily from 10:00 AM to 10:00 PM, ensuring you can enjoy delicious meals at your convenience. For special events or holiday hours, please check our website or contact us directly.",
  },
  {
    question: "Do you provide delivery or takeout services",
    answer: 
      "Our restaurant is open daily from 10:00 AM to 10:00 PM, ensuring you can enjoy delicious meals at your convenience. For special events or holiday hours, please check our website or contact us directly.",
  },
  {
    question: "Do you accommodate large groups or private events",
    answer: 
      "Our restaurant is open daily from 10:00 AM to 10:00 PM, ensuring you can enjoy delicious meals at your convenience. For special events or holiday hours, please check our website or contact us directly.",
  },
  {
    question: "Is there parking available at the restaurant",
    answer: 
      "Our restaurant is open daily from 10:00 AM to 10:00 PM, ensuring you can enjoy delicious meals at your convenience. For special events or holiday hours, please check our website or contact us directly.",
  },
  {
    question: "Do you have a kids' menu",
    answer: 
      "Our restaurant is open daily from 10:00 AM to 10:00 PM, ensuring you can enjoy delicious meals at your convenience. For special events or holiday hours, please check our website or contact us directly.",
  },
];

const FAQ = () => {
  const [active, setActive] = React.useState(null);
  const handleClick = (index) => {
    setActive(index === active ? null : index);
  };

  return (
    <div className={Style.FAQ}>
      <div className={Style.FAQ_box}>
        <div className={Style.FAQ_box_left}>
          <span className={Style.FAQ_box_left_span}> • FREQUENTLY ASKED QUESTIONS</span>
          <h1>GOT QUESTIONS? WE’VE <span className={Style.FAQ_box_left_hightlight}>GOT ANSWERS!</span></h1>
          <br></br>
          <p>Whether you’re curious about features, pricing, or getting started, we’ve got you covered. If you don’t find what you’re looking for, our team is always ready to assist you.</p>
          <br></br>
          <div className={Style.FAQ_box_left_btn}>
            <Button btnName="View All Question" onClick={()=>router.push("/upload-nft")}/>
          </div>
        </div>
        <div className={Style.FAQ_box_right}>
          {faqData.map((item, index) => (
          <div key={index} className={Style.FAQ_box_right_box}>
            <div
              className={Style.FAQ_box_right_box_item}
              onClick={() => handleClick(index)}
            >
              <h3 className={Style.FAQ_box_right_box_item_question}>
                {item.question}
              </h3>
              <span className={Style.FAQ_box_right_box_item_icon}>
                {active === index ? <CiCircleChevDown size={24}/> : <CiCircleChevUp size={24}/>}
              </span>
            </div>
            
            <AnimatePresence>
              {active === index && (
                <motion.p
                  className={Style.FAQ_box_right_box_item_answer}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {item.answer}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
