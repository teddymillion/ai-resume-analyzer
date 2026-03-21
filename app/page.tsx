import ResumeAnalyzer from '@/components/resume-analyzer';
import AuthGuard from '@/components/auth/auth-guard';

export default function Home() {
  return (
    <AuthGuard>
      <ResumeAnalyzer />
    </AuthGuard>
  );
}
