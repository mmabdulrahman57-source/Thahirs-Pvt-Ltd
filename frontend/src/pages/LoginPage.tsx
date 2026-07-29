import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Loader2, Mail, Lock, Shield, Award, Truck, Headphones,
  ArrowRight, Globe, MessageCircle, LayoutDashboard, FileText, Package,
  CircleDot, Settings2, GitBranch, Cylinder,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { COMPANY } from '../data/company';
import { STATIC_BRANDS } from '../data/static';
import Logo from '../components/ui/Logo';
import productsHero from '../assets/products-hero.png';

const FEATURES = [
  { icon: Shield, label: 'ISO 9001:2015 Certified' },
  { icon: Award, label: 'Genuine Products' },
  { icon: Truck, label: 'Island-wide Delivery' },
  { icon: Headphones, label: '24/7 Support' },
];

const PRODUCT_TILES = [
  { name: 'Ball Valves', icon: CircleDot },
  { name: 'Flanges', icon: Cylinder },
  { name: 'Gate Valves', icon: Settings2 },
  { name: 'Pipe Fittings', icon: GitBranch },
];

const STATS = [
  { value: '75+', label: 'Years Experience' },
  { value: '10K+', label: 'Products' },
  { value: '5K+', label: 'Happy Customers' },
  { value: '250+', label: 'Completed Projects' },
];

const TRUST_ITEMS = [
  { icon: Lock, label: 'Secure Encryption' },
  { icon: LayoutDashboard, label: 'Customer Dashboard' },
  { icon: FileText, label: 'Online Quotations' },
  { icon: Package, label: 'Order Tracking' },
];

