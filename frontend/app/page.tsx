'use client';
import { useState } from "react";
import FileUpload from "./components/FileUpload";


const Home = () => {
  const [backendGreeting, setBackendGreeting] = useState<string>("");
  const [trainStatus, setTrainStatus] = useState<string>("");
  return (
    <main>
      <h1>Welcome to Next.js</h1>
      <p>This is a barebones Next.js application running in Docker.</p>
      <Button fetchFunc={fetchBackendGreeting} setBackendGreeting={setBackendGreeting} />
      <p>{backendGreeting}</p>
      <button onClick={async () => {
        setTrainStatus("Training...");
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/train`);
          const data = await response.json();
          setTrainStatus(data.message || "Training completed successfully");
        } catch (error) {
          console.error(error);
          setTrainStatus("Error training model");
        }
      }} style={{ marginTop: '10px' }}>
        Train Model
      </button>
      {trainStatus && <p style={{ marginTop: '10px' }}>{trainStatus}</p>}
      <FileUpload />
    </main>
  );
};

const fetchBackendGreeting = async (): Promise<string> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api`);
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error(error);
    return 'Error fetching backend greeting';
  }
};

const Button = ({ fetchFunc, setBackendGreeting }:
  {
    fetchFunc: () => Promise<string>,
    setBackendGreeting: (greeting: string) => void
  }): JSX.Element => (
  <button onClick={() => {
    fetchFunc().then((greeting) => {
      setBackendGreeting(greeting);
    });
  }}>Backend Greeting</button>
);

export default Home;