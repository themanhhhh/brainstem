import Image from "next/image";
import MenuLink from "./menu/menuLink";
import styles from "./sidebar.module.css";
import {
  MdDashboard,
  MdSupervisedUserCircle,
  MdShoppingBag,
  MdAttachMoney,
  MdWork,
  MdAnalytics,
  MdPeople,
  MdOutlineSettings,
  MdHelpCenter,
  MdLogout,
  MdLocalOffer,
} from "react-icons/md";
import { IoFastFoodOutline } from "react-icons/io5";
import { BiCategoryAlt } from "react-icons/bi";
import { MdTableRestaurant } from "react-icons/md";
import { LuSquareActivity } from "react-icons/lu";
import { Style } from "@mui/icons-material";

const menuItems = [
  {
    title: "Pages",
    list: [
      {
        title: "Dashboard",
        path: "/manager/dashboard",
        icon: <MdDashboard />,
      },
      {
        title: "Users",
        path: "/manager/dashboard/users",
        icon: <MdSupervisedUserCircle />,
      },
      {
        title: "Category",
        path: "/manager/dashboard/category",
        icon: <BiCategoryAlt />,
      },
      {
        title: "Foods",
        path: "/manager/dashboard/products",
        icon: <IoFastFoodOutline />,
      },
      {
        title: "Order Table",
        path: "/manager/dashboard/ordertable",
        icon: <MdTableRestaurant />,
      },
    ],
  },
  {
    title: "User",
    list: [
      
      {
        title: "Log",
        path: "/manager/dashboard/log",
        icon: <LuSquareActivity/>
      }
    ],
  },
];

const Sidebar = async () => {
  return (
    <div className={styles.container}>
      <ul >
        {menuItems.map((cat) => (
          <li key={cat.title}>
            <span className={styles.cat}>
              {cat.title}
            </span>
            {cat.list.map((item) => (
              <MenuLink key={item.title} item={item}>
                {/* {item.title} */}
              </MenuLink>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;