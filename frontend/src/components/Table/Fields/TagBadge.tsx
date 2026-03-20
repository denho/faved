import React from 'react';
import { Badge } from '../../ui/badge.tsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { useItemListState } from '@/hooks/useItemListState.ts';
import { TagPath } from '@/components/EditItem/TagPath.tsx';

export const TagBadge: React.FC<{ tagID: number }> = observer(({ tagID }) => {
  const store = React.useContext(StoreContext);
  const tag = store.tags[tagID];
  const { setTagFilter } = useItemListState();

  if (!tag) {
    return null;
  }

  const isTagSelected = store.tagFilter === tagID;
  const isParentTagSelected =
    !isTagSelected && Array.isArray(store.itemListFilters.tags) && store.itemListFilters.tags.includes(tagID);

  const setTag = () => {
    setTagFilter(tagID);
  };

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Badge
          variant={isTagSelected || isParentTagSelected ? 'outline' : 'secondary'}
          className="cursor-pointer"
          onClick={setTag}
        >
          <TagPath tag={{ label: tag.fullPath, color: tag.color }} showLast={true} />
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <TagPath tag={{ label: tag.fullPath, color: tag.color }} />
        {tag.description !== '' && <p className="mt-2 max-w-md whitespace-pre-wrap">{tag.description}</p>}
      </TooltipContent>
    </Tooltip>
  );
});
