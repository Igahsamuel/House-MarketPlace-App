import { Link } from "react-router-dom";
import rentcategoryImage from "../assets/jpg/rentcategoryImage.jpg";
import sellCategoryImage from "../assets/jpg/sellCategoryImage.jpg";
import HomeSlider from "../components/HomeSlider";
function Explore() {
  return (
    <div className="explore">
      <header className="pageHeader">
        <p>Explore</p>
      </header>
      <main>
        <HomeSlider />
        <div className="exploreCategoryHeading">
          <p className="exploreHeading">Categories</p>
          <div className="exploreCategories">
            <Link to="/category/rent">
              <img
                src={rentcategoryImage}
                alt="rent"
                className="exploreCategoryImg"
              />
              <p className="exploreCategoryName">Places for rent</p>
            </Link>
            <Link to="/category/sale">
              <img
                src={sellCategoryImage}
                className="exploreCategoryImg"
                alt="rent"
              />
              <p className="exploreCategoryName">Places for sale</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
export default Explore;
