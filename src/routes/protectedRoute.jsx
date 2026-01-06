import { useAuth, useUser } from "@clerk/clerk-react";
import { Route, Redirect } from "wouter";
import { Suspense } from "react"; // 1. Importar o Suspense
import PageLoading from "../components/Loading";

export default function ProtectedRoute({ path, component: Component }) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  // Se o Clerk ainda estiver carregando a sessão, mostra loading
  if (!authLoaded || !userLoaded) {
    return (
      <Route path={path}>
        <PageLoading />
      </Route>
    );
  }

  return (
    <Route path={path}>
      {() => {
        // Se não estiver logado, redireciona para o login
        if (!isSignedIn) {
          return <Redirect to="/login" />;
        }

        // Prepara os dados do usuário de forma segura
        const userData = {
          id: user?.id || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          name: user?.firstName || user?.username || "Maker",
          role: user?.publicMetadata?.role || "user",
        };

        // 2. IMPORTANTE: Como as páginas são LAZY (importadas com lazy()), 
        // a renderização deve estar dentro de um Suspense.
        return (
          <Suspense fallback={<PageLoading />}>
            <Component user={userData} />
          </Suspense>
        );
      }}
    </Route>
  );
}