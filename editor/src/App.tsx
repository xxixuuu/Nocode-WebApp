import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditorLayout } from './components/EditorLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EditorLayout />
    </QueryClientProvider>
  );
}

export default App;
