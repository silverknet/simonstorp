import React from 'react'
import URL from '../url'
import { useEffect, useState } from "react"


import { ReactDOM } from 'react'

export default function Full_news(props) {

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className='fullNewsBox'>
            <img className="fullNewsImg" src={URL + props.page.attributes.Bild.data.attributes.url}/>
            <div className='fullNewsText'>
                <div className='fullNewsHeadText'>
                    <p className='fullNewsHead'>{props.page.attributes.Rubrik}</p>
                    <p className='fullNewsDate'>{props.page.attributes.Datum}</p>
                </div>
                
                <p className='fullNewsBody'>{props.page.attributes.Beskrivning}</p>
            </div>
    </div>
  )
}
