import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Receipt, Eye, EyeSlash } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login } = useAuth();

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }

    if (password.length < 6) {
      setPasswordError("Password is required.");
      valid = false;
    }

    if (!valid) return;

    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Logged in successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center overflow-hidden p-4 bg-gradient-to-br from-[#a1c4fd] to-[#c2e9fb] ">
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-xl rounded-xl ">
        <div className="w-full h-full z-2 absolute bg-gradient-to-t from-transparent to-black"></div>
        <div className="flex absolute z-2 overflow-hidden backdrop-blur-2xl">
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-black/70 to-white/30 opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-black/70 to-white/30 opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-black/70 to-white/30 opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-black/70 to-white/30 opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-black/70 to-white/30 opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-black/70 to-white/30 opacity-30 overflow-hidden"></div>
        </div>
        <div className="w-[15rem] h-[15rem] bg-amber-500 absolute z-1 rounded-full bottom-0"></div>
        <div className="w-[8rem] h-[5rem] bg-white absolute z-1 rounded-full bottom-0"></div>
        <div className="w-[8rem] h-[5rem] bg-white absolute z-1 rounded-full bottom-0"></div>

        <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-bl-3xl overflow-hidden">
          <h1 className="text-2xl md:text-3xl font-medium leading-tight z-10 tracking-tight relative text-yellow-600">
            BrahmDev Prasad  Jewellers
          </h1>
          <p className="text-lg md:text-xl opacity-80 mt-4 z-10 relative">
            Professional Digital Billing System for Jewelry Business
          </p>
          <div className="mt-8 z-10 relative">
            <p className="text-sm opacity-60">
              Manage your jewelry inventory, customers, and billing with ease.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-secondary z-50 text-secondary-foreground">
          <div className="flex flex-col items-left mb-8">
            <div className="text-amber-500 mb-4">
              <Receipt className="h-10 w-10" weight="bold" />
            </div>
            <h2 className="text-3xl font-medium mb-2 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-left opacity-80">
              Sign in to access your jewelry billing system
            </p>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="email" className="block text-sm mb-2">
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="admin@arjunswarnkar.com"
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-amber-500 ${
                  emailError ? "border-red-500" : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
                autoComplete="email"
              />
              {emailError && (
                <p id="email-error" className="text-red-500 text-xs mt-1">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm mb-2">
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-amber-500 pr-10 ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!passwordError}
                  aria-describedby="password-error"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlash className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {passwordError && (
                <p id="password-error" className="text-red-500 text-xs mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in to Dashboard'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo Credentials:</strong><br />
              Email: admin@arjunswarnkar.com<br />
              Password: admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}