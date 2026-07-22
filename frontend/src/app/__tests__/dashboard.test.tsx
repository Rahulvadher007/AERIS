import { render, screen } from '@testing-library/react';
import DashboardPage from '../dashboard/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, sizes, ...rest } = props;
    return <img {...rest} />;
  },
}));

vi.mock('next/dynamic', () => ({
  default: () => {
    const MockComp = () => <div />;
    return MockComp;
  },
}));

vi.mock('@/contexts/city-context', () => ({
  useCity: () => ({
    selectedCity: '',
    setSelectedCity: vi.fn(),
    availableCities: [],
    isLoadingCities: false,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

test('renders dashboard without crashing', () => {
  renderWithProviders(<DashboardPage />);
  expect(screen.getByText(/AERIS Command Center/i)).toBeInTheDocument();
});
