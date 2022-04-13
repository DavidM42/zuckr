import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.merzlabs.zuckr',
  appName: 'zuckr',
  webDir: 'build',
  bundledWebRuntime: false,
  // TODO remove for prod
  // server: {
  //   url: "http://192.168.1.3:3000",
  //   cleartext: true
  // }
};

export default config;
