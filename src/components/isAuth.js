import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// Pages that don't require authentication
const AUTH_FREE_PAGES = ["/login", "/forgot-password", "/privacyPolicy", "/termsAndConditions"];

const isAuth = (Component) => {
  return function IsAuth(props) {
    const router = useRouter();
    const { pathname } = router;
    const [auth, setAuth] = useState(null);

    useEffect(() => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("userDetail");
      const isPublic = AUTH_FREE_PAGES.includes(pathname);

      if (token && user) {
        if (isPublic) {
          // Already logged in — bounce away from login/forgot-password
          router.replace("/");
        } else {
          setAuth(true);
        }
      } else {
        if (isPublic) {
          setAuth(true);
        } else {
          localStorage.clear();
          router.replace("/login");
        }
      }
    }, [pathname]);

    if (auth === null) return null;

    return <Component {...props} />;
  };
};

export default isAuth;
