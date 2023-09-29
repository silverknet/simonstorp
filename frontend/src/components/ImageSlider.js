import React from 'react'
import { useState, useEffect } from 'react';
import URL from '../url';
import {LazyLoadImage} from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "react-lazy-load-image-component/src/effects/opacity.css";


export default function ImageSlider(props) {
    let length = props.home.data.data.attributes.headerimages.data.length;
    const [counter, setCounter] = useState(Math.floor(Math.random() * length)); // <-- Initialize counter randomly here

    
    counter > length - 1 ? setCounter(0): void(0);
    

    useEffect(() => {
      
      const interval = setInterval(() => {

        setCounter(prev => prev + 1)

      }, 12000);
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div className="slider">
        {props.home.data.data.attributes.headerimages.data.map((img, index) => {
                return (
                  <>
                    <div className= {index === counter ? 'slideimgActive' : 'slideimg'} key={index}>
                        { (index === counter || index === (counter - 1 >= 0 ? counter - 1 : length - 1)) && <LazyLoadImage className="bannerimg" key={index} loading="lazy" effect="blur" src={ img.attributes.url} alt=""/> }
                    </div>
                    <div className="slideimgActive">
                      {index == 0 && <img className="sliderBackground" key={index} src={ img.attributes.formats.medium.url} alt=""/>}
                    </div>
                  </>
                )
        })}
      </div>
    );
}
/*props.home.data.data.attributes.headerimages.data */