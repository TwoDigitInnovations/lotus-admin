import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { MdEmail, MdPhone, MdPerson, MdEdit, MdCheck, MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile } from "@/redux/actions/userActions";
import isAuth from "@/components/isAuth";

function Profile(props) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const [profile, setProfile] = useState({ fullname: "", email: "", phone: "" });
  const [form, setForm] = useState({ fullname: "", email: "", phone: "" });
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile(router));
  }, []);

  useEffect(() => {
    if (user) {
      const data = {
        fullname: user.fullname || "",
        email: user.email || "",
        phone: user.phone || "",
      };
      setProfile(data);
      setForm(data);
    }
  }, [user]);

  const validate = (data = form) => {
    const errs = {};
    if (!data.fullname.trim()) errs.fullname = "Full name is required";
    if (!data.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Enter a valid email";
    if (!data.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^\+?[0-9\s\-]{7,15}$/.test(data.phone)) errs.phone = "Enter a valid phone number";
    return errs;
  };

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (submitted) setErrors(validate(updated));
  };

  const handleSave = async () => {
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      props.toaster({ type: "error", message: "Please fix the errors below" });
      return;
    }
    try {
      props.loader(true);
      const payload = new FormData();
      payload.append("fullname", form.fullname);
      payload.append("email", form.email);
      payload.append("phone", form.phone);
      const res = await dispatch(updateProfile(payload, router));
      if (res?.status) {
        setProfile({ ...form });
        setEditMode(false);
        setSubmitted(false);
        props.toaster({ type: "success", message: "Profile updated successfully!" });
      } else {
        props.toaster({ type: "error", message: res?.message || "Update failed." });
      }
    } catch (err) {
      props.toaster({ type: "error", message: err?.message || "Something went wrong." });
    } finally {
      props.loader(false);
    }
  };

  const handleCancel = () => {
    setForm({ ...profile });
    setErrors({});
    setSubmitted(false);
    setEditMode(false);
  };

  const inputCls = (hasError) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${
      hasError
        ? "border-red-300 bg-red-50"
        : editMode
        ? "border-gray-200 bg-white focus-within:border-[#078DD4]"
        : "border-transparent bg-gray-50"
    }`;

  const initial = profile.fullname
    ? profile.fullname.charAt(0).toUpperCase()
    : user?.name?.charAt(0).toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#0d1f35] m-0">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account information</p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.07)]">

          {/* banner */}
          <div className="h-24 bg-linear-to-br from-[#0d1f35] to-[#078DD4] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08)_0%,transparent_40%)]" />
            <span className="absolute bottom-3 right-5 text-[11px] font-semibold text-white/50 tracking-widest uppercase">
              Lotusss Admin
            </span>
          </div>

          <div className="px-7 pb-7">

            {/* avatar */}
            <div className="mt-4 mb-4">
              <div className="w-18 h-18 rounded-full border-4 border-white bg-linear-to-br from-[#0d1f35] to-[#078DD4] flex items-center justify-center shadow-[0_4px_12px_rgba(7,141,212,0.3)]">
                <span className="text-white text-2xl font-bold">{initial}</span>
              </div>
            </div>

            {/* name / email + action buttons */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="text-lg font-bold text-[#0d1f35]">
                  {profile.fullname || "Your Name"}
                </div>
                <div className="text-sm text-gray-400 mt-0.5">
                  {profile.email || "your@email.com"}
                </div>
              </div>

              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-none bg-[#078DD4] text-white text-sm font-semibold cursor-pointer shadow-[0_4px_12px_rgba(7,141,212,0.3)] hover:bg-[#0678b8] transition-colors mt-1"
                >
                  <MdEdit size={15} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <MdClose size={14} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-none bg-[#078DD4] text-white text-sm font-semibold cursor-pointer shadow-[0_4px_12px_rgba(7,141,212,0.3)] hover:bg-[#0678b8] transition-colors"
                  >
                    <MdCheck size={14} />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* divider */}
            <div className="h-px bg-gray-100 mb-5" />

            {/* section label */}
            <p className="text-[11px] font-bold text-[#078DD4] tracking-widest uppercase mb-5">
              Personal Information
            </p>

            {/* fields */}
            <div className="flex flex-col gap-4">

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Full Name
                </label>
                <div className={inputCls(submitted && errors.fullname)}>
                  <MdPerson className="text-[#078DD4] text-lg shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-300"
                    value={form.fullname}
                    disabled={!editMode}
                    onChange={(e) => handleChange("fullname", e.target.value)}
                  />
                </div>
                {submitted && errors.fullname && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <div className={inputCls(submitted && errors.email)}>
                  <MdEmail className="text-[#078DD4] text-lg shrink-0" />
                  <input
                    type="email"
                    placeholder="name@email.com"
                    className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-300"
                    value={form.email}
                    disabled={!editMode}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                {submitted && errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Phone Number
                </label>
                <div className={inputCls(submitted && errors.phone)}>
                  <MdPhone className="text-[#078DD4] text-lg shrink-0" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-300"
                    value={form.phone}
                    disabled={!editMode}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
                {submitted && errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default isAuth(Profile);
