import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog.tsx';
import EditItemForm from '@/components/EditItem/EditItemForm.tsx';
import { observer } from 'mobx-react-lite';
import { useContext, useMemo } from 'react';
import { StoreContext } from '@/store/storeContext.ts';

export const EditItemDialog = observer(() => {
  const store = useContext(StoreContext);
  const item = useMemo(() => {
    return store.items.find((item) => item.id === store.modalOpenItemID);
  }, [store.items, store.modalOpenItemID]);

  return (
    <Dialog onOpenChange={store.setIsItemModalOpen} modal={true} open={store.isItemModalOpen}>
      <DialogContent
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            store.setIsItemModalOpen(false);
          }
        }}
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[100dvw] max-w-6xl rounded-none p-0 md:w-[95dvw] md:rounded-lg"
      >
        <DialogTitle className="sr-only">Edit Item</DialogTitle>
        <EditItemForm isCloseWindowOnSubmit={false} item={item} />
      </DialogContent>
    </Dialog>
  );
});
