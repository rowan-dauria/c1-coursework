'use client';
import { useState } from "react";
import FileUpload from "./components/FileUpload";


const Home = () => {
  const [trainStatus, setTrainStatus] = useState<string>("");
  const [modelStructure, setModelStructure] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [inputs, setInputs] = useState({ x1: 0, x2: 0, x3: 0, x4: 0, x5: 0 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) });
  };

  const handlePredict = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error(error);
      alert("Error making prediction");
    }
  };

  return (
    <main style={{ display: 'flex', height: '100vh', padding: '20px', gap: '20px', fontFamily: 'sans-serif', flexDirection: 'row' }}>
      {/* Column 1: Upload */}
      <div style={{ flex: 1, border: '2px solid #333', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '20px' }}>Upload</h2>
        <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
          <h3>Data exploration summary here</h3>
        </div>
        <FileUpload />
      </div>

      {/* Column 2: Train */}
      <div style={{ flex: 1, border: '2px solid #333', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '20px' }}>Train</h2>
        <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '20px', padding: '20px', marginBottom: '20px', overflowY: 'auto' }}>
          <h3>training hyperparameters here</h3>
        </div>
        <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '20px', padding: '20px', marginBottom: '20px', overflowY: 'auto' }}>
          {modelStructure.length > 0 ? (
            <>
              <h3>Model Structure</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.8em' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                    <th style={{ padding: '4px' }}>Layer</th>
                    <th style={{ padding: '4px' }}>Shape</th>
                    <th style={{ padding: '4px' }}>Param #</th>
                  </tr>
                </thead>
                <tbody>
                  {modelStructure.map((layer, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px' }}>{layer.name}</td>
                      <td style={{ padding: '4px' }}>{layer.output_shape}</td>
                      <td style={{ padding: '4px' }}>{layer.params}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <h3>training summary here</h3>
          )}
        </div>
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
        }} style={{
          padding: '15px',
          backgroundColor: '#90cdf4',
          border: '2px solid #3182ce',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '1.2em',
          fontWeight: 'bold'
        }}>
          train
        </button>
        {trainStatus && <p style={{ marginTop: '10px', textAlign: 'center' }}>{trainStatus}</p>}
      </div>

      {/* Column 3: Predict */}
      <div style={{ flex: 1, border: '2px solid #333', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2 style={{ marginBottom: '20px' }}>Predict</h2>
        {['x1', 'x2', 'x3', 'x4', 'x5'].map((key) => (
          <div key={key} style={{ backgroundColor: '#e2e8f0', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>{key} input</label>
            <input
              name={key}
              type="number"
              onChange={handleInputChange}
              style={{ flex: 1, padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>
        ))}

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '150px', height: '150px', backgroundColor: '#e2e8f0', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', fontWeight: 'bold' }}>
            {prediction !== null ? prediction.toFixed(4) : "y_pred"}
          </div>
        </div>

        <button onClick={handlePredict} style={{
          padding: '15px',
          backgroundColor: '#90cdf4',
          border: '2px solid #3182ce',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '1.2em',
          fontWeight: 'bold'
        }}>
          predict
        </button>
      </div>
    </main>
  );
};

export default Home;