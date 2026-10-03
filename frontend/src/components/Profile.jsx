import React from "react";
import { useAuthService } from "../services/authService";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuthService();

  if (isLoading) {
    return <div className="text-gray-400">Loading ...</div>;
  }

  return (
    isAuthenticated && (
      <div className="text-center">
        <img 
          src={user.picture} 
          alt={user.name} 
          className="rounded-full w-20 h-20 mx-auto mb-4 border border-zinc-700"
        />
        <h2 className="text-white text-xl font-bold">{user.name}</h2>
        <p className="text-gray-400">{user.email}</p>
      </div>
    )
  );
};

export default Profile;