import Head from "next/head";
import isAuth from "@/components/isAuth";
import GalleryItemForm from "@/components/GalleryItemForm";

function AddGalleryItem() {
  return (
    <>
      <Head><title>Add Gallery Item | Lotusss Admin</title></Head>
      <GalleryItemForm />
    </>
  );
}

export default isAuth(AddGalleryItem);
