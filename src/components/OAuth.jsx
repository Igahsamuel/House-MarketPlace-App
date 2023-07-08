import { useLocation, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import googleIcon from "../assets/svg/googleIcon.svg";
function OAuth() {
  const navigate = useNavigate();
  const location = useLocation();

  const onGoogleAuth = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // checking for user
      const docRef = doc(db, "users", user.uid);
      const docScap = await getDoc(docRef);
      // if user does not exit
      if (!docScap.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }
      navigate("/");
    } catch (error) {
      toast.error("Error Occured uploading to google");
    }
  };
  return (
    <div className="socialLogin">
      <p>Sign-{location.pathname === "/sign-up" ? "up" : "in"} with</p>
      <button className="socialIconDiv" onClick={onGoogleAuth} type="submit">
        <img className="socialIconImg" src={googleIcon} alt="google Icon" />
      </button>
    </div>
  );
}

export default OAuth;
