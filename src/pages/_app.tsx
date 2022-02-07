import { AppProps } from "next/app";
import { GlobalStyles } from "twin.macro";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider, QueryClient } from "react-query";

import Header from "components/Header";
import Layout from "components/Layout";

import "src/styles/theme.css";
import "public/manifest.json";
import "public/icon-512.png";

const queryClient = new QueryClient();
const siteTitle = `libQuest`;

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" enableSystem={false}>
        <Header />
        <GlobalStyles />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
