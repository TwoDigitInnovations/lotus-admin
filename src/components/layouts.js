import { useState } from "react";
import SidePannel from "./SidePannel";
import Navbar from "./Navbar";
import { useRouter } from "next/router";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const publicPages = ["/login", "/forgot-password", "/privacyPolicy", "/termsAndConditions"];
  const isPublicPage = publicPages.includes(router.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!isPublicPage && <Navbar setOpen={setOpen} />}
      {!isPublicPage && <SidePannel open={open} setOpen={setOpen} />}
      <main className={isPublicPage ? "" : "pt-12 md:ml-54 min-h-screen"}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
