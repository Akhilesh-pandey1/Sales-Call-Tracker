import { PermissionsAndroid, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { requestPermissionIfMissing } from '@/shared/utils/phone-permissions';

async function requestLegacyDownloadsPermission(): Promise<void> {
  const legacyDownloadsMaxApiLevel = 28;
  const isLegacyAndroid =
    Platform.OS === 'android' && Platform.Version <= legacyDownloadsMaxApiLevel;
  if (!isLegacyAndroid) {
    return;
  }
  const isWriteStorageGranted = await requestPermissionIfMissing(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );
  if (!isWriteStorageGranted) {
    throw new Error('Storage permission for Downloads was denied.');
  }
}

export async function saveMyListCsvToDownloads(
  csvText: string,
  csvFileName: string,
): Promise<void> {
  const csvMimeType = 'text/csv';
  const downloadsCollection = 'Download';
  const tempCsvFileName = 'my-list-export.csv';
  const cacheDirectory = ReactNativeBlobUtil.fs.dirs.CacheDir;
  const tempCsvPath = `${cacheDirectory}/${tempCsvFileName}`;
  await requestLegacyDownloadsPermission();
  await ReactNativeBlobUtil.fs.writeFile(tempCsvPath, csvText, 'utf8');
  try {
    await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
      { name: csvFileName, parentFolder: '', mimeType: csvMimeType },
      downloadsCollection,
      tempCsvPath,
    );
  } finally {
    await ReactNativeBlobUtil.fs.unlink(tempCsvPath);
  }
}
