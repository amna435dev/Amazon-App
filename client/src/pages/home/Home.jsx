// Home.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Link } from "react-router-dom";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import EcomBanner3 from "../../assets/Ecom Banner 3.jpg";
import EcomBanner4 from "../../assets/Banner shopping 1 .png";
import EcomBanner5 from "../../assets/Banner shopping 2 .png";
import EcomBanner6 from "../../assets/Banner shopping 3 .png";
import EcomBanner7 from "../../assets/Banner shopping 4 .png";

// Catalog backgrounds
import FootWearCatelog from "../../assets/All Catelog 1.png";
import ElectronicCatelog from "../../assets/All Catelog 2.png";
import ClothCatelog from "../../assets/All Catelog 3.png";

const banners = [EcomBanner4,EcomBanner3,  EcomBanner5, EcomBanner6, EcomBanner7];

function Home() {
  return (
    <section className=" max-w-sm md:max-w-lg lg:max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Swiper */}
      <div className=" w-full h-52  md:h-[360px] overflow-hidden rounded-xl shadow-md mb-10">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={20}
          centeredSlides={true}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          className="w-full h-full"
        >
          {banners.map((src, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={src}
                alt={`banner-${idx}`}
                className="w-full h-full object-fit"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Featured Section */}
      <p className="text-2xl md:text-4xl font-bold my-3">Featured Products </p>
      <div className=" max-w-sm md:max-w-3xl   grid grid-cols-1 sm:grid-cols-3 gap-6 p-1 md:p-0 pb-20">

        <Link
          to="/Footwear-list"
          className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]"
        >
          <img src={FootWearCatelog} alt="Footwear" className="w-full h-48 object-cover" />
          <h3 className="text-center font-semibold text-lg py-3">Footwear</h3>
        </Link>

        <Link
          to="/Electronic-list"
          className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]"
        >
          <img src={ElectronicCatelog} alt="Electronics" className="w-full h-48 object-cover" />
          <h3 className="text-center font-semibold text-lg py-3">Electronics</h3>
        </Link>

        <Link
          to="/Cloth-list"
          className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]"
        >
          <img src={ClothCatelog} alt="Clothing" className="w-full h-48 object-cover" />
          <h3 className="text-center font-semibold text-lg py-3">Clothing</h3>
        </Link>
      </div>
    </section>
  );


}

export default Home;
