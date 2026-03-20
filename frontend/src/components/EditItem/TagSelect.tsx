'use client';

import * as React from 'react';
import { useContext, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { IconPlus } from '@tabler/icons-react';
import { Kbd } from '@/components/ui/kbd.tsx';
import { TagPath } from '@/components/EditItem/TagPath.tsx';
import { ArrowDownLeft } from 'lucide-react';
import { normalizeQuery } from '@/lib/utils.ts';

export const TagSelect = observer(
  ({
    isMultiple,
    onChange,
    selectedTagIDs,
    excludedTagIDs,
  }: {
    isMultiple: boolean;
    onChange: (values: number[] | number) => void;
    selectedTagIDs: number[];
    excludedTagIDs: number[];
  }) => {
    const anchor = useComboboxAnchor();
    const store = useContext(StoreContext);
    const tags = useMemo(() => {
      return store.tagsArray
        .map((t) => {
          return {
            value: t.id,
            color: t.color,
            // Append "/" to continue display parent item when child item is created
            label: t.fullPath + '/',
            lowercase: t.fullPath.toLowerCase(),
          };
        })
        .filter((t) => !excludedTagIDs.includes(t.value));
    }, [store.tagsArray, excludedTagIDs]);

    const preselectedTags = useMemo(
      () => tags.filter((t) => selectedTagIDs.includes(t.value)),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );
    const firstItemRef = React.useRef(null);

    const [query, setQuery] = React.useState(() => {
      if (isMultiple) {
        return '';
      }
      return preselectedTags[0]?.label?.replace(/\/$/, '') ?? '';
    });

    const normalizedQuery = normalizeQuery(query);
    const lowerCaseQuery = normalizedQuery.toLowerCase();
    const exactQueryMatchExists = useMemo(
      () => tags.some((t) => t.lowercase === lowerCaseQuery),
      [tags, lowerCaseQuery]
    );

    const comboboxItems = useMemo(
      () =>
        normalizedQuery.length > 0 && !exactQueryMatchExists
          ? [
              {
                creatable: true,
                value: `create:${normalizedQuery}`,
                label: query,
              },
              ...tags,
            ]
          : tags,
      [tags, normalizedQuery, query, exactQueryMatchExists]
    );

    const highlightedItemRef = React.useRef(undefined);

    const autocomplete = (label) => {
      setQuery(label.replace(/\/$/, ''));

      firstItemRef.current?.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
        })
      );
    };

    useEffect(() => {
      if (store.tagsArray.length > 0) {
        return;
      }
      store.fetchTags();
    }, [store]);

    const onKeyDownCapture = (e) => {
      if (e.key === 'Tab' && highlightedItemRef.current) {
        autocomplete(highlightedItemRef.current.label);
        // e.stopPropagation();
        e.preventDefault();
      }
      // For case when Enter is pressed when there is some text in input and no item is highlighted in list, we want to prevent form submission and/or text clearance in input, so user can continue typing or choose to create new tag with that text
      if (isMultiple && e.key === 'Enter' && query.length > 0 && !highlightedItemRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const ContentNode = (
      <ComboboxContent anchor={anchor}>
        <ComboboxList onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
          {(tag, index) => (
            <React.Fragment key={tag.value}>
              <ComboboxItem key={tag.value} value={tag} className="group" ref={index === 0 ? firstItemRef : null}>
                {tag.creatable ? (
                  <>
                    <IconPlus />
                    Create new tag: "{normalizeQuery(tag.label)}"
                  </>
                ) : (
                  <>
                    <TagPath tag={tag} />
                    <Button
                      variant="ghost"
                      title="Autocomplete"
                      size="xs"
                      className="bg-primary-foreground hover:bg-primary-foreground/50 invisible ms-auto flex items-center transition-none group-data-highlighted:visible pointer-coarse:visible"
                      onClick={(e) => {
                        autocomplete(tag.label);
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <ArrowDownLeft /> <Kbd className="pointer-coarse:hidden">Tab</Kbd>
                    </Button>
                  </>
                )}
              </ComboboxItem>
              {tag.creatable && <ComboboxSeparator className="shrink-0 last-of-type:hidden" />}
            </React.Fragment>
          )}
        </ComboboxList>
      </ComboboxContent>
    );

    if (isMultiple) {
      return (
        <Combobox
          modal={true}
          // value={selectedTags}
          multiple
          highlightItemOnHover={true}
          autoHighlight={true}
          items={comboboxItems}
          defaultValue={preselectedTags}
          // itemToStringValue={(tag) => tag.value}
          inputValue={query}
          onInputValueChange={(v) => {
            setQuery(v);
          }}
          onItemHighlighted={(item) => {
            highlightedItemRef.current = item;
          }}
          onValueChange={(newValues) => {
            onChange(newValues.map((v) => v.value));
          }}
          // filter={(value, query, itemToString) => {
          //   return value.fullPath.includes(query.trim().toLowerCase()) ?? false;
          // }}
          isItemEqualToValue={(item, value) => item.value === value.value}
        >
          <ComboboxChips ref={anchor} className="">
            <ComboboxValue>
              {(values) => (
                <React.Fragment>
                  {values.map((tag) => (
                    <ComboboxChip key={String(tag.value)}>
                      <TagPath tag={tag} />
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    placeholder={values.length > 0 ? '...' : 'Type to search or create tags...'}
                    onKeyDownCapture={onKeyDownCapture}
                  ></ComboboxChipsInput>
                </React.Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
          {ContentNode}
        </Combobox>
      );
    } else {
      return (
        <Combobox
          modal={true}
          multiple={false}
          highlightItemOnHover={true}
          autoHighlight={true}
          items={comboboxItems}
          defaultValue={preselectedTags[0] ?? null}
          itemToStringLabel={(tag) => tag.label?.replace(/\/$/, '')}
          inputValue={query}
          onInputValueChange={(v) => {
            setQuery(v);
          }}
          onItemHighlighted={(item) => {
            highlightedItemRef.current = item;
          }}
          onValueChange={(newValue) => {
            onChange(newValue?.value ?? 0);
          }}
          isItemEqualToValue={(item, value) => item.value === value.value}
        >
          <ComboboxInput showClear placeholder="Type to search or create a tag" onKeyDownCapture={onKeyDownCapture} />
          {ContentNode}
        </Combobox>
      );
    }
  }
);
