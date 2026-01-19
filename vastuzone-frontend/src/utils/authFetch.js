import { auth } from "../firebase";

const authFetch = async (url, options = {}) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated yet");
  }

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-uid": user.uid,
      ...(options.headers || {}),
    },
  });
};

export default authFetch;
