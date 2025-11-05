/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() { // Proxies requests to backend and avoids CORS issues
        return [
            {
                source: '/api/:path*', // Any request starting with /api/
                destination: 'http://backend:8000/api/:path*', // Will be proxied to this URL (using Docker service name)
            },
        ]
    },
}

module.exports = nextConfig