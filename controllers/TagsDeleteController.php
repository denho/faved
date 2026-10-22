<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Exceptions\DataWriteException;
use Framework\Exceptions\ValidationException;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use function Framework\success;
use function Utils\groupTagsByParent;

class TagsDeleteController implements ControllerInterface
{
	public function __invoke(array $input): ResponseInterface
	{
		$tag_id = $input['tag-id'] ?? null;

		if (empty($tag_id)) {
			throw new ValidationException('Tag ID is required');
		}

		$repository = ServiceContainer::get(Repository::class);
		$all_tags = $repository->getTags();

		if (!isset($all_tags[$tag_id])) {
			throw new ValidationException("Tag with ID $tag_id does not exist");
		}

		$tags_by_parent = groupTagsByParent($all_tags);
		$tags_to_delete = [];
		$tag_ids_to_visit = [(int)$tag_id];

		while (!empty($tag_ids_to_visit)) {
			$current_tag_id = array_pop($tag_ids_to_visit);
			if (in_array($current_tag_id, $tags_to_delete, true)) {
				continue;
			}

			$tags_to_delete[] = $current_tag_id;
			foreach ($tags_by_parent[$current_tag_id] ?? [] as $child_tag_id) {
				$tag_ids_to_visit[] = $child_tag_id;
			}
		}

		// Delete tags associations with items
		$repository = ServiceContainer::get(Repository::class);
		$result = $repository->deleteTagsItemAttachment($tags_to_delete);

		if (false === $result) {
			throw new DataWriteException("Error removing tag item associations");
		}

		// Delete tags
		$result = $repository->deleteTags($tags_to_delete);

		if (false === $result) {
			throw new DataWriteException("Error deleting tag");
		}

		return success(
			(count($tags_to_delete) > 1 ? count($tags_to_delete) . ' tags' : 'Tag') . ' deleted successfully',
		);
	}

}
