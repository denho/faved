<?php

namespace Controllers;

use ErrorException;
use Framework\ControllerInterface;
use Framework\Exceptions\ValidationException;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use Respect\Validation\Validator;
use Utils\DOMParser;
use function Framework\success;
use function Utils\clearItemImageDirectory;
use function Utils\fetchMultiplePageHTML;
use function Utils\resolveUrl;

class ItemsFetchMetadataController implements ControllerInterface
{
	public function validateInput(): Validator
	{
		return Validator::key('item-ids', Validator::arrayType()->notEmpty()->each(Validator::digit()->notEmpty())->setName('Item IDs'));
	}

	public function __invoke(array $input): ResponseInterface
	{
		$item_ids = $input['item-ids'];

		$repository = ServiceContainer::get(Repository::class);
		$items_urls = $repository->getItemsUrls($item_ids);

		if (empty($items_urls)) {
			throw new ValidationException('No items found with the provided IDs');
		}

		[$pages, $failed_reasons] = fetchMultiplePageHTML($items_urls);
		// Extract metadata from fetched pages HTML
		$metadata = [];
		array_walk($pages, function ($body, $url) use (&$metadata, &$failed_reasons) {
			$parser = new DOMParser($body);
			$title = $parser->extractTitle();
			$description = $parser->extractDescription();
			$image_url = $parser->extractImage();
			if ($image_url) {
				$image_url = resolveUrl($image_url, $url);
			}

			if (!isset($title) && !isset($description) && !isset($image_url)) {
				$failed_reasons[$url] = 'Failed to extract metadata';
				return;
			}
			$metadata[$url] = [$title, $description, $image_url];
		});
		unset($pages);

		$updated_items_count = 0;
		array_walk($metadata,
			function ($data, $url) use ($items_urls, &$updated_items_count, &$failed_reasons, $repository) {
				$item_ids = array_keys($items_urls, $url);
				[$title, $description, $image_url] = $data;
				$result = $repository->updateItemsMetadata($title ?? '', $description ?? '', $image_url ?? '', $item_ids);
				if (false === $result) {
					$failed_reasons[$url] = 'Failed to update item metadata in database';
					return;
				}

				// Clear local images regardless of whether the image URL is present or not,
				// to ensure that the next fetch will attempt to get the latest image version even if URL hasn't changed,
				// or to clear the local image if the image URL has been removed from the page.
				array_walk($item_ids, fn($item_id) => clearItemImageDirectory($item_id));

				$updated_items_count += count($item_ids);
			});

		$failed_items_count = count($items_urls) - $updated_items_count;
		$message_parts = [];
		if ($updated_items_count > 0) {
			$message_parts[] = "Successfully refetched $updated_items_count " . ($updated_items_count === 1 ? 'item' : 'items');
		}

		if ($failed_items_count > 0) {
			$message_parts[] = "Failed to refetch $failed_items_count " . ($updated_items_count === 1 ? 'item' : 'items');
			// TODO: Include failed reasons in the message
			/*$message_parts = array_merge($message_parts, array_map(
				fn ($url, $reason) => "$url: $reason",
				array_keys($failed_reasons),
				$failed_reasons
			));*/
		}
		$message = implode(". ", $message_parts);

		if ($updated_items_count === 0) {
			throw new ErrorException($message);
		}

		return success($message);
	}
}