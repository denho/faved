import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useContext, useEffect } from 'react';
import { StoreContext } from './store/storeContext';
import { Login } from './pages/Login.tsx';
import { Setup } from './pages/Setup.tsx';
import { SetupAuth } from './pages/SetupAuth.tsx';
import { SetupImport } from './pages/SetupImport.tsx';
import { SetupIntegrations } from './pages/SetupIntegrations.tsx';
import { Toaster } from './components/ui/sonner';
import { NotFound } from './layouts/NotFound.tsx';
import { RouterProvider } from 'react-router';
import { Spinner } from '@/components/ui/spinner.tsx';
import { ItemList } from '@/pages/ItemList.tsx';
import { CreateItem } from '@/pages/CreateItem.tsx';
import { EditItem } from '@/pages/EditItem.tsx';

const InitMiddleware = observer(() => {
  const store = useContext(StoreContext);

  useEffect(() => {
    // If request was successful even with no user data, it means that setup and auth are not required, so we can set them to false
    const loadData = async () => {
      const response = await store.getUser(true);
      if (response !== null) {
        store.setIsSetupRequired(false);
        store.setIsAuthRequired(false);
      }
    };
    loadData();
  }, [store]);

  if (store.isSetupRequired === null || store.isAuthRequired === null) {
    return (
      <div className="bg-background flex h-full min-h-screen w-full flex-col items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
});

const AuthMiddleware = observer(() => {
  const store = useContext(StoreContext);
  const location = useLocation();

  if (store.isAuthRequired) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
});

const SetupMiddleware = observer(() => {
  const store = useContext(StoreContext);

  // If we are not on the setup page while DB is not initialized, redirect to setup
  if (store.isSetupRequired) {
    return <Navigate to="/setup" replace />;
  }

  // Otherwise continue
  return <Outlet />;
});

const router = createBrowserRouter([
  {
    element: <InitMiddleware />,
    children: [
      {
        element: <SetupMiddleware />,
        children: [
          { path: '/login', element: <Login /> },
          {
            element: <AuthMiddleware />,
            children: [
              { path: '/', element: <ItemList /> },
              { path: '/setup/auth', element: <SetupAuth /> },
              { path: '/setup/import', element: <SetupImport /> },
              { path: '/setup/integrations', element: <SetupIntegrations /> },
              { path: '/create-item', element: <CreateItem /> },
              { path: '/edit-item/:itemID', element: <EditItem /> },
            ],
          },
        ],
      },
      { path: '/setup', element: <Setup />, id: 'setup' },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
