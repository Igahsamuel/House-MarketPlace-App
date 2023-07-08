import { useState } from "react";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
function ForgotPassword() {
  const [email, setEmail] = useState("");

  const onChange = (e) => setEmail(e.target.value);
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success("Email successfully sent");
    } catch (error) {
      toast.error("An Error Occured");
    }
  };
  return (
    <div className="pageContainer">
      <header className="pageHeader">
        <p>Forgot Password</p>
      </header>
      <main>
        <form>
          <input
            type="text"
            value={email}
            id="email"
            className="emailInput"
            onChange={onChange}
            placeholder="Email"
          />
        </form>
        <Link className="forgotPasswordLink" to="/sign-in">
          Sign in
        </Link>
        <div className="signInBar">
          <p className="signInText">Send Reset Link</p>
          <button onClick={onSubmit} className="signInButton">
            <ArrowRightIcon fill="#ffffff" width="34px" height="34px" />
          </button>
        </div>
      </main>
    </div>
  );
}
export default ForgotPassword;
