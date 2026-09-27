import { Colors, type ColorScheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme: ColorScheme = scheme === 'dark' ? 'dark' : 'light';

  return Colors[theme];
}
