import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    crossOrigin: "use-credentials",
    async rewrites() {
    return [
      {
        source: '/okienko/:path*',
        destination: 'http://localhost:5000/okienko/:path*',
      },
      {
        source: '/bramka/strona/:path*',
        destination: 'http://localhost:8027/bramka/strona/:path*',
      },
    ]
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
})
   
  // Merge MDX config with Next.js config
export default withMDX(nextConfig)

