
type LogoProps = {
  light?: boolean;
};

export default function Logo({ light = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg">
        C
      </div>

      <div>
        <h1
          className={`text-xl font-bold ${
            light ? "text-white" : "text-slate-900"
          }`}
        >
          CampusFlow <span className="text-blue-500">AI</span>
        </h1>

        <p
          className={`text-xs ${
            light ? "text-blue-100" : "text-slate-500"
          }`}
        >
          Smart Campus Management
        </p>
      </div>
    </div>
  );
}
