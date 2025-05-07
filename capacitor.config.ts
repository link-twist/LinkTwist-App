import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';

const config: CapacitorConfig = {
  appId: 'com.linktwist.app',
  appName: 'LinkTwist',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: "LIGHT"
    },
    // SplashScreen: {
    //   launchShowDuration: 3000,
    //   launchAutoHide: false,
    //   backgroundColor: "#ffffffff",
    //   androidSplashResourceName: "splash",
    //   androidScaleType: "CENTER_CROP",
    //   showSpinner: false,
    //   splashFullScreen: true,
    //   splashImmersive: true,
    //   layoutName: "launch_screen",
    //   useDialog: true,
    // },
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
