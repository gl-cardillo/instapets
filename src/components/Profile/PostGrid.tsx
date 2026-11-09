import { Link } from "react-router";
import type { Post } from "../../types";
import { PostImage } from "../PostImage/PostImage";

// square thumbnails linking to each post
export function PostGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {posts.map((post) => (
        <Link to={`/post/${post.id}`} key={post.id}>
          <PostImage
            post={post}
            className="block aspect-square w-full rounded-control object-cover"
          />
        </Link>
      ))}
    </div>
  );
}
