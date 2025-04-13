import LoginPage from "./pages/Login";
import { useState } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRoutes from "./routes/AppRoutes";

export default function App(){


  return (
    <GoogleOAuthProvider clientId="571552224930-p6hnre1jsl50s0lr1btuvg4eho9v81tv.apps.googleusercontent.com">
    <AppRoutes/>
    </GoogleOAuthProvider>
  )
}