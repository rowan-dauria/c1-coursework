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
        <div style={{ flex: 1, border: '2px solid #333', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ marginBottom: '20px' }}>Upload</h2>
            <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '20px', padding: '20px', marginBottom: '20px', overflowY: 'auto' }}>
                {dataSummary ? (
                    <div>
                        <h3 style={{ marginBottom: '10px' }}>Data Summary</h3>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Metadata:</strong>
                            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                <li>Samples: {dataSummary.metadata.n_samples}</li>
                                <li>Features: {dataSummary.metadata.n_features}</li>
                                <li>Target Name: {dataSummary.metadata.target_name}</li>
                            </ul>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Feature Matrix:</strong>
                            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                <li>Shape: {dataSummary.feature_matrix.shape.join(' x ')}</li>
                                <li>Type: {dataSummary.feature_matrix.dtype}</li>
                                <li>Min: {typeof dataSummary.feature_matrix.min === 'object' ? dataSummary.feature_matrix.min.parsedValue : dataSummary.feature_matrix.min}</li>
                                <li>Max: {dataSummary.feature_matrix.max}</li>
                            </ul>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Target Vector:</strong>
                            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                <li>Shape: {dataSummary.target_vector.shape.join(' x ')}</li>
                                <li>Type: {dataSummary.target_vector.dtype}</li>
                                <li>Min: {dataSummary.target_vector.min}</li>
                                <li>Max: {dataSummary.target_vector.max}</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p>Data exploration summary here</p>
                )}
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>
    );
};

export default Upload;
