import LandingCard from '../features/LandingPage/LandingForm';


export default function LoginPage() {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><circle cx='50' cy='50' r='40' fill='red'/></svg>`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg) }")`}}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
      {/* Centered Login Card */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <LandingCard />
      </div>
    </div>
  );
}
