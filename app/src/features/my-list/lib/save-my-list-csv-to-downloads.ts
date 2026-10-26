import ReactNativeBlobUtil from 'react-native-blob-util';

export async function saveMyListCsvToDownloads(
  csvText: string,
  csvFileName: string,
): Promise<void> {
  const csvMimeType = 'text/csv';
  const downloadsCollection = 'Download';
  const tempCsvFileName = 'my-list-export.csv';
  const cacheDirectory = ReactNativeBlobUtil.fs.dirs.CacheDir;
  const tempCsvPath = `${cacheDirectory}/${tempCsvFileName}`;
  await ReactNativeBlobUtil.fs.writeFile(tempCsvPath, csvText, 'utf8');
  await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
    { name: csvFileName, parentFolder: '', mimeType: csvMimeType },
    downloadsCollection,
    tempCsvPath,
  );
  await ReactNativeBlobUtil.fs.unlink(tempCsvPath);
}
