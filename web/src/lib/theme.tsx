/** The dashboard is light-only; the theme API is kept so consumers (e.g. the toaster) don't change. */
export const useTheme = () => ({ resolved: "light" as const });
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
