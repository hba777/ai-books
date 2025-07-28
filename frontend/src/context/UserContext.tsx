import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

export type User = {
  id: string
  username: string;
  role: string;
  department: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  editUser: (userId: string, update: Partial<User>) => Promise<void>;
};

const UserContext = createContext<UserContextType>({ user: null, loading: true, logout: async () => {}, login: async () => {}, deleteUser: async () => {}, editUser: async () => {} });

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user on mount to persist session
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/me");
        if (res.data && res.data.username) {
          setUser({
            id: res.data.id,
            username: res.data.username,
            role: res.data.role,
            department: res.data.department
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const logout = async () => {
    setUser(null);
    setLoading(false);
    try {
      await api.post("/users/logout"); // This should clear the cookie on the server
    } catch (err) {
      // Optionally handle error
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      await api.post("/users/login", { username, password });
      // After login, fetch user info
      const res = await api.get("/users/me");
      if (res.data && res.data.username) {
        setUser({
          id: res.data.id,
          username: res.data.username,
          role: res.data.role,
          department: res.data.department
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    await api.delete(`/users/${userId}`);
    // If the deleted user is the current user, log out
    if (user && user.id === userId) {
      await logout();
    }
  };

  const editUser = async (userId: string, update: Partial<User>) => {
    await api.patch(`/users/${userId}`, update);
    // If the edited user is the current user, refresh user info
    if (user && user.id === userId) {
      const res = await api.get("/users/me");
      if (res.data && res.data.username) {
        setUser({
          id: res.data.id,
          username: res.data.username,
          role: res.data.role,
          department: res.data.department
        });
      }
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, logout, login, deleteUser, editUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 