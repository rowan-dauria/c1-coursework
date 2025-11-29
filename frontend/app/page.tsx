'use client';
import Upload from "./components/Upload";
import Train from "./components/Train";
import Predict from "./components/Predict";

const Home = () => {
  return (
    <main style={{ display: 'flex', padding: '20px', gap: '20px', fontFamily: 'sans-serif', flexDirection: 'row', height: '90vh' }}>
      <Upload />
      <Train />
      <Predict />
    </main>
  );
};

export default Home;