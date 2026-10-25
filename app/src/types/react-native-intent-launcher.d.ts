declare module 'react-native-intent-launcher' {
  export interface IntentLauncherParams {
    action: string;
    data: string;
  }

  export const IntentConstant: {
    ACTION_CALL: string;
    ACTION_DIAL: string;
    ACTION_VIEW: string;
  };

  const intentLauncher: {
    startActivity(params: IntentLauncherParams): Promise<unknown>;
  };

  export default intentLauncher;
}
