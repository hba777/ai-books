import LandingCard from '../features/LandingPage/LandingForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{backgroundImage: 'url("/Landing.jpg")'}}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#0c1219]/80" />
      {/* Centered Login Card */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <LandingCard />
      </div>
    </div>
  );
}
