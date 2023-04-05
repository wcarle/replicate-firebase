import styles from '@/styles/Home.module.css';
import { Backdrop, CircularProgress, Container } from '@mui/material';
import { HeadSection } from '@/components/HeadSection';
import { useAnonAuth } from '@/hooks/useAnonAuth';
import { PromptArea } from '@/components/PromptArea';

export default function Home() {
  const { user } = useAnonAuth();

  return (
    <>
      <HeadSection />
      <main className={styles.main}>
        <Container maxWidth="md">
          {user && <PromptArea userId={user.uid} />}
          <Backdrop open={!user}>
            <CircularProgress />
          </Backdrop>
        </Container>
      </main>
    </>
  );
}
