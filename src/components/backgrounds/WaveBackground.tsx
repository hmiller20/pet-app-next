export function WaveBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-blue-50 overflow-hidden">
      {/* Wave container */}
      <div className="absolute bottom-0 left-0 right-0 h-64">
        {/* First wave */}
        <div className="absolute w-[200%] h-full">
          <div className="absolute top-0 left-0 w-full h-full 
            bg-[url('/wave1.svg')] bg-repeat-x opacity-40 animate-wave-slow" />
          <div className="absolute top-0 left-[50%] w-full h-full 
            bg-[url('/wave1.svg')] bg-repeat-x opacity-40 animate-wave-slow" />
        </div>

        {/* Second wave */}
        <div className="absolute w-[200%] h-full translate-y-6">
          <div className="absolute top-0 left-0 w-full h-full 
            bg-[url('/wave2.svg')] bg-repeat-x opacity-30 animate-wave-slow 
            [animation-delay:-.5s]" />
          <div className="absolute top-0 left-[50%] w-full h-full 
            bg-[url('/wave2.svg')] bg-repeat-x opacity-30 animate-wave-slow 
            [animation-delay:-.5s]" />
        </div>

        {/* Third wave */}
        <div className="absolute w-[200%] h-full translate-y-12">
          <div className="absolute top-0 left-0 w-full h-full 
            bg-[url('/wave3.svg')] bg-repeat-x opacity-20 animate-wave-slow 
            [animation-delay:-1s]" />
          <div className="absolute top-0 left-[50%] w-full h-full 
            bg-[url('/wave3.svg')] bg-repeat-x opacity-20 animate-wave-slow 
            [animation-delay:-1s]" />
        </div>
      </div>

      {/* Floating circles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 
          bg-blue-200 rounded-full opacity-20 animate-float-slow" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 
          bg-blue-300 rounded-full opacity-20 animate-float-slow 
          [animation-delay:-2s]" />
        <div className="absolute bottom-1/3 left-1/3 w-40 h-40 
          bg-blue-100 rounded-full opacity-20 animate-float-slow 
          [animation-delay:-4s]" />
      </div>
    </div>
  );
} 