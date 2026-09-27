import { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Drop Radio',
  slug: config.slug ?? 'drop-radio-ui',
  web: {
    ...config.web,
    output: process.argv.includes('start') ? 'single' : 'static',
  },
})
