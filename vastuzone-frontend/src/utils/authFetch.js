import { auth } from "../firebase";

const authFetch = async (url, options = {}) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated yet");
  }

  const token = await user.getIdToken();

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-user-uid": user.uid, // Keep for backward compatibility if needed temporarily
      ...(options.headers || {}),
    },
  });
};

export default authFetch;
