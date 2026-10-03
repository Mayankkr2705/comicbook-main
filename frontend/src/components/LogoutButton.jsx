import React from "react";
import { useAuthService } from "../services/authService";

const LogoutButton = () => {
  const { logout } = useAuthService();

  return (
    <button 
      onClick={logout}
      className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 font-semibold transition-all"
    >
      Log Out
    </button>
  );
};

export default LogoutButton;