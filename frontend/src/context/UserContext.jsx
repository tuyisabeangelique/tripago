import { createContext, useState, useEffect } from "react";

export const UserContext = createContext({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);


  // This loads user info on first load or after login
  useEffect(() => {
    const fetchUser = async () => {
      console.log("Fetching user")
      try {
        const res = await fetch("/CSE442/2025-Spring/cse-442aj/backend/api/users/getUserInfo.php", {
          credentials: "include",
        });
        const data = await res.json();
        console.log("user fetched is:", data)
        if (data.success) {
          setUser({
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            username: data.user.first_name,
            email: data.user.email
          });
        }
      } catch (err) {
        console.error("Failed to load user info:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
