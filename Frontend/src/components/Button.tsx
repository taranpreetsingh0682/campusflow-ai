
type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function Button({
  children,
  type = "submit",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
