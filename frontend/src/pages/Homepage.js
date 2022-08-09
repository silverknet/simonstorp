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
    const home = useFetch(URL + '/api/homepage?populate=%2A');
    const news = useFetch(URL + '/api/nyheter?populate=%2A');

    
    if(home.loading || home.error || error || loading || news.loading || news.error){
        return (<p>loading</p>)
    }

    const imgs = home.data.data.attributes.headerimages.data;
    const a_length = imgs.length;
    return (
        <div className='mainContainer'>
            <ImageSlider home={home} />

            <div className='home_content'>
                <div className='home_B b1'>
                    <p className='big_text_home'>{home.data.data.attributes.upper}</p>
                    <ReactMarkdown className='small_text'>{home.data.data.attributes.Huvudtext}</ReactMarkdown>
                </div>
                <div className='home_B b2'>
                    <div className='newsContainer'>
                        <div className='aktuellt-con'><p className='aktuellt'>Aktuellt</p></div>
                        {news.data.data.map((value, index) => {
                            if(index < 2){return(
                                <div className='newsBox'>
                                    <img className="newsImg" src={URL + value.attributes.Bild.data.attributes.url}/>
                                    <div className='newsText'>
                                        <div className='newsHeadText'>
                                            <p className='newsHead'>{value.attributes.Rubrik}</p>
                                            <p className='newsDate'>{value.attributes.Datum}</p>
                                        </div>
                                        
                                        <p className='newsBody'>{value.attributes.Beskrivning}</p>
                                    </div>
                                </div>
                                
                            )}
                        })}
                        <div className='seeAll-con'>
                        <Link className="seeAll" to="/allanyheter">Se alla nyheter</Link>
                        </div>
                        
                    </div>
                </div>
            </div>

        </div>
    )
}
