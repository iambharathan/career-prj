const WaveBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary wave */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[400px] animate-wave"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(200 90% 60% / 0.08)" />
            <stop offset="50%" stopColor="hsl(185 80% 55% / 0.1)" />
            <stop offset="100%" stopColor="hsl(200 90% 60% / 0.06)" />
          </linearGradient>
        </defs>
        <path
          fill="url(#waveGradient1)"
          d="M0,160 C320,260 420,100 720,180 C1020,260 1120,140 1440,200 L1440,400 L0,400 Z"
        />
      </svg>

      {/* Secondary wave */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[350px] animate-wave"
        style={{ animationDelay: '-5s' }}
        viewBox="0 0 1440 350"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(185 80% 55% / 0.05)" />
            <stop offset="50%" stopColor="hsl(200 90% 60% / 0.08)" />
            <stop offset="100%" stopColor="hsl(185 80% 55% / 0.04)" />
          </linearGradient>
        </defs>
        <path
          fill="url(#waveGradient2)"
          d="M0,200 C240,280 480,120 720,200 C960,280 1200,160 1440,220 L1440,350 L0,350 Z"
        />
      </svg>

      {/* Floating gradient blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-cyan/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-sky-light/10 rounded-full blur-3xl animate-float" />
    </div>
  );
};

export default WaveBackground;
