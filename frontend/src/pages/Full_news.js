import React from 'react'
import URL from '../url'
import { useEffect, useState } from "react"


import { ReactDOM } from 'react'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'

export default function Full_news(props) {

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const getTopImage = (value) => {
    if (value.attributes.formats?.large){
      return value.attributes.formats.large.url;
    }
    if (value.attributes.formats?.medium){
      return value.attributes.formats.medium.url;
    }
    if (value.attributes.formats?.small){
      return value.attributes.formats.small.url;
    }
  }

  return (
    <div className='fullNewsBox'>
            <img className="fullNewsImg" src={getTopImage(props.page.attributes.Bild.data)}/>
            <div className='fullNewsText'>
                <div className='fullNewsHeadText'>
                    <p className='fullNewsHead'>{props.page.attributes.title}</p>
                    <p className='fullNewsDate'>{props.page.attributes.Datum}</p>
                </div>
                
                <ReactMarkdown className='fullNewsBody'>{props.page.attributes.Beskrivning}</ReactMarkdown>
            </div>
    </div>
  )
}
