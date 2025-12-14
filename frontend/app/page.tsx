'use client';
import Upload from "./components/Upload";
import Train from "./components/Train";
import Predict from "./components/Predict";

const Home = () => {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      {/* Header */}
      <header style={{
        marginBottom: '2rem',
        textAlign: 'center',
        animation: 'fadeIn 0.6s ease forwards'
      }}>
        <h1 style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '2rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          5D Neural Interpolator
        </h1>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.85rem',
          color: '#64748b',
          letterSpacing: '0.05em'
        }}>
          Upload • Train • Predict
        </p>
      </header>

      {/* Main content */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        maxWidth: '1600px',
        margin: '0 auto',
        animation: 'fadeIn 0.6s ease 0.2s forwards',
        opacity: 0
      }}>
        <Upload />
        <Train />
        <Predict />
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        marginTop: '2rem',
        padding: '1rem',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem',
        color: '#475569',
        letterSpacing: '0.05em'
      }}>
        MPhil Data Intensive Science • C1 Research Computing
      </footer>
    </div>
  );
};

export default Home;
