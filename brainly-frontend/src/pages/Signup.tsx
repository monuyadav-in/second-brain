import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { BrainIcon } from "../icons/brainIcons";

export function Signup() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (!firstName.trim()) {
            setError("Please enter your first name.");
            return;
        }

        if (!email.trim() || !password.trim()) {
            setError("Email address and password are required.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                password: password.trim(),
            });

            const msg = response.data?.message || "Account created successfully!";
            setSuccess(`${msg} Redirecting to sign in...`);

            setTimeout(() => {
                navigate("/signin");
            }, 1200);
        } catch (err: any) {
            console.error("Signup error:", err);
            const errorMsg =
                err.response?.data?.message ||
                (err.code === "ERR_NETWORK"
                    ? "Cannot connect to Brainly backend. Please ensure the backend is running on port 3000."
                    : "Signup failed. An account with this email may already exist.");
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
                        Create your Second Brain
                    </h1>
                    <p className="text-sm text-gray-500 mt-1.5 max-w-xs">
                        Store tweets, videos, links, and documents in your personal knowledge base.
                    </p>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5 animate-fadeIn">
                        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-start gap-2.5 animate-fadeIn">
                        <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{success}</span>
                    </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Input
                                label="First Name"
                                id="signup-firstname"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="e.g. John"
                                autoComplete="given-name"
                                required
                            />
                        </div>
                        <div>
                            <Input
                                label="Last Name"
                                id="signup-lastname"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="e.g. Doe"
                                autoComplete="family-name"
                            />
                        </div>
                    </div>

                    <div>
                        <Input
                            label="Email Address"
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <div className="relative">
                            <Input
                                label="Password"
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a strong password"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-[35px] text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
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
                            text={loading ? "Creating Account..." : "Sign Up"}
                            className="py-3 text-base shadow-md shadow-purple-600/20"
                        />
                    </div>
                </form>

                {/* Footer link */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                        to="/signin"
                        className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default Signup;