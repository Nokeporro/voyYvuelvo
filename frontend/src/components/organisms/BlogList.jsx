import BlogCard from "../molecules/BlogCard";

export default function BlogList({ posts }) {
  return (
    <div className="blog-lista">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
