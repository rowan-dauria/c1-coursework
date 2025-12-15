'use client';
import { useState } from "react";

const Train = () => {
    const [trainStatus, setTrainStatus] = useState<string>("");
    const [isTraining, setIsTraining] = useState<boolean>(false);
    const [modelStructure, setModelStructure] = useState<any[]>([]);
    const [trainingMetrics, setTrainingMetrics] = useState<any>(null);
    const [trainingHistory, setTrainingHistory] = useState<{ loss: number; mae: number; val_loss?: number; val_mae?: number } | null>(null);
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

            // Fetch training history to get final metrics
            try {
                const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`);
                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    const history = historyData.history;
                    if (history) {
                        const finalMetrics: { loss: number; mae: number; val_loss?: number; val_mae?: number } = {
                            loss: history.loss?.[history.loss.length - 1] ?? 0,
                            mae: history.mae?.[history.mae.length - 1] ?? 0,
                        };
                        if (history.val_loss) {
                            finalMetrics.val_loss = history.val_loss[history.val_loss.length - 1];
                        }
                        if (history.val_mae) {
                            finalMetrics.val_mae = history.val_mae[history.val_mae.length - 1];
                        }
                        setTrainingHistory(finalMetrics);
                    }
                }
            } catch (historyError) {
                console.error("Error fetching history:", historyError);
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
                        <div className="number-input-wrapper">
                            <input
                                type="number"
                                value={maxIter}
                                onChange={(e) => setMaxIter(parseInt(e.target.value) || 100)}
                                min="1"
                                className="form-input"
                            />
                            <div className="spin-buttons">
                                <button type="button" className="spin-btn" onClick={() => setMaxIter(prev => prev + 10)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                                <button type="button" className="spin-btn" onClick={() => setMaxIter(prev => Math.max(1, prev - 10))}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Learning Rate</label>
                        <div className="number-input-wrapper">
                            <input
                                type="number"
                                value={learningRate}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setLearningRate(isNaN(value) ? 0.001 : value);
                                }}
                                min="0.0001"
                                step="0.0001"
                                className="form-input"
                            />
                            <div className="spin-buttons">
                                <button type="button" className="spin-btn" onClick={() => setLearningRate(prev => Math.round((prev + 0.001) * 10000) / 10000)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                                <button type="button" className="spin-btn" onClick={() => setLearningRate(prev => Math.max(0.0001, Math.round((prev - 0.001) * 10000) / 10000))}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                            </div>
                        </div>
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
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                {modelStructure.length > 0 ? (
                    <div style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1.5rem'
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

                        {/* Trainable Params - Full Width */}
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.75rem'
                        }}>
                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.65rem',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>Trainable Parameters</div>
                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: 'var(--accent-primary)'
                            }}>{modelStructure.reduce((sum, layer) => sum + layer.params, 0).toLocaleString()}</div>
                        </div>

                        {/* Metrics Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '0.5rem'
                        }}>
                            {/* Train MSE */}
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.6rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.35rem'
                                }}>Train MSE</div>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--accent-primary)'
                                }}>{trainingHistory ? trainingHistory.loss.toExponential(2) : '—'}</div>
                            </div>

                            {/* Val MSE */}
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.6rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.35rem'
                                }}>Val MSE</div>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--accent-secondary, var(--accent-primary))'
                                }}>{trainingHistory?.val_loss ? trainingHistory.val_loss.toExponential(2) : '—'}</div>
                            </div>

                            {/* Train MAE */}
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.6rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.35rem'
                                }}>Train MAE</div>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--accent-primary)'
                                }}>{trainingHistory ? trainingHistory.mae.toExponential(2) : '—'}</div>
                            </div>

                            {/* Val MAE */}
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.6rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.35rem'
                                }}>Val MAE</div>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--accent-secondary, var(--accent-primary))'
                                }}>{trainingHistory?.val_mae ? trainingHistory.val_mae.toExponential(2) : '—'}</div>
                            </div>
                        </div>
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
