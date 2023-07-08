import { useState, useEffect, useRef } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase.config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Category from "../pages/Category";

function CreateListings() {
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    offer: false,
    furnished: false,
    parking: false,
    regularPrice: 0,
    discountedPrice: 0,
    address: "",
    images: {},
    latitude: 0,
    longitude: 0,
  });
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    offer,
    furnished,
    parking,
    regularPrice,
    discountedPrice,
    address,
    images,
    latitude,
    longitude,
  } = formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef();

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        setFormData({ ...formData, userRef: user.uid });
      });
    } else {
      navigate("/sign-in");
    }
    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  if (loading) {
    return <Spinner />;
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error("Discounted price should be less than regular price");
      return;
    }
    // making sure they can't upload more than 6 images
    if (images.length > 6) {
      setLoading(false);
      toast.error("6 Images Max");
      return;
    }
    // Geolocation enabled code
    let geolocation = {};
    let location;
    const apiKey = import.meta.env.VITE_GEOCODE_API_KEY;
    if (geolocationEnabled) {
      // response to google
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${address}&key=${apiKey}`
      );
      const data = await response.json();

      geolocation.lat = data.results[0]?.geometry.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.lng ?? 0;
      location =
        data.status === "ZERO_RESULTS" ? undefined : data.results[0]?.formatted;
      if (location === undefined || location.includes("undefined")) {
        setLoading(false);
        toast.error("Please input a valid Address");
        return;
      }
    } else {
      // if geolocation is not enabled
      (geolocation.lat = latitude), (geolocation.lng = longitude);
    }
    // store image for storage
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, "image/" + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            reject(error);
            // Handle unsuccessful uploads
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };
    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error("Image is more than 5MB");
      return;
    });

    console.log(imgUrls);

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };
    formDataCopy.location = address;
    delete formDataCopy.images;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    console.log(formDataCopy);
    const docRef = await addDoc(collection(db, "listings"), formDataCopy);
    console.log(docRef.id);
    console.log(formDataCopy);
    setLoading(false);
    toast.success("Listings stored");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };
  const mutate = (e) => {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };
  return (
    <div className="profile">
      <header className="pageHeader">
        <p>Create a listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sell/Rent</label>
          <div className="formButtons">
            <button
              className={type === "sale" ? "formButtonActive" : "formButton"}
              type="button"
              id="type"
              value="sale"
              onClick={mutate}
            >
              Sell
            </button>
            <button
              className={type === "rent" ? "formButtonActive" : "formButton"}
              type="button"
              value="rent"
              id="type"
              onClick={mutate}
            >
              Rent
            </button>
          </div>
          <label className="formLabel">Name</label>
          <input
            type="text"
            className="formInputName"
            id="name"
            value={name}
            onClick={mutate}
            onChange={mutate}
            maxLength="32"
            minLength="10"
            required
          />
          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                type="number"
                className="formInputSmall"
                id="bedrooms"
                value={bedrooms}
                min="1"
                max="50"
                required
                onChange={mutate}
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                type="number"
                className="formInputSmall"
                id="bathrooms"
                value={bathrooms}
                max="50"
                min="1"
                required
                onChange={mutate}
              />
            </div>
          </div>
          <label className="formLabel">Parking Spot</label>
          <div className="formButtons">
            <button
              type="button"
              className={parking === true ? "formButtonActive" : "formButton"}
              id="parking"
              value={true}
              onClick={mutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={parking === false ? "formButtonActive" : "formButton"}
              id="parking"
              value={false}
              onClick={mutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              type="button"
              className={furnished === true ? "formButtonActive" : "formButton"}
              id="furnished"
              value={true}
              onClick={mutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={
                furnished === false ? "formButtonActive" : "formButton"
              }
              id="furnished"
              value={false}
              onClick={mutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Address</label>
          <textarea
            type="text"
            id="address"
            value={address}
            className="formInputAddress"
            onChange={mutate}
            required
          />
          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  type="number"
                  className="formInputSmall"
                  onChange={mutate}
                  id="latitude"
                  value={latitude}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="longitude"
                  value={longitude}
                  onChange={mutate}
                  required
                />
              </div>
            </div>
          )}
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer === true ? "formButtonActive" : "formButton"}
              id="offer"
              value={true}
              onClick={mutate}
            >
              Yes
            </button>
            <button
              className={offer === false ? "formButtonActive" : "formButton"}
              id="offer"
              value={false}
              onClick={mutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              type="number"
              className="formInputSmall"
              id="regularPrice"
              value={regularPrice}
              onClick={mutate}
              min="50"
              max="7500000"
              onChange={mutate}
              required
            />
            {type === "rent" && <p className="formPriceText">$/Month</p>}
          </div>
          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <div className="formPriceDiv">
                <input
                  type="number"
                  min="50"
                  max="7500000"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={mutate}
                  className="formInputSmall"
                />
                {type === "rent" && <p className="formPriceText">$/Month</p>}
              </div>
            </>
          )}
          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first Image will be the cover (max 6).
          </p>
          <input
            type="file"
            className="formInputFile"
            id="images"
            max="6"
            accept=".jpg, .jpeg, .png"
            multiple
            onChange={mutate}
            required
          />
          <button className="primaryButton createListingButton" type="submit">
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateListings;
