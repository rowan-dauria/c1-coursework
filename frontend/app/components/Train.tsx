'use client';
import { useState } from "react";

const Train = () => {
    const [trainStatus, setTrainStatus] = useState<string>("");
    const [isTraining, setIsTraining] = useState<boolean>(false);
    const [modelStructure, setModelStructure] = useState<any[]>([]);
    const [trainingMetrics, setTrainingMetrics] = useState<any>(null);
    const [maxIter, setMaxIter] = useState<number>(100);
    const [learningRate, setLearningRate] = useState<number>(0.001);
    const [activation, setActivation] = useState<string>("relu");
    const [hiddenLayers, setHiddenLayers] = useState<string>("64,32,16");

    const handleTrain = async () => {
        setIsTraining(true);
        setTrainStatus("Training...");
        try {
            const hiddenLayersArray = hiddenLayers
                .split(',')
                .map(layer => parseInt(layer.trim()))
                .filter(layer => !isNaN(layer));

            if (hiddenLayersArray.length === 0) {
                setTrainStatus("Error: Invalid hidden layers format");
                setIsTraining(false);
                return;
            }

            const requestBody = {
                max_iter: maxIter,
                learning_rate: learningRate,
                activation: activation,
                hidden_layers: hiddenLayersArray
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/train`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Training failed");
            }

            const data = await response.json();
            setTrainStatus("success");
            if (data.model_structure) {
                setModelStructure(data.model_structure);
            }
            if (data.metrics) {
                setTrainingMetrics(data.metrics);
            }
        } catch (error) {
            console.error(error);
            setTrainStatus(`error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsTraining(false);
        }
    };

    return (
        <div className="glass-card" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 200px)',
            minHeight: '600px'
        }}>
            <h2 className="section-header">Train</h2>

            {/* Hyperparameters Panel */}
            <div className="inner-panel" style={{ marginBottom: '1rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>Hyperparameters</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                        <label className="form-label">Max Iterations</label>
                        <input
                            type="number"
                            value={maxIter}
                            onChange={(e) => setMaxIter(parseInt(e.target.value) || 100)}
                            min="1"
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label className="form-label">Learning Rate</label>
                        <input
                            type="number"
                            value={learningRate}
                            onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.001)}
                            min="0.0001"
                            step="0.0001"
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label className="form-label">Activation</label>
                        <select
                            value={activation}
                            onChange={(e) => setActivation(e.target.value)}
                            className="form-select"
                        >
                            <option value="relu">ReLU</option>
                            <option value="tanh">Tanh</option>
                            <option value="sigmoid">Sigmoid</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Hidden Layers</label>
                        <input
                            type="text"
                            value={hiddenLayers}
                            onChange={(e) => setHiddenLayers(e.target.value)}
                            placeholder="64,32,16"
                            className="form-input"
                        />
                    </div>
                </div>
                <p className="helper-text" style={{ marginTop: '0.75rem' }}>
                    Layer sizes separated by commas (e.g., 64,32,16)
                </p>
            </div>

            {/* Training Results Panel */}
            <div className="inner-panel" style={{
                flex: 1,
                marginBottom: '1rem',
                overflowY: 'auto'
            }}>
                {modelStructure.length > 0 ? (
                    <div style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'var(--accent-success)',
                                boxShadow: '0 0 8px var(--accent-success)'
                            }}></span>
                            <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.75rem',
                                color: 'var(--accent-success)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>Model Trained</span>
                        </div>

                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Layer</th>
                                    <th>Shape</th>
                                    <th>Params</th>
                                </tr>
                            </thead>
                            <tbody>
                                {modelStructure.map((layer, index) => (
                                    <tr key={index}>
                                        <td>{layer.name}</td>
                                        <td>{layer.output_shape}</td>
                                        <td>{layer.params.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {trainingMetrics && (
                            <div style={{
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--border-color)'
                            }}>
                                <div className="data-label" style={{ marginBottom: '0.5rem' }}>Metrics</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                    {Object.entries(trainingMetrics).map(([key, value]) => (
                                        <div key={key} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '0.5rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: 'var(--radius-sm)'
                                        }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{key}</span>
                                            <span className="data-value">{typeof value === 'number' ? value.toFixed(4) : String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : trainStatus.startsWith('error') ? (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-error)'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}>
                            <circle cx="12" cy="12" r="10" />
                            <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
                        </svg>
                        <p style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.8rem',
                            textAlign: 'center'
                        }}>
                            {trainStatus.replace('error: ', '')}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)'
                    }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                        </svg>
                        <p style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.85rem',
                            textAlign: 'center'
                        }}>
                            Configure and train<br />to see model structure
                        </p>
                    </div>
                )}
            </div>

            <button
                onClick={handleTrain}
                disabled={isTraining}
                className="btn-primary"
                style={{
                    opacity: isTraining ? 0.7 : 1,
                    cursor: isTraining ? 'not-allowed' : 'pointer'
                }}
            >
                {isTraining ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                        </svg>
                        Training...
                    </span>
                ) : (
                    'Train Model'
                )}
            </button>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Train;
