export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 bg-[#e3f2fd]">
      <div 
        className="absolute inset-0 bg-[url('/hex-pattern.png')] bg-repeat animate-scroll-bg"
        style={{ backgroundSize: '50px 50px' }}
      />
    </div>
  );
} 