"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Image from "next/image";

const Auth = ({ signIn, signUp }) => {
  const [type, setType] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (type === "login") {
      const res = await signIn(email, password);
      if (res.isSuccessful) {
        localStorage.setItem("user_id", res.user_id);
        router.push("/dashboard");
        setLoading(true);
      } else {
        alert("Error occured");
      }
    } else {
      await signUp(email, password, confirmPassword);
      setLoading(true);
    }
  };
  useEffect(() => {
    if (localStorage.getItem("user_id")) {
      router.push("/dashboard");
    }
  }, []);
  return (
    <div className="min-h-screen flex fle-col items-center justify-center">
      <div className="py-6 px-4">
        <div className="grid md:grid-cols-2 items-center gap-10 xl:gap-20 max-w-8xl w-full">
          <div className="border border-slate-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-md:mx-auto">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="mb-12">
                <h3 className="text-slate-900 text-3xl font-semibold">
                  {type == "login" ? "Sign in" : "Sign up"}
                </h3>
                <p className="text-slate-500 text-sm mt-6 leading-relaxed">
                  {type == "login"
                    ? "Sign in to your account and explore a world of possibilities. Your journey begins here."
                    : "Sign up to create an account and start your journey."}
                </p>
              </div>

              <div>
                <label className="text-slate-800 text-sm font-medium mb-2 block">
                  Email
                </label>
                <div className="relative flex items-center">
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-800 text-sm font-medium mb-2 block">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              {type == "signup" && (
                <div>
                  <label className="text-slate-800 text-sm font-medium mb-2 block">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="confirm-password"
                      type="password"
                      required
                      className="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#bbb"
                      stroke="#bbb"
                      className="w-[18px] h-[18px] absolute right-4 cursor-pointer"
                      viewBox="0 0 128 128"
                    >
                      <path
                        d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                        data-original="#000000"
                      ></path>
                    </svg>
                  </div>
                </div>
              )}

              {type == "login" ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-3 block text-sm text-slate-500"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>

                  <div className="!mt-12">
                    <button
                      type="submit"
                      className="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
                    >
                      {loading ? (
                        <AiOutlineLoading3Quarters
                          size={20}
                          color="white"
                          className="animate-spin mx-auto"
                        />
                      ) : (
                        "Sign in"
                      )}
                    </button>
                    <p className="text-sm !mt-6 text-center text-slate-500">
                      Don't have an account{" "}
                      <button
                        onClick={() => setType("signup")}
                        className="text-blue-600 font-medium hover:underline ml-1 whitespace-nowrap"
                      >
                        Sign up here
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="!mt-12">
                    <button
                      type="submit"
                      className="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
                    >
                      {loading ? (
                        <AiOutlineLoading3Quarters
                          size={20}
                          color="white"
                          className="animate-spin mx-auto"
                        />
                      ) : (
                        "Sign up"
                      )}
                    </button>
                    <p className="text-sm !mt-6 text-center text-slate-500">
                      Already have an account{" "}
                      <button
                        onClick={() => setType("login")}
                        className="text-blue-600 font-medium hover:underline ml-1 whitespace-nowrap cursor-pointer"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                </>
              )}
            </form>
          </div>

          <div className="hidden md:block max-md:mt-8 relative w-full aspect-[71/50]">
            <Image
              src="/login-image.webp"
              alt="login img"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover rounded-lg transition-all duration-300 md:hover:scale-105"
              quality={90}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
