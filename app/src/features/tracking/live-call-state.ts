import CallDetection, { type CallState } from 'react-native-call-detection-android';

async function readLiveCallState(): Promise<CallState> {
  const liveCallState = await CallDetection.getCallState();
  return liveCallState;
}

export { readLiveCallState };
