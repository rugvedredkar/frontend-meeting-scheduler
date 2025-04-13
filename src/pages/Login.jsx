import './Login.css';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';


export default function LoginPage() {

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState({
    google: false,
    microsoft: false
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {

    //   console.log(tokenResponse);
    //   console.log(tokenResponse.access_token);
    //   const decoded = jwtDecode(tokenResponse.access_token);
    //   console.log('Google user info:', decoded);
    
      // Store token or user data here if needed
      setIsLoading(prev => ({ ...prev, google: false }));

      navigate('/dashboard');
    },
    onError: () => {
      console.log('Google login failed');
      setIsLoading(prev => ({ ...prev, google: false }));
    },
  });

  return (
    <>
      {/* <style>{styles}</style> */}
      <div className="login-container">
        <div className="login-card-wrapper">
          <div className="app-branding">
            <div className="app-icon">
              <Calendar size={48} />
            </div>
            <h1 className="app-title">TimeSync</h1>
            <p className="app-subtitle">Sign in to access your calendar</p>
          </div>

          <div className="login-card">
            <div className="social-buttons">
              <button
                onClick={() => {
                  setIsLoading(prev => ({ ...prev, google: true }));
                  loginWithGoogle();
                }}
                
                disabled={isLoading.google || isLoading.microsoft}
                className="social-button"
              >
                {isLoading.google ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                      />
                      <path
                        fill="#4A90E2"
                        d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1818182,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>

              <button
                // onClick={() => handleSocialLogin('Microsoft')}
                // disabled={isLoading.google || isLoading.microsoft}
                className="social-button"
              >
                {isLoading.microsoft ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <svg className="social-icon" width="20" height="20" viewBox="0 0 23 23">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    Sign in with Microsoft
                    comig soon
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Link to="/dashboard">Go to Dashboard</Link>
    </>
  );
}