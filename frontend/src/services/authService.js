import { useAuth0 } from "@auth0/auth0-react";

export const useAuthService = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const login = async () => {
    await loginWithRedirect();
  };

  const logoutUser = () => {
    logout({
      logoutParams: {
        returnTo: import.meta.env.VITE_AUTH0_REDIRECT_URI,
      },
    });
  };

  const getAccessToken = async () => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: import.meta.env.VITE_AUTH0_SCOPE,
      },
    });
    return token;
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = await getAccessToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  };

  const getUserProfile = () => {
    if (!isAuthenticated || !user) return null;
    return {
      id: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
    };
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: logoutUser,
    getAccessToken,
    makeAuthenticatedRequest,
    getUserProfile,
  };
};