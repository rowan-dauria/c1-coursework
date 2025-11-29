import FileUpload from "./FileUpload";

const Upload = () => {
    return (
        <div style={{ flex: 1, border: '2px solid #333', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ marginBottom: '20px' }}>Upload</h2>
            <div style={{ flex: 0, backgroundColor: '#e2e8f0', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
                <h3>Data exploration summary here</h3>
            </div>
            <FileUpload />
        </div>
    );
};

export default Upload;
