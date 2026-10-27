import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { BrainIcon } from "../icons/brainIcons";

export function Signin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError("Please enter your username and password.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username: username.trim(),
                password: password.trim(),
            });

            const token = response.data?.token;

            if (token) {
                localStorage.setItem("token", token);
                localStorage.setItem("username", username.trim());
                navigate("/dashboard");
            } else {
                setError("Authentication failed: No token returned from server.");
            }
        } catch (err: any) {
            console.error("Signin error:", err);
            const errorMsg =
                err.response?.data?.message ||
                (err.code === "ERR_NETWORK"
                    ? "Cannot connect to Brainly backend. Please ensure the backend is running on port 3000."
                    : "Invalid credentials. Please verify your username and password.");
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-purple-500/5 p-8 sm:p-10 transition-all">
                {/* Brand Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 transition-transform hover:scale-105">
                        <BrainIcon size="lg" className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-gray-500 mt-1.5 max-w-xs">
                        Sign in to access your personal second brain workspace.
                    </p>
                </div>

                {/* Error Notification */}
                {error && (
                    <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5 animate-fadeIn">
                        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Signin Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <Input
                            label="Username"
                            id="signin-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div>
                        <div className="relative">
                            <Input
                                label="Password"
                                id="signin-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-[35px] text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            fullWidth
                            loading={loading}
                            text={loading ? "Signing In..." : "Sign In"}
                            className="py-3 text-base shadow-md shadow-purple-600/20"
                        />
                    </div>
                </form>

                {/* Footer link */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default Signin;
