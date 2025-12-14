'use client';

import { useState, useRef } from 'react';

const FileUpload = ({ onUploadSuccess }: { onUploadSuccess: (data: any) => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setStatus('error');
            setMessage('Please select a file first.');
            return;
        }

        if (!file.name.endsWith('.pkl')) {
            setStatus('error');
            setMessage('Only .pkl files are allowed.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setStatus('uploading');
            setMessage('');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setStatus('success');
                setMessage('Dataset uploaded successfully');
                if (data.data_summary) {
                    onUploadSuccess(data.data_summary);
                }
            } else {
                const errorData = await response.json();
                setStatus('error');
                setMessage(errorData.detail || 'Upload failed.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setStatus('error');
            setMessage('Connection error. Check if server is running.');
        }
    };

    return (
        <div
            className={`dropzone ${isDragOver ? 'dropzone-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
                marginTop: 'auto',
                background: isDragOver ? 'rgba(6, 182, 212, 0.1)' : 'transparent'
            }}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".pkl"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            <div style={{ marginBottom: '0.75rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDragOver ? 'var(--accent-primary)' : 'var(--text-muted)'} strokeWidth="1.5" style={{ transition: 'all 0.2s ease' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>

            {file ? (
                <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.8rem',
                            color: 'var(--text-primary)'
                        }}>
                            {file.name}
                        </span>
                    </div>
                </div>
            ) : (
                <p style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem'
                }}>
                    Drag & drop or click to browse
                </p>
            )}

            <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                marginBottom: '1rem'
            }}>
                Accepts .pkl files only
            </p>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                }}
                className="btn-secondary"
                disabled={status === 'uploading'}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                {status === 'uploading' ? (
                    <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                        </svg>
                        Uploading...
                    </>
                ) : (
                    <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Upload Dataset
                    </>
                )}
            </button>

            {message && (
                <p style={{
                    marginTop: '0.75rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.75rem',
                    color: status === 'success' ? 'var(--accent-success)' : 'var(--accent-error)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem'
                }}>
                    {status === 'success' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
                        </svg>
                    )}
                    {message}
                </p>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default FileUpload;
