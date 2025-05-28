import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';

const config: CapacitorConfig = {
  appId: 'com.linktwist.app',
  appName: 'LinkTwist',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: "LIGHT",
      backgroundColor: "#ffffff",
    },
    CapacitorHttp: {
      enabled: true,
    },
    Keyboard: {
			resize: KeyboardResize.Body,
			style: KeyboardStyle.Dark,
			resizeOnFullScreen: true,
		},
  },
};

export default config;
