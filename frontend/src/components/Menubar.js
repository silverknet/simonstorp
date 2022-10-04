import React, { useState } from 'react'
import useFetch from '../hooks/useFetch'
import useWindowDimensions from '../hooks/getWindowDimensions'
import {Link} from 'react-router-dom'
import { useEffect } from "react";


import { useLocation } from 'react-router-dom'
import URL from '../url';

import menuICO from '../assets/img/menuico.png';
import fblogo from '../assets/img/fblogo.png';



export default function Menubar(props) {

    const [activeID, setActiveID] = useState(-1);
    const [menuDown, setMenuDown] = useState(false);

    const {loading, error, data} = useFetch(URL + '/api/static-bar?populate=%2A')
    const [currentPage, setCurrentPage] = useState(null);

    const { height, width } = useWindowDimensions();
    
    let currentCategory = -1;

    const location = useLocation();

    const [small, setSmall] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
        window.addEventListener("scroll", () =>
            setSmall(window.pageYOffset > 50)
        );
        }
    }, []);

    console.log("render");

    if (location.pathname === "/"){
        props.set_loc(1)
      }else(
        props.set_loc(0)
    )

    props.page_data.data.forEach(element => {
        if(("/" + element.attributes.url) === location.pathname){
            currentCategory = (element.attributes.categories.data[0].id)
        }
    }); 

    if(props.loading) {
        return (<p>loading</p>)
    }
    if(props.error) {
        return (<p>Error!</p>)
    }
    if(loading) {
        return (<p>loading</p>)
    }
    if(error) {
        return (<p>Error!</p>)
    }



    return (
        <div>
            <div className={props.loc === 1 ? "outerMenu Home2" : "outerMenu Info2"}>
                <div className={ width > 800 ? (small ? 'scrollMenuDown' : 'scrollMenuUp') :'scrollMenuUp'} >

                    <div className={props.loc === 1 ? "headerBox Home" : "headerBox Info"}>
                        <div className={props.loc === 1 ? "top Home1" : "top Info1" }>
                            <div className='mobileMenuTop'><img src={menuICO} className={"navTextTop " + (menuDown?"menuButtonActive":"")} onClick={() =>{ menuDown?setMenuDown(false):setMenuDown(true)}}/></div>
                            <Link to={"/"}><img className="logo"src={ URL  + data.data.attributes.logo.data.attributes.url} /></Link>
                            <a  className="fblogo clickable" href="http://www.facebook.com/simonstorparna"><img className="fblogoImg" src={fblogo} /></a>
                        
                        </div>            
                        
                        <div className={menuDown?'topnav down':"topnav"} >
                        
                            {props.data.data.map((category, index) => (
                                <div key={category.id} className={(activeID === index ? "marked3 " : "") + (width > 800 ? "navboxBig " : "") + (currentCategory === category.id && width > 800 ? 'navbox marked2' : 'navbox') } onClick={() => { activeID === index ? setActiveID(-1): setActiveID(index) }}>
                                    <p key={"2." + category.id} className='navtext' >{category.attributes.name}</p>
                                    <div key={"3." + category.id} className={"dropdown-content " + (activeID === index ? "showdrop":"")}>
                                        {category.attributes.pages.data.map(page => (
                                            <Link key={page.id} to={"/" + page.attributes.url} >
                                                <div key={page.id} className={location.pathname === ("/" + page.attributes.url) ? 'dropdown-unit marked' : 'dropdown-unit'} onClick={() => setMenuDown(false)}>
                                                    <p key={page.id} className='dropdown-text'>{page.attributes.Namn}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    
                        </div>
                    
                    </div>
                </div>
            </div>
            <div className={props.loc === 1 ? "fillDivInactive nofill" : "fillDiv fillInfo nofill"}>
                <div className={props.loc === 1 ? "headerBox Home nofill" : "headerBox Info nofill"}>
                    <div className={props.loc === 1 ? "top Home1 nofill" : "top Info1 nofill" }>
                    
                        <Link to={"/"}><img className="logo nofill"src={ URL  + data.data.attributes.logo.data.attributes.url} /></Link>
                    
                    </div>            
                    <div className='topnav nofill'>
                    
                        {props.data.data.map(category => (
                            <div key={category.id} className={currentCategory === category.id ? 'navbox nofill' : 'navbox nofill'}>
                                <p className='navtext nofill'>{category.attributes.name}</p>
                                
                            </div>
                        ))}
                
                    </div>
                
                </div>                                        


            </div>

        </div>
    )
}
