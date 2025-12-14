'use client';
import { useState } from 'react';
import FileUpload from "./FileUpload";

interface DatasetStructure {
    type: string;
    keys: string[];
}

interface FeatureMatrix {
    shape: [number, number];
    type: string;
    dtype: string;
    first_5_rows: number[][];
    min: { source: string; parsedValue: number } | number;
    max: number;
    mean: number;
    std: number;
}

interface TargetVector {
    shape: [number];
    type: string;
    dtype: string;
    first_10_values: number[];
    min: number;
    max: number;
    mean: number;
    std: number;
}

interface Metadata {
    n_samples: number;
    n_features: number;
    seed: number;
    feature_names: string[];
    target_name: string;
    generated_at: string;
}

interface DataSummary {
    dataset_structure: DatasetStructure;
    feature_matrix: FeatureMatrix;
    target_vector: TargetVector;
    metadata: Metadata;
    validation: any;
}

const Upload = () => {
    const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);

    const handleUploadSuccess = (summary: DataSummary) => {
        setDataSummary(summary);
    };

    return (
        <div className="glass-card" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 200px)',
            minHeight: '600px'
        }}>
            <h2 className="section-header">Upload</h2>

            {/* Data Summary Panel */}
            <div className="inner-panel" style={{
                flex: 1,
                marginBottom: '1rem',
                overflowY: 'auto'
            }}>
                {dataSummary ? (
                    <div style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
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
                                }}>Dataset Loaded</span>
                            </div>
                        </div>

                        {/* Metadata Section */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div className="data-label">Metadata</div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '0.75rem',
                                marginTop: '0.5rem'
                            }}>
                                <div style={{
                                    background: 'rgba(6, 182, 212, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.75rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        color: 'var(--accent-primary)'
                                    }}>{dataSummary.metadata.n_samples.toLocaleString()}</div>
                                    <div style={{
                                        fontSize: '0.65rem',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        marginTop: '0.25rem'
                                    }}>Samples</div>
                                </div>
                                <div style={{
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.75rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        color: 'var(--accent-secondary)'
                                    }}>{dataSummary.metadata.n_features}</div>
                                    <div style={{
                                        fontSize: '0.65rem',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        marginTop: '0.25rem'
                                    }}>Features</div>
                                </div>
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.75rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        color: 'var(--accent-success)'
                                    }}>{dataSummary.metadata.target_name}</div>
                                    <div style={{
                                        fontSize: '0.65rem',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        marginTop: '0.25rem'
                                    }}>Target</div>
                                </div>
                            </div>
                        </div>

                        {/* Feature Matrix Section */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div className="data-label">Feature Matrix</div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.5rem',
                                marginTop: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Shape</span>
                                    <span className="data-value">{dataSummary.feature_matrix.shape.join(' × ')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Type</span>
                                    <span className="data-value">{dataSummary.feature_matrix.dtype}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Min</span>
                                    <span className="data-value">{(typeof dataSummary.feature_matrix.min === 'object' ? dataSummary.feature_matrix.min.parsedValue : dataSummary.feature_matrix.min).toFixed(4)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Max</span>
                                    <span className="data-value">{dataSummary.feature_matrix.max.toFixed(4)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Target Vector Section */}
                        <div>
                            <div className="data-label">Target Vector</div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.5rem',
                                marginTop: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Shape</span>
                                    <span className="data-value">{dataSummary.target_vector.shape[0].toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Type</span>
                                    <span className="data-value">{dataSummary.target_vector.dtype}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Range</span>
                                    <span className="data-value">[{dataSummary.target_vector.min.toFixed(2)}, {dataSummary.target_vector.max.toFixed(2)}]</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Mean</span>
                                    <span className="data-value">{dataSummary.target_vector.mean.toFixed(4)}</span>
                                </div>
                            </div>
                        </div>
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
                            <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.85rem',
                            textAlign: 'center'
                        }}>
                            Upload a dataset to see<br />exploration summary
                        </p>
                    </div>
                )}
            </div>

            <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>
    );
};

export default Upload;
