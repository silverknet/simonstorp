import React, { useState } from 'react'
import useFetch from '../hooks/useFetch'
import {Link} from 'react-router-dom'
import { useEffect } from "react";


import { useLocation } from 'react-router-dom'
import URL from '../url'


export default function Menubar(props) {

    const {loading, error, data} = useFetch(URL + '/api/static-bar?populate=%2A')
    const [currentPage, setCurrentPage] = useState(null);
    
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
                <div className={ small ? 'scrollMenuDown' : 'scrollMenuUp'} >

                    <div className={props.loc === 1 ? "headerBox Home" : "headerBox Info"}>
                        <div className={props.loc === 1 ? "top Home1" : "top Info1" }>
                            <a className="fblogo" />
                            <Link to={"/"}><img className="logo"src={ URL  + data.data.attributes.logo.data.attributes.url} /></Link>
                            <a href="http://www.facebook.com/simonstorparna"><img  className="fblogo clickable"src={ URL + data.data.attributes.fblogo.data.attributes.url} /></a>
                        
                        </div>            
                        <div className='mobileMenuTop'><p className='navTextTop'>Meny</p>
                        <div className='topnav'>
                        
                            {props.data.data.map(category => (
                                <div key={category.id} className={currentCategory === category.id ? 'navbox marked2' : 'navbox'}>
                                    <p className='navtext'>{category.attributes.name}</p>
                                    <div className="dropdown-content">
                                        {category.attributes.pages.data.map(page => (
                                            <Link key={page.id} to={"/" + page.attributes.url} >
                                                <div key={page.id} className={location.pathname === ("/" + page.attributes.url) ? 'dropdown-unit marked' : 'dropdown-unit' }>
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
            </div>
            <div className={props.loc === 1 ? "fillDivInactive nofill" : "fillDiv fillInfo nofill"}>
                <div className={props.loc === 1 ? "headerBox Home nofill" : "headerBox Info nofill"}>
                    <div className={props.loc === 1 ? "top Home1 nofill" : "top Info1 nofill" }>
                    
                        <Link to={"/"}><img className="logo"src={ URL  + data.data.attributes.logo.data.attributes.url} /></Link>
                    
                    </div>            
                    <div className='mobileMenuTop nofill'><p className='navTextTop nofill'>Meny</p>
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
