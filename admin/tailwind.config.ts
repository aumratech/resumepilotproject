import type { Config } from 'tailwindcss'
import rootConfig from '../tailwind.config'

const config: Config = {
  ...rootConfig,
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

export default config
