import logoSrc from '../../assets/logo.png';

type LogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
};

const heights = {
  sm: 'h-9',
  md: 'h-10',
  lg: 'h-11',
  xl: 'h-14',
};

export default function Logo({ className = '', size = 'md', alt = 'THAHIRS logo' }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`w-auto object-contain shrink-0 ${heights[size]} ${className}`}
    />
  );
}
