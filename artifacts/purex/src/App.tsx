import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { HomePage } from "@/pages/HomePage";
import { VideoPage } from "@/pages/VideoPage";
import { SearchPage } from "@/pages/SearchPage";
import { TrendingPage } from "@/pages/TrendingPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { AuthPage } from "@/pages/AuthPage";
import { SubmitPage } from "@/pages/SubmitPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AdminPage } from "@/pages/admin/AdminPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/video/:slug" component={VideoPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/trending" component={TrendingPage} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/submit" component={SubmitPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
