import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import {
  collection,
  startAfter,
  orderBy,
  limit,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import ListingItems from "../components/ListingItems";

function Offers() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListings, setLastFetcedListings] = useState(null);
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingRef = collection(db, "listings");
        const q = query(
          listingRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(3)
        );
        const listings = [];
        const querySnap = await getDocs(q);
        const lastVisibiliy = querySnap.docs[querySnap.docs.length - 1];
        setLastFetcedListings(lastVisibiliy);
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error("Error occurred check again");
      }
    };
    fetchListings();
  }, []);

  const onMoreLoadListing = async () => {
    try {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("offer", "==", true),
        limit(10),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListings)
      );
      const querySnap = await getDocs(q);
      const lastVisibiliy = querySnap.docs[querySnap.docs.length - 1];
      setLastFetcedListings(lastVisibiliy);
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setLoading(false);
      if (
        querySnap.docs.length === 0 ||
        lastVisibiliy.id === listings[listings.length - 1]?.id
      ) {
        toast.info("No more Listings");
      } else {
        setListings((prevState) => [...prevState, ...listings]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not load the offers page");
    }
  };

  return (
    <div className="category">
      <header className="pageHeader">
        <p>Offers</p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <div className="categoryListings">
              {listings.map((listing, index) => (
                <ListingItems
                  listing={listing.data}
                  key={`${listing.id}-${index}`}
                  id={listing.id}
                />
              ))}
            </div>
          </main>
          <br />
          <br />
          {lastFetchedListings && (
            <p className="loadMore" onClick={onMoreLoadListing}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>There are no current Offers</p>
      )}
    </div>
  );
}
export default Offers;
