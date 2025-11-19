'use client';

import { useState } from 'react';

const FileUpload = () => {
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
                setStatus('Upload successful!');
            } else {
                setStatus('Upload failed.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setStatus('An error occurred during upload.');
        }
    };

    return (
        <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Upload .pkl File</h3>
            <input type="file" accept=".pkl" onChange={handleFileChange} />
            <button onClick={handleUpload} style={{ marginLeft: '10px' }}>
                Upload
            </button>
            {status && <p style={{ marginTop: '10px', color: 'red' }}>{status}</p>}
        </div>
    );
};

export default FileUpload;
