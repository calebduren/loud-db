import { vi } from 'vitest';

export const mockSupabase = {
  rpc: vi.fn(),
  from: vi.fn()
};

vi.mock('../supabase', () => ({
  supabase: mockSupabase
}));
