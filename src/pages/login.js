import { useState } from "react";
import { useRouter } from "next/router";
import { MdEmail, MdPassword } from "react-icons/md";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useAppDispatch } from "@/redux/hooks";
import { loginUser } from "@/redux/actions/userActions";
import isAuth from "@/components/isAuth";

function Login(props) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [submitted, setSubmitted] = useState(false);
  const [userDetail, setUserDetail] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    setSubmitted(true);
    if (!userDetail.username || !userDetail.password) {
      props.toaster({ type: "error", message: "Missing credentials" });
      return;
    }
    try {
      props.loader(true);
      const res = await dispatch(
        loginUser(
          { email: userDetail.username, password: userDetail.password },
          router,
        ),
      );
      if (res?.success) {
        setUserDetail({ username: "", password: "" });
        props.toaster({ type: "success", message: "Login successful" });
      } else {
        props.toaster({
          type: "error",
          message: res?.message || "You are not authorized",
        });
      }
    } catch (err) {
      props.toaster({ type: "error", message: err?.message || "Login failed" });
    } finally {
      props.loader(false);
    }
  };

  const inputCls = (hasError) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${
      hasError
        ? "border-red-300 bg-red-50"
        : "border-gray-200 bg-gray-50 focus-within:border-[#078DD4] focus-within:bg-white"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* ── Left: luxury image panel ── */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden">
        {/* Property image */}
        <img
          src="/auth-bg.png"
          alt="Luxury property"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(13,31,53,0.88) 0%, rgba(7,141,212,0.35) 100%)",
          }}
        />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-center shrink-0"
              style={{
                background: "#078DD4",
                boxShadow: "0 4px 16px rgba(7,141,212,0.45)",
              }}
            >
              <span className="text-[10px] font-bold tracking-widest leading-tight">
                <span className="text-white block">LOTUS</span>
                <span style={{ color: "#d4a017" }} className="block -mt-0.5">
                  SS
                </span>
              </span>
            </div>
            <span className="text-white text-xl font-bold tracking-wide">
              Lotusss
            </span>
          </div>

          {/* Bottom tagline */}
          <div>
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: "rgba(7,141,212,0.25)", color: "#78CFEF" }}
            >
              Premium Real Estate
            </div>
            <h2 className="text-4xl font-bold text-white leading-snug mb-3">
              Manage Your
              <br />
              Luxury Properties
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Oversee projects, galleries, blog content and client enquiries
              from one powerful admin dashboard.
            </p>

            {/* Stats row */}
            <div className="flex gap-6 mt-8">
              {[
                { label: "Projects", val: "50+" },
                { label: "Clients", val: "1.2k" },
                { label: "Cities", val: "12" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-white text-xl font-bold">{s.val}</p>
                  <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-center"
                style={{ background: "#078DD4" }}
              >
                <span className="text-[9px] font-bold tracking-widest leading-tight">
                  <span className="text-white block">LOTUS</span>
                  <span style={{ color: "#d4a017" }} className="block -mt-0.5">
                    SS
                  </span>
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900">Lotusss Admin</span>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-gray-400 mb-8">
              Sign in to your admin account
            </p>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email address
              </label>
              <div className={inputCls(submitted && !userDetail.username)}>
                <MdEmail className="text-gray-400 text-lg shrink-0" />
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="bg-transparent outline-none w-full text-sm text-gray-800 placeholder-gray-400"
                  value={userDetail.username}
                  onChange={(e) =>
                    setUserDetail({ ...userDetail, username: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              </div>
              {submitted && !userDetail.username && (
                <p className="text-red-500 text-xs mt-1">Email is required</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className={inputCls(submitted && !userDetail.password)}>
                <MdPassword className="text-gray-400 text-lg shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm text-gray-800 placeholder-gray-400 pr-2"
                  value={userDetail.password}
                  onChange={(e) =>
                    setUserDetail({
                      ...userDetail,
                      password: e.target.value.trim(),
                    })
                  }
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <IoEyeOutline size={17} />
                  ) : (
                    <IoEyeOffOutline size={17} />
                  )}
                </button>
              </div>
              {submitted && !userDetail.password && (
                <p className="text-red-500 text-xs mt-1">
                  Password is required
                </p>
              )}
            </div>

            {/* Forgot */}
            <div className="flex justify-end mt-2 mb-6">
              <button
                className="text-xs font-semibold hover:underline"
                style={{ color: "#078DD4" }}
                onClick={() => router.push("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              onClick={submit}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#078DD4" }}
            >
              Sign in
            </button>

            {/* Terms */}
            <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
              By signing in, you agree to our{" "}
              <button
                className="text-gray-600 font-semibold hover:underline"
                onClick={() => router.push("/termsAndConditions")}
              >
                Terms
              </button>{" "}
              &amp;{" "}
              <button
                className="text-gray-600 font-semibold hover:underline"
                onClick={() => router.push("/privacyPolicy")}
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 py-4 px-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Lotusss. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default isAuth(Login);
