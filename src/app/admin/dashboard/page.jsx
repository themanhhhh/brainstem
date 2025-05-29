"use client";
import React from "react";
import LogoutButton from "../../components/LogoutButton/LogoutButton";
import Style from "./page.module.css";
import { 
  Card ,
  Transactions ,
  Chart,
  NumberCard
 } from '../ui/dashboard/dashboardindex';

import styles from "../styles/dashboard.module.css";

const Dashboard = () => {
  const numbercards = [
    {
      title1: "Total Stock",
      title2: "18"
    },
    {
      title1: "Total Item Sell",
      title2: "1"
    },
    {
      title1: "Total Revenue",
      title2: "$123"
    },
  ]
  return (
    <div className={Style.dashboard}>
      
      <div className={Style.content}>
        <div className={styles.wrapper}>
          <div className={styles.main}>
          <div className={Style.numbercards}>
          {
            numbercards.map((item, index) => (
              <NumberCard key={index} title1={item.title1} title2={item.title2} />
            ))
          }
        </div>
            <Transactions/>
            <Chart/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;