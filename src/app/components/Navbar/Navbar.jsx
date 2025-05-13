"use client";
import React, {useState, useEffect, useContext} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
//import icon
import {MdNotifications} from "react-icons/md";
import {BsSearch} from "react-icons/bs";
import {CgMenuLeft,CgMenuRight} from "react-icons/cg";
import {DiJqueryLogo} from "react-icons/di";
import { FaAngleDown } from "react-icons/fa6";

// Internal import
import Style from "./Navbar.module.css";
import {Discover,HelpCenter,Notification,Profile,SideBar} from "./index"
import {Button,Error} from "../componentsindex";
import images from "../../img";
import CartIcon from "./CartIcon/CartIcon";
import { useAuth } from "../../context/AuthContext";

// Import from smart contract

const Navbar = () => {
    //Use state components
    const [discover , setDiscover] = useState(false);
    const [help , setHelp] = useState(false);
    const [notification , setNotification] = useState(false);
    const [profile , setProfile] = useState(false);
    const [openSideMenu , setOpenSideMenu] = useState(false);
    const { user, logout } = useAuth();
    const router = useRouter();

    const openHelp = () => {
        if(!help){
            setDiscover(false);
            setHelp(true);
            setProfile(false);
            setNotification(false);
        }
        else{
            setHelp(false)
        }
    };

    const openSideBar = () => {
        if(!openSideMenu){
            setOpenSideMenu(true);
        } else {
            setOpenSideMenu(false);
        }
    };

    const openProfile = () => {
        if(!profile){
            setDiscover(false);
            setHelp(false);
            setProfile(true);
        }
        else{
            setProfile(false);
        }
    };

    const handleLoginClick = () => {
        router.push('/login');
    };

    return  (
        <div className={Style.navbar}>
            <div className={Style.navbar_container}>
                <div className={Style.navbar_container_left}>
                    <div className={Style.logo}>
                        <Image src={images.logo} alt="footer logo" height={150} width={150} />
                    </div>
                </div>
                <div className={Style.navbar_container_right}>
                    <div className={Style.navbar_container_right_discover}>
                        {/*About us*/}
                        <Link href="/aboutus">
                            <p>About us</p>
                        </Link>
                    </div>
                    <div className={Style.navbar_container_right_services}>
                        {/*Services*/}
                        <Link href="/service">
                            <p>Services</p>
                        </Link>
                    </div>
                    <div className={Style.navbar_container_right_menu}>          
                        <Link href="/menu">
                            <p>Menu</p>
                        </Link>
                    </div>
                    {/*Help Center*/}
                    <div className={Style.navbar_container_right_help}>
                        <p onClick={()=>openHelp()}>Help Center <FaAngleDown/></p>
                        {
                            help && (
                                <div className={Style.navbar_container_right_help_box}>
                                    <HelpCenter setHelp={setHelp}/>
                                </div>
                            )
                        }
                    </div>

                    <div className={Style.navbar_container_right_button}>
                        <Button btnName="Book a table"/>
                    </div>
          
                    {/*Cart Icon*/}
                    <Link href="/cart" className={Style.navbar_container_right_cart} style={{zIndex: 10000000}}>
                        <CartIcon />
                    </Link>

                    {/*User profile hoặc Login Button*/}
                    {user ? (
                        <div className={Style.navbar_container_right_profile_box} style={{zIndex: 10000000}}>
                            <div className={Style.navbar_container_right_profile}>
                                <Image src={images.user} alt="Profile" width={40} height={40}
                                onClick={()=> openProfile()}
                                className={Style.navbar_container_right_profile}
                                />
                                {profile && <Profile />}
                            </div>
                        </div>
                    ) : (
                        <div className={Style.navbar_container_right_login}>
                            <Button btnName="Login" onClick={handleLoginClick} />
                        </div>
                    )}

                    {/*Menu button*/}
                    <div className={Style.navbar_container_right_menuBtn}>
                        <CgMenuRight 
                        className={Style.menuIcon}
                        onClick={()=>openSideBar()}
                        />
                    </div>
                </div>
            </div>
            {/*Side bar component*/}
            {
                openSideMenu && (
                    <div className={Style.sideBar}>
                        <SideBar 
                            setOpenSideMenu ={setOpenSideMenu} 
                        />
                    </div>
                )
            }
        </div>
    )
};

export default Navbar;