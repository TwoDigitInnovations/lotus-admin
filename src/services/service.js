import axios from "axios";

let rawBase = process.env.NEXT_PUBLIC_API_URL || "https://api.lotusssinfra.com/";

if (
  typeof window !== "undefined" &&
  window.location.protocol === "https:" &&
  rawBase.startsWith("http://")
) {
  rawBase = rawBase.replace("http://", "https://");
}

const ConstantsUrl = rawBase.endsWith("/") ? rawBase : rawBase + "/";
const TIMEOUT_MS = 15000;

function sanitizeError(err) {
  if (!err.response) return { message: "Network error. Please check your connection." };
  const status = err.response.status;
  const serverMsg = err.response.data?.message;
  return { status, message: serverMsg || "Something went wrong. Please try again." };
}

function handleAuthError(status, router) {
  if (typeof window === "undefined") return;
  if (status === 401 || status === 403) {
    localStorage.removeItem("userDetail");
    localStorage.removeItem("token");
    if (status === 401) router?.push("/login");
  }
}

function buildUrl(path) {
  try {
    return new URL(path, ConstantsUrl).href;
  } catch {
    return ConstantsUrl + path;
  }
}

function Api(method, url, data, router) {
  return new Promise(function (resolve, reject) {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }

    axios({
      method,
      url: buildUrl(url),
      data,
      timeout: TIMEOUT_MS,
      headers: { Authorization: `Bearer ${token}` },
    }).then(
      (res) => resolve(res.data),
      (err) => {
        handleAuthError(err.response?.status, router);
        reject(sanitizeError(err));
      },
    );
  });
}

function ApiFormData(method, url, data, router) {
  return new Promise(function (resolve, reject) {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }

    axios({
      method,
      url: buildUrl(url),
      data,
      timeout: TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }).then(
      (res) => resolve(res.data),
      (err) => {
        handleAuthError(err.response?.status, router);
        reject(sanitizeError(err));
      },
    );
  });
}

const timeSince = (date) => {
  date = new Date(date);
  const diff = new Date().valueOf() - date.valueOf();
  const seconds = Math.floor(diff / 1000);
  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " Years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Months" : " Month") +
      " ago"
    );
  }
  interval = seconds / 604800;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Weeks" : " Week") +
      " ago"
    );
  }

  interval = seconds / 86400;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Days" : " Day") +
      " ago"
    );
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Hours" : " Hour") +
      " ago"
    );
  }
  interval = seconds / 60;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Min" : " min") +
      " ago"
    );
  }
  return "Just now";
};

export { Api, timeSince, ApiFormData };
