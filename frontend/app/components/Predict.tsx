'use client';
import { useState } from "react";

const Predict = () => {
    const [prediction, setPrediction] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [inputs, setInputs] = useState({ x1: 0, x2: 0, x3: 0, x4: 0, x5: 0 });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) || 0 });
    };

    const handlePredict = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputs),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Prediction failed");
            }
            const data = await response.json();
            setPrediction(data.prediction);
        } catch (error) {
            console.error(error);
            setError(error instanceof Error ? error.message : "Error making prediction");
        } finally {
            setIsLoading(false);
        }
    };

    const featureLabels = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'];

    return (
        <div className="glass-card" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 200px)',
            minHeight: '600px'
        }}>
            <h2 className="section-header">Predict</h2>

            {/* Input Fields */}
            <div className="inner-panel" style={{ marginBottom: '1rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>Input Features</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['x1', 'x2', 'x3', 'x4', 'x5'].map((key, index) => (
                        <div key={key} style={{
                            display: 'grid',
                            gridTemplateColumns: '3rem 1fr',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <label style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: 'var(--accent-primary)',
                                textAlign: 'center'
                            }}>
                                {featureLabels[index]}
                            </label>
                            <div className="number-input-wrapper">
                                <input
                                    name={key}
                                    type="number"
                                    step="0.01"
                                    value={inputs[key as keyof typeof inputs]}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="0.00"
                                />
                                <div className="spin-buttons">
                                    <button type="button" className="spin-btn" onClick={() => setInputs(prev => ({ ...prev, [key]: Math.round((prev[key as keyof typeof inputs] + 0.1) * 100) / 100 }))}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </button>
                                    <button type="button" className="spin-btn" onClick={() => setInputs(prev => ({ ...prev, [key]: Math.round((prev[key as keyof typeof inputs] - 0.1) * 100) / 100 }))}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Prediction Result */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
            }}>
                <div className="prediction-orb" style={{
                    animation: prediction !== null ? 'fadeIn 0.4s ease forwards' : 'none'
                }}>
                    {isLoading ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                        </svg>
                    ) : error ? (
                        <>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-error)" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
                            </svg>
                            <span className="prediction-label" style={{ color: 'var(--accent-error)', marginTop: '0.5rem' }}>Error</span>
                        </>
                    ) : prediction !== null ? (
                        <>
                            <span className="prediction-value">{prediction.toFixed(4)}</span>
                            <span className="prediction-label">ŷ predicted</span>
                        </>
                    ) : (
                        <>
                            <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '1.25rem',
                                color: 'var(--text-muted)'
                            }}>ŷ</span>
                            <span className="prediction-label">awaiting input</span>
                        </>
                    )}
                </div>

                {error && (
                    <p style={{
                        marginTop: '1rem',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.75rem',
                        color: 'var(--accent-error)',
                        textAlign: 'center',
                        maxWidth: '200px'
                    }}>
                        {error}
                    </p>
                )}
            </div>

            <button
                onClick={handlePredict}
                disabled={isLoading}
                className="btn-primary"
                style={{
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
            >
                {isLoading ? 'Predicting...' : 'Predict'}
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

export default Predict;
