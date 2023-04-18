import React from 'react'
import Menubar from '../components/Menubar'
import useFetch from '../hooks/useFetch'
import URL from '../url'
import { ReactDOM } from 'react'
import { useEffect, useState } from "react"
import {Link} from 'react-router-dom'



export default function All_news() {

    useEffect(() => {
        window.scrollTo(0, 0)
      }, [])

    const news = useFetch(URL + '/api/nyhets?populate=%2A&sort=rank:asc');

    if( news.loading || news.error){
        return (<p></p>)
    }

  return (
    <div className='mainContainerAllNews'> 
        <div className='all_news_box'>
            <p className='big_text_center'>Alla nyheter i Simonstorp</p>
            {news.data.data.map((value, index) => {
                return(
                    <Link className='newsBoxAll' key={value.id} to={"../" + value.attributes.url}>
                    
                        <img className="newsImgAll" src={value.attributes.Bild.data.attributes.formats.medium.url}/>
                        <div className='newsTextAll'>
                            <div className='newsHeadTextFull'>
                                <p className='newsHead'>{value.attributes.title}</p>
                                <p className='newsDate'>{value.attributes.Datum}</p>
                            </div>
                            
                            <p className='newsBody'>{value.attributes.Beskrivning}</p>
                        </div>
                    
                        
                    </Link>
                )
            })}
                
        </div>
    </div>
  )
}
