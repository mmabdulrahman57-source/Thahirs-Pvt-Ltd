import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { COMPANY } from '../data/company';
import Logo from '../components/ui/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const { login, register, redirectAfterLogin, setRedirectAfterLogin } = useAuth();
  const navigate = useNavigate();

  const handleRedirect = (role: string) => {
    const dest = redirectAfterLogin || (role === 'admin' ? '/admin' : '/dashboard');
    setRedirectAfterLogin(null);
    navigate(dest);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      handleRedirect(user.role);
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !email || !password) { toast.error('Please fill in required fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register({ name: regName, email, password, company: regCompany });
      toast.success('Account created successfully!');
      handleRedirect(user.role);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-charcoal overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal/90 to-primary/20" />
        </div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Logo size="xl" className="rounded-xl bg-white" />
            <div>
              <div className="font-bold text-2xl text-white">THAHIRS (PVT) LTD</div>
              <div className="text-primary text-sm font-medium">Since 1949</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">{COMPANY.tagline}</h1>
          <p className="text-white/70 text-lg max-w-md leading-relaxed">
            Sri Lanka's trusted supplier of industrial hardware, valves, piping systems, and engineering solutions.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[{ v: '75+', l: 'Years' }, { v: '10K+', l: 'Products' }, { v: '5K+', l: 'Customers' }].map(s => (
            <div key={s.l} className="text-center">
              <div className="text-2xl font-bold text-primary">{s.v}</div>
              <div className="text-white/60 text-sm">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-light dark:bg-charcoal/95">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-primary mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Logo size="md" className="rounded-lg" />
            <div className="font-bold text-lg">THAHIRS (PVT) LTD</div>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-steel/20 rounded-xl">
            <button onClick={() => setTab('login')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'login' ? 'bg-white dark:bg-charcoal shadow text-primary' : 'text-charcoal/60'}`}>Login</button>
            <button onClick={() => setTab('register')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'register' ? 'bg-white dark:bg-charcoal shadow text-primary' : 'text-charcoal/60'}`}>Register</button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="bg-white dark:bg-charcoal rounded-2xl p-8 shadow-xl border border-steel/10 space-y-5">
              <div>
                <h2 className="text-2xl font-bold mb-1">Welcome Back</h2>
                <p className="text-charcoal/60 dark:text-white/60 text-sm">Sign in to your account</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@company.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-12" placeholder="Enter password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-primary">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded accent-primary" />
                  Remember me
                </label>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="bg-white dark:bg-charcoal rounded-2xl p-8 shadow-xl border border-steel/10 space-y-5">
              <div>
                <h2 className="text-2xl font-bold mb-1">Create Account</h2>
                <p className="text-charcoal/60 dark:text-white/60 text-sm">Register to request quotations</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                <input required value={regName} onChange={e => setRegName(e.target.value)} className="input-field" placeholder="Your full name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Company</label>
                <input value={regCompany} onChange={e => setRegCompany(e.target.value)} className="input-field" placeholder="Company name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email Address *</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@company.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-12" placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-primary">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
