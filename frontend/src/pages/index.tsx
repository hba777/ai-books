import LandingCard from '../features/LandingPage/LandingForm';

export default function LoginPage() {
  const svg = `<svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bgGradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%"><stop offset="0%" stop-color="#5B58FF"/><stop offset="50%" stop-color="#2563EB"/><stop offset="100%" stop-color="#7981B4" stop-opacity="0.68"/></radialGradient></defs><rect width="1440" height="900" fill="url(#bgGradient)"/></svg>`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`}}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
      {/* Centered Login Card */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <LandingCard />
      </div>
    </div>
  );
}
