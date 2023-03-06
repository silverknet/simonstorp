import React from 'react'
import { useState, useEffect } from 'react';
import URL from '../url';
import {LazyLoadImage} from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "react-lazy-load-image-component/src/effects/opacity.css";


export default function ImageSlider(props) {
    const [counter, setCounter] = useState(0);

    let length = props.home.data.data.attributes.headerimages.data.length;
    
    counter > length - 1 ? setCounter(0): void(0);
    

    useEffect(() => {
      
      const interval = setInterval(() => {

        setCounter(prev => prev + 1)

      }, 16000);
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div className="slider">
        {props.home.data.data.attributes.headerimages.data.map((img, index) => {
                return (
                <div className= {index === counter ? 'slideimgActive' : 'slideimg'} key={index}>
                    { (index === counter || index === (counter - 1 >= 0 ? counter - 1 : length - 1)) && <LazyLoadImage className="bannerimg" loading="lazy" effect="blur" src={ img.attributes.url} alt=""/> }
                </div>
                )
        })}
      </div>
    );
}
/*props.home.data.data.attributes.headerimages.data */