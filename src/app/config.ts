import pkg from "../../package.json";

// Variabili di ambiente
export const isBrowser = typeof window !== "undefined";
export const isProd = process.env.NODE_ENV === "production";
export const isDev = !isProd;

export const SITE_LANG = "en";
export const SITE_DESCRIPTION = `Find and create gamified quizzes, lessons, presentations, and flashcards for students, employees, and everyone else. Get started for free!`;
export const SITE_VERSION = `v${pkg.version}`;
