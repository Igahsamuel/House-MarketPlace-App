import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { db } from "../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

function Contact() {
  const [message, setMessage] = useState("");
  const [landlord, setLandLord] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  useEffect(() => {
    const getLandlord = async () => {
      const docRef = doc(db, "users", params.landlordId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLandLord(docSnap.data());
      } else {
        toast.error("Could not get landlord details");
      }
    };
    getLandlord();
  }, [params.landlordId]);
  const onChange = (e) => setMessage(e.target.value);
  return (
    <div className="pageContainer">
      <header className="pageHeader">
        <p>Contact Landlord</p>
      </header>
      {landlord !== null && (
        <main>
          <div className="contactLandLord">
            <p className="landlordName">{landlord?.name}</p>
          </div>
          <form className="messageForm">
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                value={message}
                className="textarea"
                onChange={onChange}
              ></textarea>
            </div>
            <a
              href={`mailto:${landlord.email}?Subject=${searchParams.get(
                "listingName"
              )}&body=${message}`}
            >
              <button type="button" className="primaryButton">
                Send Message
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
}

export default Contact;
