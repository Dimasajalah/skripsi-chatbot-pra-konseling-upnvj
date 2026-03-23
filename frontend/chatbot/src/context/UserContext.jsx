// frontend/chatbot/src/context/UserContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("UserContext render", user);

  // RESTORE USER SAAT RELOAD
  useEffect(() => {
    const initUser = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (err) {
        console.error("[UserContext] auth/me failed", err);
        sessionStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return ctx;
}
