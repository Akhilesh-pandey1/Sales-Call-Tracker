import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Check, Copy, FileText, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, ToastAndroid, View } from 'react-native';
import { cn } from '@/lib/utils';
import type { PickedListFile } from '../lib/pick-list-file';
import { pickListFile } from '../lib/pick-list-file';
import type { UseMyListUpload } from '../hooks/use-my-list-upload';

type UploadSource = 'paste' | 'file';

function buildSourceOptionClasses(
  isActive: boolean,
): { optionClass: string; labelClass: string } {
  const optionClass = cn(
    'flex-1 rounded-lg px-3 py-1.5',
    isActive && 'bg-primary shadow-xs',
  );
  const labelClass = cn(
    'text-center text-xs',
    isActive
      ? 'font-bold text-primary-foreground'
      : 'font-semibold text-muted-foreground',
  );
  const sourceOptionClasses = { optionClass, labelClass };
  return sourceOptionClasses;
}

type UploadSourceSwitchProps = {
  activeSource: UploadSource;
  onChooseSource: (source: UploadSource) => void;
};

function UploadSourceSwitch({ activeSource, onChooseSource }: UploadSourceSwitchProps) {
  const handleChoosePaste = () => onChooseSource('paste');
  const handleChooseFile = () => onChooseSource('file');
  const pasteClasses = buildSourceOptionClasses(activeSource === 'paste');
  const fileClasses = buildSourceOptionClasses(activeSource === 'file');

  return (
    <View
      accessibilityRole="tablist"
      className="mt-4 flex-row rounded-xl border border-border bg-muted p-1"
    >
      <Pressable
        accessibilityRole="tab"
        onPress={handleChoosePaste}
        className={pasteClasses.optionClass}
      >
        <Text className={pasteClasses.labelClass}>Paste text</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        onPress={handleChooseFile}
        className={fileClasses.optionClass}
      >
        <Text className={fileClasses.labelClass}>File</Text>
      </Pressable>
    </View>
  );
}

type UploadPastePanelProps = {
  pasteText: string;
  onChangePasteText: (pasteText: string) => void;
  onPressCopyAiPrompt: () => void;
};

function UploadPastePanel({
  pasteText,
  onChangePasteText,
  onPressCopyAiPrompt,
}: UploadPastePanelProps) {
  const pasteBoxLabel = 'Paste text';
  const pastePlaceholderMessage =
    'Paste anything - every phone-like number is pulled out';
  const aiPromptButtonLabel = 'Copy AI prompt';
  const aiPromptHintMessage =
    'Use this prompt with your text in any AI chatbot, then paste the result here.';

  return (
    <View className="mt-4">
      <Text className="text-sm font-bold">{pasteBoxLabel}</Text>
      <TextInput
        multiline
        textAlignVertical="top"
        value={pasteText}
        onChangeText={onChangePasteText}
        placeholder={pastePlaceholderMessage}
        className="mt-1.5 h-28 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
      />
      <Button
        variant="outline"
        size="none"
        onPress={onPressCopyAiPrompt}
        className="mt-3 h-auto rounded-xl px-3 py-2.5"
      >
        <Icon as={Copy} size={16} className="text-primary" />
        <Text className="text-xs font-semibold text-primary">
          {aiPromptButtonLabel}
        </Text>
      </Button>
      <Text className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        {aiPromptHintMessage}
      </Text>
    </View>
  );
}

type UploadFilePanelProps = {
  pickedFile: PickedListFile | null;
  isPickingFile: boolean;
  onPressPickFile: () => void;
};

function UploadFilePanel({ pickedFile, isPickingFile, onPressPickFile }: UploadFilePanelProps) {
  const pickAreaTitle = 'Tap to pick a file';
  const pickAreaHint = 'CSV or Excel (.xlsx) - numbers in one column';
  const pickedFileFallbackName = 'Selected file';
  const pickedFileName =
    pickedFile?.fileName === null
      ? pickedFileFallbackName
      : pickedFile?.fileName;

  return (
    <View className="mt-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={pickAreaHint}
        onPress={onPressPickFile}
        disabled={isPickingFile}
        className="w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted px-4 py-8 active:bg-accent/10"
      >
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-xs">
          <Icon as={Upload} size={24} className="text-primary" />
        </View>
        <Text className="mt-3 text-sm font-bold">{pickAreaTitle}</Text>
        <Text className="mt-0.5 text-[11px] text-muted-foreground">
          {pickAreaHint}
        </Text>
      </Pressable>
      {pickedFile ? (
        <View className="mt-2 flex-row items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5">
          <Icon as={FileText} size={16} className="text-primary" />
          <Text
            numberOfLines={1}
            className="min-w-0 flex-1 text-sm font-semibold tabular-nums"
          >
            {pickedFileName}
          </Text>
          <Icon as={Check} size={16} className="text-accent" />
        </View>
      ) : null}
    </View>
  );
}

type UploadNumbersDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
  upload: UseMyListUpload;
};

export function UploadNumbersDialog({
  isOpen,
  onClose,
  onUploaded,
  upload,
}: UploadNumbersDialogProps) {
  const [activeSource, setActiveSource] = useState<UploadSource>('paste');
  const [pasteText, setPasteText] = useState('');
  const [pickedFile, setPickedFile] = useState<PickedListFile | null>(null);
  const [isPickingFile, setIsPickingFile] = useState(false);
  const [isCommittingUpload, setIsCommittingUpload] = useState(false);

  const resetDialogState = () => {
    setActiveSource('paste');
    setPasteText('');
    setPickedFile(null);
    setIsPickingFile(false);
  };

  const handleChooseSource = (chosenSource: UploadSource) =>
    setActiveSource(chosenSource);
  const handleChangePasteText = (changedPasteText: string) =>
    setPasteText(changedPasteText);
  const handleCopyAiPromptPress = () => upload.copyAiPrompt();

  const handlePickFilePress = async () => {
    const wrongFileTypeMessage = 'Please pick a CSV or Excel (.xlsx) file.';
    const pickFailedMessage = 'Could not pick the file. Try again.';
    setIsPickingFile(true);
    try {
      const pickResult = await pickListFile();
      if (pickResult.outcome === 'picked') {
        setPickedFile(pickResult.pickedFile);
      }
      if (pickResult.outcome === 'wrongFileType') {
        ToastAndroid.show(wrongFileTypeMessage, ToastAndroid.SHORT);
      }
    } catch {
      ToastAndroid.show(pickFailedMessage, ToastAndroid.SHORT);
    } finally {
      setIsPickingFile(false);
    }
  };

  const handleCancelPress = () => {
    resetDialogState();
    onClose();
  };

  const finishUpload = () => {
    resetDialogState();
    onUploaded();
  };

  const handleUploadPress = async () => {
    setIsCommittingUpload(true);
    try {
      if (activeSource === 'paste') {
        const uploaded = await upload.uploadNumbersFromText(pasteText);
        if (uploaded) {
          finishUpload();
        }
      }
      if (activeSource === 'file' && pickedFile !== null) {
        const uploaded = await upload.uploadNumbersFromFile(
          pickedFile.fileMimeType,
          pickedFile.fileUri,
        );
        if (uploaded) {
          finishUpload();
        }
      }
    } finally {
      setIsCommittingUpload(false);
    }
  };

  const handleDismiss = (nextOpen: boolean) => {
    if (nextOpen) {
      return;
    }
    resetDialogState();
    onClose();
  };

  const hasSomethingToUpload =
    activeSource === 'paste' ? pasteText.trim() !== '' : pickedFile !== null;
  const isUploadBusy = upload.isUploading || isPickingFile || isCommittingUpload;
  const canUpload = hasSomethingToUpload && !isUploadBusy;
  const uploadButtonLabel = upload.isUploading ? 'Uploading…' : 'Upload';

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent
        className="max-w-sm rounded-3xl p-6"
        backdropClassName="bg-black/60 p-4"
      >
        <View className="flex-row items-center justify-between border-b border-border pb-3">
          <DialogTitle className="text-base font-bold tracking-tight">
            Upload numbers
          </DialogTitle>
          <View className="rounded-full bg-muted px-2.5 py-0.5">
            <Text className="text-[11px] font-semibold text-muted-foreground">
              On this phone only
            </Text>
          </View>
        </View>

        <UploadSourceSwitch activeSource={activeSource} onChooseSource={handleChooseSource} />

        {activeSource === 'paste' ? (
          <UploadPastePanel
            pasteText={pasteText}
            onChangePasteText={handleChangePasteText}
            onPressCopyAiPrompt={handleCopyAiPromptPress}
          />
        ) : (
          <UploadFilePanel
            pickedFile={pickedFile}
            isPickingFile={isPickingFile}
            onPressPickFile={handlePickFilePress}
          />
        )}

        <View className="mt-1 flex-row justify-end gap-3">
          <Button
            variant="outline"
            size="none"
            onPress={handleCancelPress}
            className="h-auto rounded-xl px-4 py-2"
          >
            <Text className="text-sm font-semibold">Cancel</Text>
          </Button>
          <Button
            onPress={handleUploadPress}
            disabled={!canUpload}
            className="h-auto rounded-xl px-4 py-2"
          >
            <Text className="text-sm font-semibold">{uploadButtonLabel}</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}
