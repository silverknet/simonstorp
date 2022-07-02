import React from 'react'
import { useEffect, useState } from "react"


export default function Slideshow(props) {
    console.log("test")

    const [slideindex, setSlideindex] = useState(props.s_index);
    

    const next = () => {
        
    };


    return (
        <div>
            {props.imgs.map((img, index) => {
                return (
                <div className= {index === slideindex ? 'slideimg active' : 'slideimg'} key={index}>
                    {index === slideindex && (<img className="bannerimg" src={ "http://localhost:1337" + img.attributes.url} alt=""/>) }
                </div>
                )
            })}
        </div>
    )
}
