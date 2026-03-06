import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Common/Button.jsx';
import Input from '../../components/Common/Input.jsx';
import Card from '../../components/Common/Card.jsx';
import { useForm } from '../../hooks/useForm.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { validateEmail, validatePassword } from '../../utils/validators.js';
import authService from '../../services/authService.js';
import Loader from '../../components/Common/Loader.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { error: notifyError, success: notifySuccess } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm(
      {
        email: '',
        password: '',
      },
      async (formValues) => {
        setIsLoading(true);
        try {
          // Validate form
          const newErrors = {};
          if (!formValues.email) {
            newErrors.email = 'Email is required';
          } else if (!validateEmail(formValues.email)) {
            newErrors.email = 'Please enter a valid email';
          }
          if (!formValues.password) {
            newErrors.password = 'Password is required';
          } else if (!validatePassword(formValues.password)) {
            newErrors.password = 'Password must be at least 6 characters';
          }

          if (Object.keys(newErrors).length > 0) {
            Object.entries(newErrors).forEach(([field, message]) => {
              // Trigger validation
            });
            notifyError('Please fix the errors below');
            return;
          }

          const data = await authService.login(formValues);
          login(data.user, data.accessToken, data.refreshToken);
          notifySuccess('Login successful!');
          navigate('/dashboard');
        } catch (err) {
          const errorMsg =
            err.response?.data?.message || 'Login failed. Please try again.';
          notifyError(errorMsg);
        } finally {
          setIsLoading(false);
        }
      }
    );

  return (
    <div className="min-h-screen bg-[#F4F9F6] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#EAF9F1] rounded-full blur-[100px] -mr-64 -mt-64 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#EBF8FF] rounded-full blur-[80px] -ml-48 -mb-48 opacity-50"></div>

      <div className="w-full max-w-lg relative z-10 transition-all duration-700 ease-out">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="text-6xl font-black text-[#1A1A2E] tracking-tighter flex items-center justify-center gap-3">
            <span className="text-[#2ECC71]">🌱</span> BHUMISAKHI
          </div>
          <p className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.5em] mt-4 shadow-sm">Autonomous Agricultural OS</p>
        </div>

        {/* Login Card */}
        <Card className="!p-12 border-[#E0E0E0] shadow-2xl !bg-white rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2ECC71] to-[#27AE60]"></div>
          <h2 className="text-4xl font-black text-[#1A1A2E] mb-3 tracking-tighter">Terminal Access</h2>
          <p className="text-[#636E72] mb-10 font-bold leading-relaxed uppercase tracking-widest text-[10px]">
            Execute authorization protocol to access farm telemetry.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.email}
              error={
                touched.email && !validateEmail(values.email)
                  ? 'Please enter a valid email'
                  : ''
              }
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.password}
              error={
                touched.password && !validatePassword(values.password)
                  ? 'Password must be at least 6 characters'
                  : ''
              }
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[#636E72] font-bold text-sm">
              New to the ecosystem?{' '}
              <Link
                to="/signup"
                className="text-[#2ECC71] font-black uppercase tracking-widest text-xs hover:text-[#27AE60] transition-colors ml-2"
              >
                Create Instance
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-[#636E72] font-black uppercase tracking-[0.2em] text-[9px] mt-12">
          © 2026 BHUMISAKHI OS. ALL DATA ENCRYPTED.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
