function decodeTelNumberText(telNumberText: string): string {
  try {
    const decodedTelNumberText = decodeURIComponent(telNumberText);
    return decodedTelNumberText;
  } catch {
    const undecodableTelNumberText = telNumberText;
    return undecodableTelNumberText;
  }
}

export function cleanTappedPhoneNumber(telLinkUrl: string): string {
  const isTelLink = telLinkUrl.startsWith('tel:');
  if (!isTelLink) {
    const noReadableNumber = '';
    return noReadableNumber;
  }
  const telNumberText = telLinkUrl.slice('tel:'.length);
  const decodedTelNumberText = decodeTelNumberText(telNumberText);
  const keptCharacters = decodedTelNumberText.replace(/[^0-9+]/g, '');
  const hasReadableDigit = /[0-9]/.test(keptCharacters);
  if (!hasReadableDigit) {
    const noReadableNumber = '';
    return noReadableNumber;
  }
  return keptCharacters;
}
