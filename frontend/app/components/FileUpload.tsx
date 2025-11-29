'use client';

import { useState } from 'react';

const FileUpload = ({ onUploadSuccess }: { onUploadSuccess: (data: any) => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setStatus('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setStatus('Please select a file first.');
            return;
        }

        if (!file.name.endsWith('.pkl')) {
            setStatus('Only .pkl files are allowed.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setStatus('Uploading...');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setStatus('Upload successful!');
                if (data.data_summary) {
                    onUploadSuccess(data.data_summary);
                }
            } else {
                setStatus('Upload failed.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setStatus('An error occurred during upload.');
        }
    };

    return (
        <div style={{
            marginTop: 'auto',
            padding: '20px',
            border: '2px dashed #333',
            borderRadius: '15px',
            textAlign: 'center',
            cursor: 'pointer'
        }}>
            <h3 style={{ marginBottom: '10px' }}>Drag upload box</h3>
            <input type="file" accept=".pkl" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="file-upload" style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: '#e2e8f0',
                    border: '1px solid #cbd5e0',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginRight: '10px'
                }}>
                    Browse
                </label>
                <span>{file ? file.name : "No file selected"}</span>
            </div>
            <button onClick={handleUpload} style={{
                padding: '8px 16px',
                backgroundColor: '#90cdf4',
                border: '2px solid #3182ce',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
            }}>
                upload
            </button>
            {status && <p style={{ marginTop: '10px', color: status.includes('success') ? 'green' : 'red' }}>{status}</p>}
        </div>
    );
};

export default FileUpload;
