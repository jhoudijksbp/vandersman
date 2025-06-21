import { signInWithRedirect } from "aws-amplify/auth";

export default function Login() {
  const handleLogin = () => {
    signInWithRedirect(); // opent Cognito Hosted UI
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-jordygroen mb-4">Welkom!</h1>
        <p className="mb-6 text-gray-700">Log in om verder te gaan</p>
        <button
          onClick={handleLogin}
          className="bg-jordygroen hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Login met Cognito
        </button>
      </div>
    </div>
  );
}
