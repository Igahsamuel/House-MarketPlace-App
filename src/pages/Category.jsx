import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import {
  collection,
  query,
  startAfter,
  getDocs,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { useParams } from "react-router-dom";
import ListingItems from "../components/ListingItems";
function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListings, setLastFetcedListings] = useState(null);
  const params = useParams();
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listingRef = collection(db, "listings");
        const q = query(
          listingRef,
          where("type", "==", params.categoryName),
          limit(2),
          orderBy("timestamp", "desc")
        );
        // Execute Query
        const querySnap = await getDocs(q);
        const lastVisibiliy = querySnap.docs[querySnap.docs.length - 1];
        setLastFetcedListings(lastVisibiliy);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        // console.log(error);
        toast.error("Could not load category page");
      }
    };
    fetchListing();
  }, [params.categoryName]);

  const onMoreLoadListing = async () => {
    try {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("type", "==", params.categoryName),
        limit(10),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListings)
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
      setLoading(false);
      if (
        querySnap.docs.length === 0 ||
        lastVisibiliy.id === listings[listings.length - 1]?.id
      ) {
        toast.success("No more Listings");
      } else {
        setListings((prevState) => [...prevState, ...listings]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not load category page");
    }
  };

  return (
    <div className="category">
      <header className="pageHeader">
        <p>Places for {params.categoryName}</p>
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
                  id={listing.id}
                  key={`${listing.id}-${index}`}
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
        <p>No listing for {params.categoryName}</p>
      )}
    </div>
  );
}

export default Category;
