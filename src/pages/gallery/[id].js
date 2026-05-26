import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";
import isAuth from "@/components/isAuth";
import GalleryItemForm from "@/components/GalleryItemForm";
import { fetchGallery } from "@/redux/actions/galleryActions";

function EditGalleryItem() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;

  const currentItem = useSelector((s) => s.gallery.currentItem);
  const items = useSelector((s) => s.gallery.items);
  const loading = useSelector((s) => s.gallery.loading);

  useEffect(() => {
    if (id && !currentItem && items.length === 0) {
      dispatch(fetchGallery({ limit: 200 }, router));
    }
  }, [id]);

  const item = currentItem?._id === id ? currentItem : items.find((i) => i._id === id);

  if (!id || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#078DD4", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: "#f8fafc" }}>
        <p className="text-slate-600 font-semibold">Item not found</p>
        <button
          onClick={() => router.push("/gallery")}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ background: "#078DD4" }}
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <>
      <Head><title>Edit {item.name} | Lotusss Admin</title></Head>
      <GalleryItemForm initialData={item} itemId={id} />
    </>
  );
}

export default isAuth(EditGalleryItem);
