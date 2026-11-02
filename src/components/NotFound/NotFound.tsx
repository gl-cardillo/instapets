import { Link } from "react-router";
import { Notice } from "../ui/Notice";

export function NotFound() {
  return (
    <div className="mx-auto box-border w-full max-w-xl p-4">
      <Notice title="Page not found">
        There's nothing here.{" "}
        <Link to="/home" className="font-bold text-primary">
          Back to the feed
        </Link>
      </Notice>
    </div>
  );
}
