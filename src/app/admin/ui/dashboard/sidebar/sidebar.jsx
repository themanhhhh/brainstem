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
import { RiListOrdered } from "react-icons/ri";
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
        path: "/admin/dashboard",
        icon: <MdDashboard />,
      },
      {
        title: "Users",
        path: "/admin/dashboard/users",
        icon: <MdSupervisedUserCircle />,
      },
      {
        title: "Category",
        path: "/admin/dashboard/category",
        icon: <BiCategoryAlt />,
      },
      {
        title: "Foods Management",
        path: "/admin/dashboard/products",
        icon: <IoFastFoodOutline />,
      },
      {
        title: "Discounts",
        path: "/admin/dashboard/discount",
        icon: <MdLocalOffer />,
      },
      {
        title: "Transactions",
        path: "/admin/dashboard/transactions",
        icon: <MdAttachMoney />,
      },
      {
        title: "Table",
        path: "/admin/dashboard/table",
        icon: <MdTableRestaurant />,
      },
      {
        title: "Order",
        path: "/admin/dashboard/order",
        icon: <RiListOrdered />,
      },
    ],
  },
  {
    title: "Analytics",
    list: [
      {
        title: "Revenue",
        path: "/admin/dashboard/revenue",
        icon: <MdWork />,
      },
      {
        title: "Reports",
        path: "/admin/dashboard/reports",
        icon: <MdAnalytics />,
      },
      {
        title: "Teams",
        path: "/admin/dashboard/teams",
        icon: <MdPeople />,
      },
    ],
  },
  {
    title: "User",
    list: [
      {
        title: "Settings",
        path: "/admin/dashboard/settings",
        icon: <MdOutlineSettings />,
      },
      {
        title: "Help",
        path: "/admin/dashboard/help",
        icon: <MdHelpCenter />,
      },
      {
        title: "Log",
        path: "/admin/dashboard/log",
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