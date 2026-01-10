import InfographicGenerator from '@/components/infographic/InfographicGenerator';

export const metadata = {
  title: 'Infographic Generator | DANI',
  description: 'Generate visual infographics from your meetings and documents',
};

export default function InfographicPage() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--background)]">
      <InfographicGenerator />
    </div>
  );
}
