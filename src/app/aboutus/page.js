import React from "react";
import Banner from "./banner/Banner";
import Approach from "./approach/approach";
import { Footer , FAQ} from "../components/componentsindex";
import {Brand, Reserve , Daily, Card} from "../components/componentsindex";
import Style from "../styles/aboutus.module.css";
import images from "./../img/index";

const page = () => {
  const teamArray = [
    {
      id : 1,
      image : images.team1,
      name : "abc",
      tokenId : "123",
    }
  ];
  return (
    <div className={Style.aboutus}>
      <Banner/>
      <Brand page="aboutus"/>
      <Approach/>
      <Daily/>
      {
        teamArray.map((el,i) => {
          <Card
            key={i} 
            el={el}
          />
      })
      }
      <Card/>
      <FAQ/>
      <Reserve/>
      <Footer/>
    </div>
  )
}

export default page