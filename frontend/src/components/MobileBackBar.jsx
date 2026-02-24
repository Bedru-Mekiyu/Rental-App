import { useNavigate } from "react-router-dom";

export default function MobileBackBar({ to, label = "Back" }) {
  const navigate = useNavigate();

  if (to === undefined || to === null) return null;

  return (
    <div className="mobile-back-bar sm:hidden">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(to)}
          className="btn-pill btn-outline btn-outline-neutral"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
