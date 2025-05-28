import Auth from "../components/Auth";

const page = () => {
  
  const signIn = async (email, password) => {
    "use server";
    try {
      const response = await fetch(`${process.env.BASE_URL}/users/login`, {
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
         // localStorage.setItem('user_id', data.user_id);
         console.log("Signed in successfully!");
         return {isSuccessful: true, user_id: data.user_id}
      } else {
         throw new Error("Sign-in successful, but no user ID received.");
      }

    } catch (error) {
      console.log(error.message);
    }
  };

  const signUp = async (email, password, confirmPassword) => {
    "use server";
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${process.env.BASE_URL}/users/register`, {
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
      console.log("Signed up successfully! You can now log in.");
      setType("login");
      // Handle successful sign-up
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
   <Auth signIn={signIn} signUp={signUp}/>
   </>
  );
};

export default page;
