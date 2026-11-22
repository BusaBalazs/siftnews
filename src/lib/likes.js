import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

const STORAGE_KEY = "siftnews-liked-ids";

// Which stories *this browser* has liked — purely local, so the heart
// stays filled on refresh. The actual like COUNT lives in Firestore and
// is shared by everyone.
export function getLikedIds() {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function persistLikedIds(ids) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

// Toggles a like for `id`: updates the local "liked by me" set
// synchronously (so the UI can react instantly), then fires the Firestore
// `likes` counter update (+1 / -1) in the background. Returns the new
// liked state (true/false).
export function toggleLike(id) {
  const liked = getLikedIds();
  const nowLiked = !liked.has(id);

  if (nowLiked) liked.add(id);
  else liked.delete(id);
  persistLikedIds(liked);

  updateDoc(doc(db, "stories", id), { likes: increment(nowLiked ? 1 : -1) }).catch((err) => {
    console.error("[toggleLike] Failed to update Firestore like count:", err);
  });

  return nowLiked;
}
