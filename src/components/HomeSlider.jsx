import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import Spinner from "./Spinner";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function HomeSlider() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchListing = async () => {
      const listingRef = collection(db, "listings");
      const listings = [];
      const q = query(listingRef, orderBy("timestamp", "desc"), limit(5));
      const querySnap = await getDocs(q);
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      // console.log(listings);
      setListings(listings);
      setLoading(false);
    };
    fetchListing();
  }, []);
  if (loading) {
    return <Spinner />;
  }
  if (listings.length === 0) {
    return <></>;
  }
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    listings && (
      <>
        <p className="exploreHeading">Recommended</p>
        <Slider {...settings}>
          {listings.map(({ data, id }) => (
            <div
              className="swiper-container"
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
            >
              <div
                className="swiperSlideDiv"
                style={{
                  background: `url(${data.imgUrls[0]})`,
                  backgroundSize: "cover",
                }}
              >
                <div className="swiperSlideText">{data.name}</div>
                <div className="swiperSlidePrice">
                  ${data.discountedPrice ?? data.regularPrice}{" "}
                  {data.type === "rent" && "/ month"}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </>
    )
  );
}

export default HomeSlider;
