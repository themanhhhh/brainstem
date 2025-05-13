import React from "react";
import Style from "./transactions.module.css";
import Search from "../../ui/dashboard/search/search";

const page = () => {
  return (
    <div className={Style.container}>
      <div className={Style.top}>
          <Search placeholder="Search for a transaction..."/>
      </div>
      <table className={Style.table}>
        <thead>
          <tr className={Style.textLeft}>
            <th className={Style.hiddenMd}>Order ID</th>
            <th>Date</th>
            <th>Price</th>
            <th className={Style.hiddenMd}>Products</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td >1237861238721</td>
            <td >19.07.2023</td>
            <td >89.90</td>
            <td >Big Burger Menu (2), Veggie Pizza (2), Coca Cola 1L (2)</td>
            <td >On the way (approx. 10min)...</td>
          </tr>
          <tr >
            <td >1237861238721</td>
            <td >19.07.2023</td>
            <td >89.90</td>
            <td >Big Burger Menu (2), Veggie Pizza (2), Coca Cola 1L (2)</td>
            <td >On the way (approx. 10min)...</td>
          </tr>
          <tr >
            <td >1237861238721</td>
            <td >19.07.2023</td>
            <td >89.90</td>
            <td >Big Burger Menu (2), Veggie Pizza (2), Coca Cola 1L (2)</td>
            <td >On the way (approx. 10min)...</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default page;
