import React from 'react'
import URL from '../url'
import { useEffect, useState } from "react"


import { ReactDOM } from 'react'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'

export default function Full_news(props) {

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className='fullNewsBox'>
            <img className="fullNewsImg" src={props.page.attributes.Bild.data.attributes.formats.large.url}/>
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
