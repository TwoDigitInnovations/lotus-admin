import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { Mail, Lock, CheckCircle2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Api } from "@/services/service";
import isAuth from "@/components/isAuth";

function ForgotPassword(props) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [token, setToken] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef([]);

  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validateEmail = (val = email) => {
    if (!val.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email address";
    return "";
  };

  const validateOtp = () => {
    if (otp.join("").length < 6) return "Please enter the complete 6-digit OTP";
    return "";
  };

  const validatePasswords = (data = passwords) => {
    const errs = {};
    if (!data.newPassword) errs.newPassword = "Password is required";
    else if (data.newPassword.length < 8) errs.newPassword = "Must be at least 8 characters";
    else if (!/[A-Z]/.test(data.newPassword)) errs.newPassword = "Must contain an uppercase letter";
    else if (!/[0-9]/.test(data.newPassword)) errs.newPassword = "Must contain a number";
    if (!data.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (data.newPassword !== data.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const arr = pasted.split("");
      setOtp([...arr, ...Array(6 - arr.length).fill("")]);
      otpRefs.current[Math.min(arr.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  const handleSendOtp = () => {
    setSubmitted(true);
    const err = validateEmail();
    setEmailError(err);
    if (err) return;
    props.loader(true);
    Api("post", "auth/send-otp", { email }, router).then(
      (res) => {
        props.loader(false);
        if (res?.status) {
          props.toaster({ type: "success", message: "OTP sent to your email!" });
          setToken(res.data.token);
          setSubmitted(false);
          setStep(2);
        } else {
          props.toaster({ type: "error", message: res?.message || "Failed to send OTP." });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message || "Something went wrong." });
      },
    );
  };

  const handleResendOtp = () => {
    props.loader(true);
    Api("post", "auth/resend-otp", { email }, router).then(
      (res) => {
        props.loader(false);
        if (res?.status) {
          props.toaster({ type: "success", message: "OTP resent!" });
          setToken(res.data.token);
          setOtp(["", "", "", "", "", ""]);
          setOtpError("");
          setSubmitted(false);
        } else {
          props.toaster({ type: "error", message: res?.message || "Failed to resend OTP." });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message || "Something went wrong." });
      },
    );
  };

  const handleVerifyOtp = () => {
    setSubmitted(true);
    const err = validateOtp();
    setOtpError(err);
    if (err) return;
    props.loader(true);
    Api("post", "auth/verify-otp", { token, otp: otp.join("") }, router).then(
      (res) => {
        props.loader(false);
        if (res?.status) {
          props.toaster({ type: "success", message: "OTP verified!" });
          setSubmitted(false);
          setStep(3);
        } else {
          props.toaster({ type: "error", message: res?.message || "Invalid OTP." });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message || "Something went wrong." });
      },
    );
  };

  const handleResetPassword = () => {
    setSubmitted(true);
    const errs = validatePasswords();
    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;
    props.loader(true);
    Api("post", "auth/change-password", { token, password: passwords.newPassword }, router).then(
      (res) => {
        props.loader(false);
        if (res?.status) {
          props.toaster({ type: "success", message: "Password reset successfully!" });
          router.push("/login");
        } else {
          props.toaster({ type: "error", message: res?.message || "Failed to reset password." });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message || "Something went wrong." });
      },
    );
  };

  const inputCls = (hasError) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${
      hasError
        ? "border-red-300 bg-red-50"
        : "border-slate-200 bg-slate-50 focus-within:border-[#078DD4] focus-within:bg-white"
    }`;

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-7">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
              step > s
                ? "text-white"
                : step === s
                  ? "bg-white text-[#078DD4]"
                  : "bg-slate-100 border-slate-200 text-slate-400"
            }`}
            style={
              step > s
                ? { background: "#078DD4", borderColor: "#078DD4" }
                : step === s
                  ? { borderColor: "#078DD4" }
                  : {}
            }
          >
            {step > s ? <CheckCircle2 size={14} /> : s}
          </div>
          {s < 3 && (
            <div
              className="h-px w-8 transition-all"
              style={{ background: step > s ? "#078DD4" : "#e2e8f0" }}
            />
          )}
        </div>
      ))}
    </div>
  );

  const stepTitles = ["Forgot Password", "Verify OTP", "New Password"];
  const stepDesc = [
    "Enter your email and we'll send you a reset OTP.",
    `We've sent a 6-digit OTP to ${email}.`,
    "Create a strong new password for your account.",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left: luxury image panel */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden">
        <img
          src="/auth-bg.png"
          alt="Luxury property"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(13,31,53,0.88) 0%, rgba(7,141,212,0.35) 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-center shrink-0"
              style={{ background: "#078DD4", boxShadow: "0 4px 16px rgba(7,141,212,0.45)" }}
            >
              <span className="text-[10px] font-bold tracking-widest leading-tight">
                <span className="text-white block">LOTUS</span>
                <span style={{ color: "#d4a017" }} className="block -mt-0.5">SS</span>
              </span>
            </div>
            <span className="text-white text-xl font-bold tracking-wide">Lotusss</span>
          </div>
          <div>
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: "rgba(7,141,212,0.25)", color: "#78CFEF" }}
            >
              Account Recovery
            </div>
            <h2 className="text-4xl font-bold text-white leading-snug mb-3">
              Secure Your<br />Admin Account
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Follow the steps to verify your identity and reset your password securely.
            </p>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-center"
                style={{ background: "#078DD4" }}
              >
                <span className="text-[9px] font-bold tracking-widest leading-tight">
                  <span className="text-white block">LOTUS</span>
                  <span style={{ color: "#d4a017" }} className="block -mt-0.5">SS</span>
                </span>
              </div>
              <span className="text-lg font-bold text-slate-900">Lotusss Admin</span>
            </div>

            <button
              onClick={() => step === 1 ? router.push("/login") : setStep((s) => s - 1)}
              className="flex items-center gap-1.5 text-xs font-semibold mb-6 hover:underline"
              style={{ color: "#078DD4" }}
            >
              <ArrowLeft size={13} />
              {step === 1 ? "Back to Login" : "Back"}
            </button>

            <StepIndicator />

            <h1 className="text-2xl font-bold text-slate-900 mb-1">{stepTitles[step - 1]}</h1>
            <p className="text-sm text-slate-400 mb-6">{stepDesc[step - 1]}</p>

            {/* Step 1 — Email */}
            {step === 1 && (
              <>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Email address
                </label>
                <div className={inputCls(submitted && emailError)}>
                  <Mail size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="email"
                    placeholder="name@email.com"
                    className="bg-transparent outline-none w-full text-sm text-slate-800 placeholder-slate-400"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (submitted) setEmailError(validateEmail(e.target.value));
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  />
                </div>
                {submitted && emailError && (
                  <p className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
                <button
                  onClick={handleSendOtp}
                  className="mt-6 w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "#078DD4" }}
                >
                  Send OTP
                </button>
              </>
            )}

            {/* Step 2 — OTP */}
            {step === 2 && (
              <>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Enter 6-digit OTP
                </label>
                <div className="flex gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`flex-1 h-12 text-center text-slate-900 text-lg font-bold rounded-xl outline-none border-2 transition-all ${
                        submitted && otpError
                          ? "border-red-300 bg-red-50"
                          : digit
                            ? "bg-[#e0f2fe]"
                            : "border-slate-200 bg-slate-50"
                      }`}
                      style={digit ? { borderColor: "#078DD4" } : {}}
                    />
                  ))}
                </div>
                {submitted && otpError && (
                  <p className="text-red-500 text-xs mt-2">{otpError}</p>
                )}
                <p className="text-xs text-slate-400 mt-3">
                  Didn&apos;t receive the code?{" "}
                  <button
                    onClick={handleResendOtp}
                    className="font-semibold hover:underline"
                    style={{ color: "#078DD4" }}
                  >
                    Resend OTP
                  </button>
                </p>
                <button
                  onClick={handleVerifyOtp}
                  className="mt-6 w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "#078DD4" }}
                >
                  Verify OTP
                </button>
              </>
            )}

            {/* Step 3 — New Password */}
            {step === 3 && (
              <>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    New Password
                  </label>
                  <div className={inputCls(submitted && passwordErrors.newPassword)}>
                    <Lock size={18} className="text-slate-400 shrink-0" />
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      className="bg-transparent outline-none w-full text-sm text-slate-800 placeholder-slate-400"
                      value={passwords.newPassword}
                      onChange={(e) => {
                        const updated = { ...passwords, newPassword: e.target.value };
                        setPasswords(updated);
                        if (submitted) setPasswordErrors(validatePasswords(updated));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNew ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>
                  </div>
                  {submitted && passwordErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Confirm Password
                  </label>
                  <div className={inputCls(submitted && passwordErrors.confirmPassword)}>
                    <Lock size={18} className="text-slate-400 shrink-0" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      className="bg-transparent outline-none w-full text-sm text-slate-800 placeholder-slate-400"
                      value={passwords.confirmPassword}
                      onChange={(e) => {
                        const updated = { ...passwords, confirmPassword: e.target.value };
                        setPasswords(updated);
                        if (submitted) setPasswordErrors(validatePasswords(updated));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirm ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>
                  </div>
                  {submitted && passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-1.5 mt-3">
                  {[
                    { label: "At least 8 characters", test: passwords.newPassword.length >= 8 },
                    { label: "One uppercase letter", test: /[A-Z]/.test(passwords.newPassword) },
                    { label: "One number", test: /[0-9]/.test(passwords.newPassword) },
                  ].map((rule) => (
                    <div key={rule.label} className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full transition-all"
                        style={{ background: rule.test ? "#078DD4" : "#cbd5e1" }}
                      />
                      <span
                        className="text-xs transition-colors"
                        style={{ color: rule.test ? "#078DD4" : "#94a3b8" }}
                      >
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleResetPassword}
                  className="mt-6 w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "#078DD4" }}
                >
                  Reset Password
                </button>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 py-4 px-6 text-center">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Lotusss. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default isAuth(ForgotPassword);
