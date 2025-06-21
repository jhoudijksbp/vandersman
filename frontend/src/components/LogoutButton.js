import { signOut } from "aws-amplify/auth";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Fout bij uitloggen:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-lg font-medium shadow bg-[rgb(113,148,48)] text-white hover:bg-[rgb(100,130,40)] transition"
    >
      Logout
    </button>
  );
}
