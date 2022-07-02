import React, { useState } from 'react'
import useFetch from '../hooks/useFetch'
import {Link} from 'react-router-dom'


export default function Menubar(props) {

    const {loading, error, data} = useFetch('http://localhost:1337/api/static-bar?populate=%2A')
    

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
        <div className="headerBox">
            <div className='top'>
                <a className="fblogo"></a>
                <Link to={"/"}><img className="logo"src={ "http://localhost:1337" + data.data.attributes.logo.data.attributes.url} /></Link>
                <a href="http://www.facebook.com/simonstorparna"><img  className="fblogo"src={ "http://localhost:1337" + data.data.attributes.fblogo.data.attributes.url} /></a>
            </div>
            
            <div className='topnav'>
                {props.data.data.map(category => (
                    <div key={category.id} className='navbox'>
                        <p className='navtext'>{category.attributes.name}</p>
                        <div className="dropdown-content">
                            {category.attributes.pages.data.map(page => (
                                <Link to={"/" + page.attributes.url} >
                                    <div className='dropdown-unit'>
                                        <p className='dropdown-text'>{page.attributes.Namn}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
