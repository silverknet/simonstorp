import React from 'react'
import ReactMarkdown from 'react-markdown'
import useFetch from '../hooks/useFetch'
import { useEffect, useState } from "react"

import Menubar from '../components/Menubar'
import Slideshow from '../components/Slideshow';

import { Link } from "react"


export default function Homepage() {

    const {loading, error, data} = useFetch('http://localhost:1337/api/categories?populate=%2A');
    const home = useFetch('http://localhost:1337/api/homepage?populate=%2A');
    const news = useFetch('http://localhost:1337/api/nyheter?populate=%2A');

    const [slideindex, setSlideindex] = useState(0);


    
    if(home.loading || home.error || error || loading || news.loading || news.error){
        return (<p>loading</p>)
    }

    const imgs = home.data.data.attributes.headerimages.data;
    const a_length = imgs.length;
    return (
        <div className='mainContainer'>
            <Menubar loading={loading} error={error} data={data} />
            <Slideshow imgs = {imgs} a_length = {a_length} s_index = {slideindex} set_slide = {(value) => setSlideindex(value)}/>
            <div className='home_content'>
                <div className='home_B b1'>
                    <p className='big_text'>{home.data.data.attributes.upper}</p>
                    <ReactMarkdown className='small_text'>{home.data.data.attributes.Huvudtext}</ReactMarkdown>
                </div>
                <div className='home_B b2'>
                    <div className='newsContainer'>
                        <p className='aktuellt'>Aktuellt</p>
                        {news.data.data.map((value, index) => {
                            if(index < 2){return(
                                <div className='newsBox'>
                                    <img className="newsImg" src={"http://localhost:1337" + value.attributes.Bild.data.attributes.url}/>
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
                        
                    </div>
                </div>
            </div>

        </div>
    )
}
