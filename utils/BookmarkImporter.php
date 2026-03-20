<?php

namespace Utils;

use Framework\ServiceContainer;
use Models\Item;
use Models\ItemCreator;
use Models\Repository;
use Models\TagCreator;

class BookmarkImporter
{
	const IMPORTED_BOOKMARK_DEFAULT_TAG_NAME_FORMAT = 'Imported from %s';
	const IMPORTED_TAG_DESCRIPTION_FORMAT = 'Tag imported from %s';

	private string $imported_bookmark_default_tag_name;
	private string $imported_tag_description;

	public function __construct(protected Repository $repository, protected TagCreator $tag_creator, string $import_source_name)
	{
		$this->imported_bookmark_default_tag_name = sprintf(self::IMPORTED_BOOKMARK_DEFAULT_TAG_NAME_FORMAT, $import_source_name);
		$this->imported_tag_description = sprintf(self::IMPORTED_TAG_DESCRIPTION_FORMAT, $import_source_name);
	}

	public function processHTML(string $content, &$skipped_count): int
	{
		// Extract folders and bookmarks from the HTML content
		[$folders, $tags, $bookmarks, $skipped_count] = $this->extractData($content);

		// Create tags
		$folder_path_to_tag_id_map = $this->saveFoldersAsTags($folders);
		$tag_name_to_tag_id_map = $this->saveTags($tags);
		$tag_name_to_tag_id_map[$this->imported_bookmark_default_tag_name] = createTagsFromSegments([$this->imported_bookmark_default_tag_name]);

		// Save items to DB
		$items = $this->saveItems($bookmarks, $folder_path_to_tag_id_map, $tag_name_to_tag_id_map);

		return count($items);
	}

	/**
	 * @param string $content HTML content of the bookmarks file
	 * @return array [array of unique json-encoded folder paths, array of unique tags, array of bookmarks with title/url/folder_path/tags, count of skipped bookmarks]
	 */
	private function extractData(string $content): array
	{
		$skipped_count = 0;

		$all_folders = [];
		$all_tags = [];
		$bookmarks = [];

		$dom = new \DOMDocument('1.0', 'UTF-8');
		libxml_use_internal_errors(true);
		$dom->loadHTML('<?xml encoding="UTF-8">' . $content, LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_NONET | LIBXML_PARSEHUGE);
		libxml_clear_errors();
		$xpath = new \DOMXPath($dom);
		$links = $xpath->query('//a[@href]');

		foreach ($links as $link) {
			$url = $link->getAttribute('href');
			$tags_attr = $link->getAttribute('tags');
			$title = trim($link->textContent);

			if (empty($url) || str_starts_with($url, 'javascript:')) {
				$skipped_count++;
				continue;
			}

			$tags = [];

			if ($tags_attr) {
				$tags = explode(',', $tags_attr);
				$tags = array_map('trim', $tags);
				$tags = array_filter($tags, fn($tag) => $tag !== '');

				$all_tags = array_merge($all_tags, $tags);
			}

			$folder_path = null;

			$path_segments = $this->extractPath($link);
			if (!empty($path_segments)) {
				$folder_path = json_encode($path_segments);
				$all_folders[] = $folder_path;
			}

			$bookmarks[] = [
				'title' => $title,
				'url' => $url,
				'folder_path' => $folder_path,
				'tags' => $tags,
			];
		}

		return [array_unique($all_folders), array_unique($all_tags), $bookmarks, $skipped_count];
	}

	/*
	 * Returns an array of folder names from root to leaf (e.g., ['Language', 'English'])
	 */
	private function extractPath($link): array
	{
		$folders = [];
		$current = $link->parentNode;

		while ($current) {
			if ($current->nodeName === 'dl') {
				$dt = $current->previousSibling;

				while ($dt && $dt->nodeType === XML_TEXT_NODE) {
					$dt = $dt->previousSibling;
				}
				if ($dt && $dt->nodeName === 'dt') {
					$h3 = $dt->getElementsByTagName('h3')->item(0);
					if ($h3) {
						array_unshift($folders, trim($h3->textContent));
					}
				}
			}
			$current = $current->parentNode;
		}

		return $folders;
	}

	protected function saveFoldersAsTags($folder_paths)
	{
		$tag_ids = array_map(function ($path) {
			return createTagsFromSegments(
				json_decode($path), $this->imported_tag_description
			);
		}, $folder_paths);
		return array_combine($folder_paths, $tag_ids);
	}

	protected function saveTags($tag_names)
	{
		$tag_ids = array_map(function ($tag_name) {
			return createTagsFromSegments(
				[$tag_name], $this->imported_tag_description
			);
		}, $tag_names);
		return array_combine($tag_names, $tag_ids);
	}

	protected function saveItems($bookmarks, $folder_path_to_tag_id_map, $tag_name_to_tag_id_map)
	{
		$items = array_map(function ($bookmark) use ($folder_path_to_tag_id_map, $tag_name_to_tag_id_map) {

			$item_tag_ids = [
				$tag_name_to_tag_id_map[$this->imported_bookmark_default_tag_name],
			];

			if ($bookmark['folder_path'] && isset($folder_path_to_tag_id_map[$bookmark['folder_path']])) {
				$item_tag_ids[] = $folder_path_to_tag_id_map[$bookmark['folder_path']];
			}

			if (!empty($bookmark['tags'])) {
				$item_tag_ids = array_merge($item_tag_ids, array_intersect_key($tag_name_to_tag_id_map, array_flip($bookmark['tags'])));
			}

			return new Item(
				$bookmark['url'],
				$bookmark['title'] ?: $bookmark['url'],
				'',
				'',
				'',
				array_unique($item_tag_ids)
			);
		}, $bookmarks);

		$item_creator = ServiceContainer::get(ItemCreator::class);
		return $item_creator->createItems($items);
	}
}
