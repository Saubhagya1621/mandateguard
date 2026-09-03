import { ArrowUpRight } from "lucide-react";

function ExpandingButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`relative text-xs font-mono uppercase tracking-wider rounded-full h-10 p-1 ps-5 pe-11 group transition-all duration-500 hover:ps-11 hover:pe-5 w-fit overflow-hidden cursor-pointer bg-ink text-card ${className}`}
    >
      <span className="relative z-10 transition-all duration-500">{children}</span>
      <div className="absolute right-1 w-8 h-8 bg-card text-ink rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-32px)] group-hover:rotate-45">
        <ArrowUpRight size={14} />
      </div>
    </button>
  );
}

export default ExpandingButton;