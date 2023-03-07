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

    const {loading, error, data} = useFetch(URL + '/api/static-bar?populate=%2A');

    const { height, width } = useWindowDimensions();
    
    let currentCategory = -1;

    const location = useLocation();

    const [small, setSmall] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.addEventListener("scroll", () =>
                setSmall(window.pageYOffset > 20)
            );
        }
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
        

    }, [location.pathname]);

    
    

    

    if(props.loading) {
        return (<p></p>)
    }
    if(props.error) {
        return (<p>Error!</p>)
    }
    if(loading) {
        return (<p></p>)
    }
    if(error) {
        return (<p>Error!</p>)
    }

    function ranksort(object){

        var new_dict = new Array(object.length);
        var ranks =[]

        for (var element in object) {
            ranks.push(object[element].attributes.rank);
        }
        ranks.sort();

        for (var element in object) {
            var index = ranks.findIndex((el) => el == object[element].attributes.rank);
            new_dict[index] = object[element];
        }

        //new_dict[object[element].attributes.rank] = object[element];


        return new_dict
        
        /*let sortable = [];
        for (var rank in dict) {
            sortable.push([vehicle, dict[vehicle]]);
        }
        console.log(dict);
        let newdict = {};
        Object.assign(newdict, dict);
        dict.forEach((element, index) => newdict[index].id = element.attributes.rank);
        return newdict;
        */
    }


    return (
        <div>
            <div className={props.loc === 1 ? "outerMenu Home2" : "outerMenu Info2"}>
                <div className={props.loc != 1 ? (width > 800 ? (small ? 'scrollMenuDown' : 'scrollMenuUp') :'scrollMenuUp') : 'scrollMenuUp'} >

                    <div className={props.loc === 1 ? "headerBox Home" : "headerBox Info"}>
                        <div className={props.loc === 1 ? "top Home1" : "top Info1" }>
                            <div className='mobileMenuTop'><img src={menuICO} className={"navTextTop " + (menuDown?"menuButtonActive":"")} onClick={() =>{ menuDown?setMenuDown(false):setMenuDown(true)}}/></div>
                            <Link to={"/"}><img className="logo"src={data.data.attributes.logo.data.attributes.formats.large.url} /></Link>
                            <a  className="fblogo clickable nolink" href="http://www.facebook.com/simonstorparna"><img className="fblogoImg" src={fblogo} /></a>
                        
                        </div>            
                        
                        <div className={menuDown?'topnav down':"topnav" + (small ? ' topnavdown' : '')} >
                        
                            {props.data.data.map((category, index) => (
                                <div key={category.id} className={(activeID === index ? "marked3 " : "") + (width > 800 ? "navboxBig " : "") + (currentCategory === category.id && width > 800 ? 'navbox marked2' : 'navbox') } onClick={() => { width <= 800 ? (activeID === index ? setActiveID(-1): setActiveID(index) ): void(0) }}>
                                    <p key={"2." + category.id} className='navtext' >{category.attributes.title}</p>
                                    <div key={"3." + category.id} className={"dropdown-content " + (activeID === index ? "showdrop":"")}>
                                        {ranksort(category.attributes.pages.data).map(page => (
                                            <Link key={page.id} to={"/" + page.attributes.url} >
                                                <div key={page.id} className={location.pathname === ("/" + page.attributes.url) ? 'dropdown-unit marked' : 'dropdown-unit' } onClick={() => setMenuDown(false)}>
                                                    <p key={page.id} className='dropdown-text'>{page.attributes.title}</p>
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
                    
                        <Link to={"/"}><img className="logo nofill"src={data.data.attributes.logo.data.attributes.url} /></Link>
                    
                    </div>            
                    <div className='topnav nofill'>
                    
                        {props.data.data.map(category => (
                            <div key={category.id} className={currentCategory === category.id ? 'navbox nofill' : 'navbox nofill'}>
                                <p className='navtext nofill'>{category.attributes.title}</p>
                                
                            </div>
                        ))}
                
                    </div>
                
                </div>                                        


            </div>

        </div>
    )
}
