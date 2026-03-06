import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Common/Button.jsx';
import Input from '../../components/Common/Input.jsx';
import Card from '../../components/Common/Card.jsx';
import { useForm } from '../../hooks/useForm.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
} from '../../utils/validators.js';
import authService from '../../services/authService.js';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { error: notifyError, success: notifySuccess } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm(
      {
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      },
      async (formValues) => {
        setIsLoading(true);
        try {
          // Validate form
          const newErrors = {};
          if (!formValues.name || !validateName(formValues.name)) {
            newErrors.name = 'Please enter a valid name';
          }
          if (!formValues.email || !validateEmail(formValues.email)) {
            newErrors.email = 'Please enter a valid email';
          }
          if (!formValues.phone || !validatePhone(formValues.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
          }
          if (!formValues.password || !validatePassword(formValues.password)) {
            newErrors.password = 'Password must be at least 6 characters';
          }
          if (formValues.password !== formValues.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
          }

          if (Object.keys(newErrors).length > 0) {
            notifyError('Please fix the errors below');
            return;
          }

          const data = await authService.register({
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone,
            password: formValues.password,
          });

          login(data.user, data.accessToken, data.refreshToken);
          notifySuccess('Account created successfully!');
          navigate('/dashboard');
        } catch (err) {
          const errorMsg =
            err.response?.data?.message ||
            'Signup failed. Please try again.';
          notifyError(errorMsg);
        } finally {
          setIsLoading(false);
        }
      }
    );

  const phoneError = touched.phone &&
    values.phone &&
    !validatePhone(values.phone) && 'Please enter a valid phone number';

  return (
    <div className="min-h-screen bg-[#F4F9F6] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#EAF9F1] rounded-full blur-[100px] -ml-64 -mt-64 opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#EBF8FF] rounded-full blur-[80px] -mr-48 -mb-48 opacity-50"></div>

      <div className="w-full max-w-lg relative z-10 transition-all duration-700">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="text-6xl font-black text-[#1A1A2E] tracking-tighter flex items-center justify-center gap-3">
            <span className="text-[#2ECC71]">🌱</span> BHUMISAKHI
          </div>
          <p className="text-[10px] font-black text-[#636E72] uppercase tracking-[0.5em] mt-4 shadow-sm">Next-Gen Agricultural OS</p>
        </div>

        {/* Signup Card */}
        <Card className="!p-12 border-[#E0E0E0] shadow-2xl !bg-white rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2ECC71] to-[#27AE60]"></div>
          <h2 className="text-4xl font-black text-[#1A1A2E] mb-3 tracking-tighter">Initialize Account</h2>
          <p className="text-[#636E72] mb-10 font-bold leading-relaxed uppercase tracking-widest text-[10px]">
            Join the decentralized network of data-driven farmers.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.name}
              error={
                touched.name && !validateName(values.name)
                  ? 'Name must be between 2-100 characters'
                  : ''
              }
              required
            />

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
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.phone}
              error={phoneError}
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

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.confirmPassword}
              error={
                touched.confirmPassword &&
                  values.confirmPassword &&
                  values.password !== values.confirmPassword
                  ? 'Passwords do not match'
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[#636E72] font-bold text-sm">
              Already integrated?{' '}
              <Link
                to="/login"
                className="text-[#2ECC71] font-black uppercase tracking-widest text-xs hover:text-[#27AE60] transition-colors ml-2"
              >
                Access Terminal
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-[#636E72] font-black uppercase tracking-[0.2em] text-[9px] mt-12">
          © 2026 BHUMISAKHI OS. SECURE REGISTRATION.
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
