'use client';
import { useState } from "react";

const Home = () => {
  const [backendGreeting, setBackendGreeting] = useState<string>("");
  return (
    <main>
      <h1>Welcome to Next.js</h1>
      <p>This is a barebones Next.js application running in Docker.</p>
      <Button fetchFunc={fetchBackendGreeting} setBackendGreeting={setBackendGreeting} />
      <p>{backendGreeting}</p>
    </main>
  );
};

const fetchBackendGreeting = async (): Promise<string> => {
  try {
    const response = await fetch('/api');
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