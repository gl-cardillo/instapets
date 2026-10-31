import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="main-page">
      <h3>Page not found</h3>
      <p>
        There's nothing here.{" "}
        <Link to="/home" className="font-bold text-primary">
          Back to the feed
        </Link>
      </p>
    </div>
  );
}
