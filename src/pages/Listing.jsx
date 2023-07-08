import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MapContainer, Popup, Marker, TileLayer } from "react-leaflet";
import React, { Component } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Spinner from "../components/Spinner";
import ShareIcon from "../assets/svg/shareIcon.svg";

function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopy, setShareLinkCopy] = useState(false);
  const auth = getAuth();
  const params = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // console.log(docSnap.data());
        setListing(docSnap.data());
        setLoading(false);
      }
    };
    fetchListing();
  }, [navigate, params.listingId]);
  if (loading) {
    return <Spinner />;
  }
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <main>
      <div>
        <div>
          <Slider {...settings}>
            {listing.imgUrls.map((url, index) => (
              <div key={index} className="swiper-container">
                <div
                  className="swiperSlideDiv"
                  style={{
                    background: `url(${listing.imgUrls[index]}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopy(true);
          setTimeout(() => {
            setShareLinkCopy(false);
          }, 2000);
        }}
      >
        <img src={ShareIcon} alt="shared Link" />
        {shareLinkCopy && <p className="linkCopied ">Link Copied!</p>}
      </div>
      <div className="listingDetails">
        <p className="listingName">
          {listing.name} - $
          {listing.offer
            ? listing.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">
          {listing.type === "rent" ? "For Rent" : "For Sale"}
        </p>
        {listing.offer && (
          <p className="discountPrice">
            ${listing.regularPrice - listing.discountedPrice} discount
          </p>
        )}
        <ul className="listingDetailsList">
          <li className="listingDetailsList li">
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : "1 Bedroom"}
          </li>
          <li className="listingDetailsList li">
            {listing.bathroom > 1
              ? `${listing.bathroom} Bathrooms`
              : "1 Bathroom"}
          </li>
          <li className="listingDetailsList li">
            {listing.parking && "Parking Spot"}
          </li>
          <li className="listingDetailsList li">
            {listing.furnished && "Furnished"}
          </li>
        </ul>
        <p className="listingLocationTitle">Location</p>

        {/* map */}
        <div className="leafletContainer">
          <MapContainer
            style={{ width: "100%", height: "100%" }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>
        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            className="primaryButton"
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
          >
            Contact LandLord
          </Link>
        )}
      </div>
    </main>
  );
}
export default Listing;
