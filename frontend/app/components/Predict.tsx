'use client';
import { useState } from "react";

const Predict = () => {
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
        <div style={{ flex: 1, border: '2px solid #333', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
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
    );
};

export default Predict;
