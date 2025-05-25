import React, { useState } from "react";

const Auth = () => {
  const [type, setType] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signIn = async () => {
    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Sign-in failed");
      }
      console.log(data)
      // Assuming the backend returns user_id on successful login
      if (data.user_id) {
        localStorage.setItem('user_id', data.user_id);
         alert("Signed in successfully!");
         window.location.href = "/dashboard"; // Redirect to dashboard on successful login
      } else {
         throw new Error("Sign-in successful, but no user ID received.");
      }

    } catch (error) {
      alert(error.message);
    }
  };

  const signUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Sign-up failed");
      }
      console.log(data)
      alert("Signed up successfully! You can now log in.");
      setType("login");
      // Handle successful sign-up
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "login") {
      signIn();
    } else {
      signUp();
    }
  };

  return (
    <div class="min-h-screen flex fle-col items-center justify-center">
      <div class="py-6 px-4">
        <div class="grid md:grid-cols-2 items-center gap-6 max-w-6xl w-full">
          <div class="border border-slate-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-md:mx-auto">
            <form class="space-y-6" onSubmit={handleSubmit}>
              <div class="mb-12">
                <h3 class="text-slate-900 text-3xl font-semibold">
                  {type == "login" ? "Sign in" : "Sign up"}
                </h3>
                <p class="text-slate-500 text-sm mt-6 leading-relaxed">
                  {type == "login" ? "Sign in to your account and explore a world of possibilities. Your journey begins here." : "Sign up to create an account and start your journey."}
                </p>
              </div>

              <div>
                <label class="text-slate-800 text-sm font-medium mb-2 block">
                  Email
                </label>
                <div class="relative flex items-center">
                  <input
                    name="email"
                    type="email"
                    required
                    class="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    class="w-[18px] h-[18px] absolute right-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="10"
                      cy="7"
                      r="6"
                      data-original="#000000"
                    ></circle>
                    <path
                      d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z"
                      data-original="#000000"
                    ></path>
                  </svg>
                </div>
              </div>
              <div>
                <label class="text-slate-800 text-sm font-medium mb-2 block">
                  Password
                </label>
                <div class="relative flex items-center">
                  <input
                    name="password"
                    type="password"
                    required
                    class="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    class="w-[18px] h-[18px] absolute right-4 cursor-pointer"
                    viewBox="0 0 128 128"
                  >
                    <path
                      d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                      data-original="#000000"
                    ></path>
                  </svg>
                </div>
              </div>
              {type == "signup" && (
                <div>
                  <label class="text-slate-800 text-sm font-medium mb-2 block">
                    Confirm Password
                  </label>
                  <div class="relative flex items-center">
                    <input
                      name="confirm-password"
                      type="password"
                      required
                      class="w-full text-sm text-slate-800 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#bbb"
                      stroke="#bbb"
                      class="w-[18px] h-[18px] absolute right-4 cursor-pointer"
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
                  <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        class="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                      <label
                        for="remember-me"
                        class="ml-3 block text-sm text-slate-500"
                      >
                        Remember me
                      </label>
                    </div>

                    <div class="text-sm">
                      <a
                        href="jajvascript:void(0);"
                        class="text-blue-600 hover:underline font-medium"
                      >
                        Forgot your password?
                      </a>
                    </div>
                  </div>

                  <div class="!mt-12">
                    <button
                      type="submit"
                      class="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
                    >
                      Sign in
                    </button>
                    <p class="text-sm !mt-6 text-center text-slate-500">
                      Don't have an account{" "}
                      <button
                        onClick={() => setType("signup")}
                        class="text-blue-600 font-medium hover:underline ml-1 whitespace-nowrap"
                      >
                        Sign up here
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div class="!mt-12">
                    <button
                      type="submit"
                      class="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
                    >
                      Sign up
                    </button>
                    <p class="text-sm !mt-6 text-center text-slate-500">
                      Already have an account{" "}
                      <button
                        onClick={() => setType("login")}
                        class="text-blue-600 font-medium hover:underline ml-1 whitespace-nowrap cursor-pointer"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                </>
              )}
            </form>
          </div>

          <div class="max-md:mt-8">
            <img
              src="https://readymadeui.com/login-image.webp"
              class="w-full aspect-[71/50] max-md:w-4/5 mx-auto block object-cover"
              alt="login img"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
