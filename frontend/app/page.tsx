'use client';
import { useState } from "react";
import FileUpload from "./components/FileUpload";


const Home = () => {
  const [trainStatus, setTrainStatus] = useState<string>("");
  const [modelStructure, setModelStructure] = useState<any[]>([]);
  return (
    <main>
      <h1>Welcome to Next.js</h1>
      <p>This is a barebones Next.js application running in Docker.</p>
      <button onClick={async () => {
        setTrainStatus("Training...");
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/train`);
          const data = await response.json();
          setTrainStatus(data.message || "Training completed successfully");
          if (data.model_structure) {
            setModelStructure(data.model_structure);
          }
        } catch (error) {
          console.error(error);
          setTrainStatus("Error training model");
        }
      }} style={{ marginTop: '10px' }}>
        Train Model
      </button>
      {trainStatus && <p style={{ marginTop: '10px' }}>{trainStatus}</p>}
      {modelStructure.length > 0 && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h3>Model Structure</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Layer (Type)</th>
                <th style={{ padding: '8px' }}>Output Shape</th>
                <th style={{ padding: '8px' }}>Param #</th>
              </tr>
            </thead>
            <tbody>
              {modelStructure.map((layer, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{layer.name} ({layer.type})</td>
                  <td style={{ padding: '8px' }}>{JSON.stringify(layer.output_shape)}</td>
                  <td style={{ padding: '8px' }}>{layer.params}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <FileUpload />
    </main>
  );
};

export default Home;