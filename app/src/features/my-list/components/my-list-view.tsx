import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import { Download, Play, Trash2, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useClearMyList } from '../hooks/use-clear-my-list';
import { useMyList } from '../hooks/use-my-list';
import { useMyListDownload } from '../hooks/use-my-list-download';
import { useMyListUpload } from '../hooks/use-my-list-upload';
import { ClearListDialog } from './clear-list-dialog';
import { MyListEmptyState } from './my-list-empty-state';
import { MyListSummaryCards } from './my-list-summary-cards';
import { UploadNumbersDialog } from './upload-numbers-dialog';

function MyListFooterNote() {
  const footerNoteMessage =
    'Your list lives only on this phone. The manager never sees it, and everything works offline.';

  return (
    <Text className="mt-6 text-center text-xs text-muted-foreground">
      {footerNoteMessage}
    </Text>
  );
}

type MyListActionButtonProps = {
  label: string;
  icon: LucideIcon;
  iconClass: string;
  onPress?: () => void;
};

function MyListActionButton({ label, icon, iconClass, onPress }: MyListActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 py-2 active:bg-muted"
    >
      <Icon as={icon} size={16} className={iconClass} />
      <Text className="text-xs font-semibold">{label}</Text>
    </Pressable>
  );
}

type MyListViewProps = {
  onStartCalling: () => void;
};

export function MyListView({ onStartCalling }: MyListViewProps) {
  const { counts, hasNumbers, errorMessage, reloadListCounts } = useMyList();
  const upload = useMyListUpload();
  const download = useMyListDownload();
  const clearList = useClearMyList(reloadListCounts);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleOpenUploadDialog = () => setIsUploadDialogOpen(true);
  const handleCloseUploadDialog = () => setIsUploadDialogOpen(false);
  const handleUploaded = () => {
    setIsUploadDialogOpen(false);
    reloadListCounts();
  };
  const handleDownloadPress = () => download.exportListToCsv();

  return (
    <View className="flex-1 bg-background">
      {errorMessage ? (
        <Text
          role="alert"
          className="px-5 pt-3 text-center text-xs font-semibold text-destructive"
        >
          {errorMessage}
        </Text>
      ) : null}
      <ScrollView contentContainerClassName="pb-6">
        <View className="px-5 pt-4">
          {hasNumbers ? (
            <View>
              <View className="flex-row gap-2">
                <MyListActionButton
                  label="Upload"
                  icon={Upload}
                  iconClass="text-primary"
                  onPress={handleOpenUploadDialog}
                />
                <MyListActionButton
                  label="Download"
                  icon={Download}
                  iconClass="text-primary"
                  onPress={handleDownloadPress}
                />
                <MyListActionButton
                  label="Clear"
                  icon={Trash2}
                  iconClass="text-destructive"
                  onPress={clearList.openClearDialog}
                />
              </View>
              <Button
                onPress={onStartCalling}
                className="mt-2 h-12 rounded-2xl bg-accent active:bg-accent/90"
              >
                <Icon as={Play} size={20} className="text-accent-foreground" />
                <Text className="text-base font-bold text-accent-foreground">
                  Start Calling
                </Text>
              </Button>
            </View>
          ) : null}
          <View className={hasNumbers ? 'mt-5' : ''}>
            <MyListSummaryCards counts={counts} />
          </View>
        </View>
        {hasNumbers ? (
          <MyListFooterNote />
        ) : (
          <MyListEmptyState onPressUpload={handleOpenUploadDialog} />
        )}
      </ScrollView>
      <UploadNumbersDialog
        isOpen={isUploadDialogOpen}
        onClose={handleCloseUploadDialog}
        onUploaded={handleUploaded}
        upload={upload}
      />
      <ClearListDialog
        isOpen={clearList.isClearDialogOpen}
        leftCount={counts.leftCount}
        calledCount={counts.calledCount}
        isClearing={clearList.isClearing}
        errorMessage={clearList.clearErrorMessage}
        onCancel={clearList.closeClearDialog}
        onConfirm={clearList.clearListNumbers}
      />
    </View>
  );
}
