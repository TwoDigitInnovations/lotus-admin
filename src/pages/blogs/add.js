import Head from "next/head";
import isAuth from "@/components/isAuth";
import BlogPostForm from "@/components/BlogPostForm";

function AddBlogPost() {
  return (
    <>
      <Head><title>New Post | Lotusss Admin</title></Head>
      <BlogPostForm />
    </>
  );
}

export default isAuth(AddBlogPost);
