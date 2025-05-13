"use client";
import React , {useState,useEffect} from "react";
import { RiUserFollowFill, RiUserUnfollowFill , RiAwardLine } from "react-icons/ri";
import Image from "next/image";

import Style from "./Menu.module.css";
import images from "../../img";
import MenuCard from "./MenuCard/MenuCard";

const Menu = () => {
  const AppetizersArray = [
    {
      id: 1,
      background: images.pricemenuimg1,
      name: "CHIPS & DIP",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 2,
      background: images.pricemenuimg2,
      name: "CAPRESE SALAD",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 3,
      background: images.pricemenuimg3,
      name: "GARLIC FRIES",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 4,
      background: images.pricemenuimg4,
      name: "TORTILLA SOUP",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 5,
      background: images.pricemenuimg5,
      name: "KALE SALAD",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 6,
      background: images.pricemenuimg6,
      name: "THAI CURRY",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
  ];
  const MainCouresArray = [
    {
      id: 1,
      background: images.pricemenuimg6,
      name: "FISH FRY",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 2,
      background: images.pricemenuimg6,
      name: "PRAWN MASALA",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 3,
      background: images.pricemenuimg6,
      name: "PASTA ALFREDO",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 4,
      background: images.pricemenuimg6,
      name: "SUSHI PLATTER",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 5,
      background: images.pricemenuimg6,
      name: "VEG BIRYANI",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 6,
      background: images.pricemenuimg6,
      name: "MUTTON CURRY",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
  ];
  const SidesArray = [
    {
      id: 1,
      background: images.pricemenuimg1,
      name: "FRIES",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 2,
      background: images.pricemenuimg2,
      name: "VEGIES",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 3,
      background: images.pricemenuimg3,
      name: "CHIPS",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 4,
      background: images.pricemenuimg4,
      name: "MASH",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 5,
      background: images.pricemenuimg5,
      name: "SALAD",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 6,
      background: images.pricemenuimg6,
      name: "SLAW",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
  ];
  const DessertsArray = [
    {
      id: 1,
      background: images.pricemenuimg1,
      name: "TANG YUAN",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 2,
      background: images.pricemenuimg2,
      name: "EGG CUSTARD",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 3,
      background: images.pricemenuimg3,
      name: "ZABAIONE",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 4,
      background: images.pricemenuimg4,
      name: "ALMOND SOUP",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 5,
      background: images.pricemenuimg5,
      name: "BOMBOLONI",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
    {
      id: 6,
      background: images.pricemenuimg6,
      name: "TIRAMISU",
      price: "16.00$",
      description : "A perfect pairing of crispy, freshly made chips and rich, flavorful dips that bring a burst of taste in every bite."
    },
  ];

  const [appeptizers , setAppeptizers] = useState(true);
  const [maincoures , setMainCoures] = useState(false);
  const [sides , setSides] = useState(false);
  const [desserts, setDesserts] = useState(false);  

  const openAppeptizers = () =>{
    if(!appeptizers){
      setAppeptizers(true);
      setMainCoures(false);
      setSides(false);
      setDesserts(false);
    }
  }

  const openMainCoures = () =>{
    if(!maincoures){
      setAppeptizers(false);
      setMainCoures(true);
      setSides(false);
      setDesserts(false);
    }
  }

  const openSides = () =>{
    if(!sides){
      setAppeptizers(false);
      setMainCoures(false);
      setSides(true);
      setDesserts(false);
    }
  }
  const openDeserts = () =>{
    if(!desserts){
      setAppeptizers(false);
      setMainCoures(false);
      setSides(false);
      setDesserts(true);
    }
  }
  return (
    <div className={Style.Menu}>
      <div className={Style.Menu_title}>
        <span className={Style.Menu_title_span}> • FROM OUR MENU</span>
        <h2>AN INSPIRED MENU THAT<br/> <div className={Style.Menu_title_span_hightlight}>BLENDS TRADITION</div> </h2>
        <div className={Style.Menu_tabs}>
          <div className={Style.Menu_tabs_btn}>
            <button onClick={() => openAppeptizers()}>
               Appeptizers
            </button>
            <button onClick={() => openMainCoures()}>
              Main courses
            </button>
            <button onClick={() => openSides()}>
               Sides
            </button>
            <button onClick={() => openDeserts()}>
               Deserts
            </button>
          </div>
        </div>
      </div>
      {
        appeptizers &&(
          <div className={Style.Menu_box}>
            {
              AppetizersArray.map((el) =>(
                // console.log(el),
                <MenuCard 
                  key={el.id}  
                  name ={el.name}  
                  price={el.price} 
                  description={el.description}
                  background={el.background}
                />
              ))
            }
          </div>
        )
      }
      {
        maincoures &&(
          <div className={Style.Menu_box}>
            {
              MainCouresArray.map((el,i) =>(
                <MenuCard key={el.id}  
                name ={el.name}  
                price={el.price} 
                description={el.description}
                background={el.background} />
              ))
            }
          </div>
        )
      }
      {
        sides &&(
          <div className={Style.Menu_box}>
            {
              SidesArray.map((el,i) =>(
                <MenuCard key={el.id}  
                name ={el.name}  
                price={el.price} 
                description={el.description}
                background={el.background} />
              ))
            }
          </div>
        )
      }
      {
        desserts &&(
          <div className={Style.Menu_box}>
            {
              DessertsArray.map((el,i) =>(
                <MenuCard key={el.id}  
                  name ={el.name}  
                  price={el.price} 
                  description={el.description}
                  background={el.background} />
              ))
            }
          </div>
        )
      }
        <div className={Style.Menu_Route}>
            <p>Ready to Savor the Best? <a href="">Check Our Dishes!</a></p> 
        </div>
    </div>
  )
};

export default Menu;