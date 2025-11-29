'use client';
import { useState } from "react";

const Train = () => {
    const [trainStatus, setTrainStatus] = useState<string>("");
    const [modelStructure, setModelStructure] = useState<any[]>([]);

    return (
        <div style={{ flex: 1, border: '2px solid #333', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
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
    );
};

export default Train;
