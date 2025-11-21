"use client";

type ProviderProps = {
  children: React.ReactNode | React.ReactNode[];
};

export default function ProvidersClient({ children }: ProviderProps) {
  return <>{children}</>;
}
