import React from 'react'
import ReactMarkdown from 'react-markdown'
import useFetch from '../hooks/useFetch'
import { useEffect, useState } from "react"

import Menubar from '../components/Menubar'

import ImageSlider from '../components/ImageSlider'


import {Link} from 'react-router-dom'
import URL from '../url'


export default function Homepage(props) {

    const {loading, error, data} = useFetch(URL + '/api/categories?populate=%2A');
    const news = useFetch(URL + '/api/nyhets?populate=%2A');

    let slideImages = [];

    useEffect(() => {
        props.homecontent.data.data.attributes.headerimages.data.map((picture) => {
            const img = new Image();
            img.src = picture.attributes.url;
            slideImages.push(img);

        })
      }, [])


    if( error || loading || news.loading || news.error){
        return (<p></p>)
    }
    
    

    const imgs = props.homecontent.data.data.attributes.headerimages.data;
    const a_length = imgs.length;
    return (
        <div className='mainContainer'>
            <ImageSlider home={props.homecontent} slideimages={slideImages} />

            <div className='home_content'>
                <div className='home_B b1'>
                    <p className='big_text_home'>{props.homecontent.data.data.attributes.upper}</p>
                    <ReactMarkdown className='small_text'>{props.homecontent.data.data.attributes.Huvudtext}</ReactMarkdown>
                </div>
                <div className='home_B b2'>
                    <div className='newsContainer'>
                        <div className='aktuellt-con'><p className='aktuellt'>Aktuellt</p></div>
                        {news.data.data.map((value, index) => {
                            if(index < 2){return(
                                <Link className='newsBox' key={value.id} to={value.attributes.url}>
                                    <img className="newsImg" src={value.attributes.Bild.data.attributes.formats.small.url}/>
                                    <div className='newsText'>
                                        <div className='newsHeadText'>
                                            <p className='newsHead'>{value.attributes.title}</p>
                                            <p className='newsDate'>{value.attributes.Datum}</p>
                                        </div>
                                        
                                        <p className='newsBody'>{value.attributes.Beskrivning}</p>
                                    </div>
                                </Link>
                                
                            )}
                        })}
                        <div className='seeAll-con'>
                        <Link className="seeAll" to="/allanyheter">Se alla nyheter {">"}</Link>
                        </div>
                        
                    </div>
                </div>
            </div>

        </div>
    )
}
