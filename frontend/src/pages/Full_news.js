import React from 'react'
import URL from '../url'

export default function Full_news(props) {
  return (
    <div className='fullNewsBox'>
            <img className="fullNewsImg" src={URL + props.value.attributes.Bild.data.attributes.url}/>
            <div className='fullNewsText'>
                <div className='fullNewsHeadText'>
                    <p className='fullNewsHead'>{props.value.attributes.Rubrik}</p>
                    <p className='fullNewsDate'>{props.value.attributes.Datum}</p>
                </div>
                
                <p className='fullNewsBody'>{props.value.attributes.Beskrivning}</p>
            </div>
    </div>
  )
}
