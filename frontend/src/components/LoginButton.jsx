import React from "react";
import { useAuthService } from "../services/authService";

const LoginButton = () => {
  const { login } = useAuthService();

  return (
    <button 
      onClick={login}
      className="btn-fun bg-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400 text-purple-900 px-6 py-2 font-bold transition-all"
    >
      Log In
    </button>
  );
};

export default LoginButton;