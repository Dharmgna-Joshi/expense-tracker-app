// src/hooks/useAutoLogout.js
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const useAutoLogout = (timeout = 30 * 60 * 1000) => { // 30 mins by default
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      if (auth.currentUser) {
        timer = setTimeout(() => {
          signOut(auth).then(() => {
            window.location.href = "/login"; // or use navigate()
          });
        }, timeout);
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // init timer

    return () => {
      clearTimeout(timer);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [timeout]);
};

export default useAutoLogout;
