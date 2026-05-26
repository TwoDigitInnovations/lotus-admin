import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";
import isAuth from "@/components/isAuth";
import BlogPostForm from "@/components/BlogPostForm";
import { fetchBlogs } from "@/redux/actions/blogActions";

function EditBlogPost() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;

  const currentBlog = useSelector((s) => s.blog.currentBlog);
  const blogs = useSelector((s) => s.blog.blogs);
  const loading = useSelector((s) => s.blog.loading);

  useEffect(() => {
    if (id && !currentBlog && blogs.length === 0) {
      dispatch(fetchBlogs({ limit: 100 }, router));
    }
  }, [id]);

  const blog = currentBlog?._id === id ? currentBlog : blogs.find((b) => b._id === id);

  if (!id || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#078DD4", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: "#f8fafc" }}>
        <p className="text-slate-600 font-semibold">Post not found</p>
        <button
          onClick={() => router.push("/blogs")}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ background: "#078DD4" }}
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <>
      <Head><title>Edit {blog.title} | Lotusss Admin</title></Head>
      <BlogPostForm initialData={blog} blogId={id} />
    </>
  );
}

export default isAuth(EditBlogPost);