function LoginIllustration() {
  return (
    <div className="relative mx-auto mb-6 h-28 w-44">
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <Shield size={28} className="text-white" strokeWidth={1.75} />
          <Lock
            size={14}
            className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-primary"
            strokeWidth={2.5}
          />
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <div className="flex h-16 w-24 items-end justify-center rounded-t-2xl bg-gradient-to-b from-steel/30 to-steel/10 border border-steel/20">
          <div className="mb-2 h-8 w-14 rounded-lg bg-charcoal/10" />
        </div>
        <div className="absolute -bottom-1 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-primary/20 border-2 border-primary/40" />
      </div>
    </div>
  );
}

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

  const whatsappUrl = `https://wa.me/${COMPANY.whatsapp}`;

  return (
    <div className="min-h-screen grid lg:grid-cols-[42%_58%]">
      {/* ── Left branding panel ── */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-charcoal p-8 xl:p-10">
        <div className="absolute inset-0">
          <img src={productsHero} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal/95 via-charcoal/88 to-charcoal/75" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
            <Logo size="lg" className="rounded-xl bg-white p-1" />
            <div>
              <div className="text-lg font-bold text-white leading-tight">{COMPANY.name}</div>
              <div className="text-sm font-semibold text-primary">Since {COMPANY.founded}</div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl xl:text-4xl font-bold leading-tight text-white">
              Engineering Excellence{' '}
              <span className="text-primary">Since {COMPANY.founded}</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 xl:text-base">
              Sri Lanka&apos;s trusted supplier of industrial hardware, valves, piping systems, and engineering solutions.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                  <Icon size={18} className="text-primary" strokeWidth={1.75} />
                </div>
                <p className="text-[10px] xl:text-xs leading-snug text-white/80">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {PRODUCT_TILES.map(({ name, icon: Icon }) => (
              <div
                key={name}
                className="group rounded-xl border border-primary/40 bg-charcoal/40 p-3 text-center backdrop-blur-sm transition-colors hover:border-primary hover:bg-primary/10"
              >
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/30">
                  <Icon size={22} className="text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-[10px] xl:text-xs font-medium text-white/90">{name}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4 border-t border-white/10 pt-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl xl:text-2xl font-bold text-primary">{value}</div>
                <div className="mt-0.5 text-[10px] xl:text-xs text-white/65">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-8 border-t border-white/10 pt-6">
          <p className="mb-4 text-center text-xs font-medium text-white/60">
            Suppliers of World-Class Industrial Brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {STATIC_BRANDS.map(brand => (
              <span key={brand._id} className="text-[11px] xl:text-xs font-semibold tracking-wide text-white/50 uppercase">
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Right auth panel ── */}
      <main className="flex min-h-screen flex-col bg-[#F3F4F6] dark:bg-charcoal/95">
        {/* Top bar */}
        <div className="flex items-center justify-end px-6 py-4 sm:px-10">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <MessageCircle size={16} />
            WhatsApp Us
          </a>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-4 pb-8 sm:px-8">
          <div className="w-full max-w-[440px]">
            {/* Mobile branding */}
            <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
              <Logo size="md" className="rounded-lg" />
              <div>
                <div className="font-bold text-charcoal dark:text-white">{COMPANY.name}</div>
                <div className="text-xs font-medium text-primary">Since {COMPANY.founded}</div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-charcoal p-7 sm:p-8 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] border border-steel/10">
              <LoginIllustration />

              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-charcoal dark:text-white">
                  {tab === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="mt-1 text-sm text-charcoal/60 dark:text-white/60">
                  {tab === 'login' ? 'Sign in to your account' : 'Register to request quotations'}
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-6 flex border-b border-steel/30">
                {(['login', 'register'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`flex-1 pb-3 text-sm font-semibold capitalize transition-colors ${
                      tab === t
                        ? 'text-primary border-b-2 border-primary -mb-px'
                        : 'text-charcoal/50 dark:text-white/50 hover:text-charcoal/80'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="form-group">
                    <label className="text-label">Email Address</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="input-field"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="text-label">Password</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="input-icon" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="input-field pr-2"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="shrink-0 text-charcoal/40 hover:text-primary transition-colors"
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal/70 dark:text-white/70">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={e => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => toast('Please contact us for password assistance.', { icon: '🔑' })}
                      className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary mt-2 w-full justify-between py-3.5 text-base"
                  >
                    <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                        <ArrowRight size={16} />
                      </span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="form-group">
                    <label className="text-label">Full Name *</label>
                    <div className="input-with-icon">
                      <input
                        required
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        className="input-field"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="text-label">Company</label>
                    <div className="input-with-icon">
                      <input
                        value={regCompany}
                        onChange={e => setRegCompany(e.target.value)}
                        className="input-field"
                        placeholder="Company name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="text-label">Email Address *</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="input-field"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="text-label">Password *</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="input-icon" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="input-field pr-2"
                        placeholder="Min. 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="shrink-0 text-charcoal/40 hover:text-primary transition-colors"
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary mt-2 w-full justify-between py-3.5 text-base"
                  >
                    <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                        <ArrowRight size={16} />
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* Trust indicators */}
              <div className="mt-8">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-steel/30" />
                  <span className="text-xs font-medium text-charcoal/50 dark:text-white/50 whitespace-nowrap">
                    Secure &amp; Trusted Login
                  </span>
                  <div className="h-px flex-1 bg-steel/30" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                      <Icon size={16} className="text-primary" strokeWidth={1.75} />
                      <span className="text-[10px] leading-tight text-charcoal/55 dark:text-white/55">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact footer */}
            <div className="mt-8 text-center">
              <p className="mb-4 text-sm font-semibold text-charcoal/70 dark:text-white/70">Contact Us</p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="inline-flex items-center gap-1.5 text-charcoal/60 hover:text-primary transition-colors dark:text-white/60"
                >
                  <Mail size={14} className="text-primary" />
                  {COMPANY.email}
                </a>
                <a
                  href="https://www.thahirs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-charcoal/60 hover:text-primary transition-colors dark:text-white/60"
                >
                  <Globe size={14} className="text-primary" />
                  www.thahirs.com
                </a>
              </div>
              <p className="mt-6 text-xs text-charcoal/40 dark:text-white/40">
                &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
              </p>
              <Link to="/" className="mt-3 inline-block text-xs text-primary hover:underline">
                &larr; Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
