import React from "react";
import tw from "twin.macro";
import { useTheme } from "next-themes";

const Page: React.FC = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div tw="relative">
      <a
        aria-label="Toggle Dark Mode"
        type="button"
        tw="p-3 h-12 w-12 order-2 md:order-3"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        Toggle Dark Mode
      </a>
    </div>
  );
};

export default Page;
